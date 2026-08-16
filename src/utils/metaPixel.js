import crypto from 'crypto';

/**
 * SHA-256 hash string for Meta CAPI compliance (lowercase hex digest)
 */
export function sha256Hash(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().toLowerCase();
  if (!str) return null;
  // If already a 64-character SHA-256 hex string, return as-is
  if (/^[a-f0-9]{64}$/i.test(str)) {
    return str;
  }
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Backwards-compatible alias for sha256Hash
 */
export function hashMetaUserData(str) {
  return sha256Hash(str);
}

/**
 * Normalizes email: trim whitespace, convert to lowercase
 */
export function normalizeEmail(email) {
  if (!email) return null;
  const str = String(email).trim().toLowerCase();
  return str.includes('@') ? str : null;
}

/**
 * Normalizes phone number according to Meta CAPI specification:
 * - Remove non-digits
 * - Strip leading zeros
 * - Include country code (default 91 for India if 10 digits provided)
 */
export function normalizePhone(phone, defaultCountryCode = '91') {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  digits = digits.replace(/^0+/, ''); // strip leading zeroes
  // If 10 digits (standard Indian mobile number), prepend country code 91
  if (digits.length === 10 && defaultCountryCode) {
    digits = `${defaultCountryCode}${digits}`;
  }
  return digits;
}

/**
 * Normalizes name: trim, lowercase, remove punctuation & digits
 */
export function normalizeName(name) {
  if (!name) return null;
  const str = String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ');
  return str || null;
}

/**
 * Normalizes city: trim, lowercase, remove punctuation & special characters
 */
export function normalizeCity(city) {
  if (!city) return null;
  const str = String(city)
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '');
  return str || null;
}

/**
 * Normalizes state: trim, lowercase, remove punctuation
 */
export function normalizeState(state) {
  if (!state) return null;
  const str = String(state)
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, '');
  return str || null;
}

/**
 * Normalizes zip/pincode: trim, lowercase, remove whitespace and special characters
 */
export function normalizeZip(zip) {
  if (!zip) return null;
  const str = String(zip).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return str || null;
}

/**
 * Normalizes country: lowercase 2-letter ISO 3166-1 alpha-2 code
 */
export function normalizeCountry(country) {
  if (!country) return 'in';
  const str = String(country).trim().toLowerCase();
  if (str === 'india' || str === 'in' || str === 'ind') return 'in';
  if (str === 'united states' || str === 'usa' || str === 'us') return 'us';
  return str.slice(0, 2);
}

/**
 * Normalizes gender: single lowercase character 'm' or 'f'
 */
export function normalizeGender(gender) {
  if (!gender) return null;
  const str = String(gender).trim().toLowerCase();
  if (str.startsWith('m')) return 'm';
  if (str.startsWith('f')) return 'f';
  return null;
}

/**
 * Normalizes date of birth: YYYYMMDD format
 */
export function normalizeDateOfBirth(dob) {
  if (!dob) return null;
  const digits = String(dob).replace(/\D/g, '');
  if (digits.length === 8) return digits;
  return null;
}

/**
 * Extract Meta browser cookies (_fbp and _fbc) and user agent on the client side
 */
export function getMetaBrowserData() {
  if (typeof window === 'undefined') return {};
  try {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift() || null;
      return null;
    };
    return {
      fbp: getCookie('_fbp') || undefined,
      fbc: getCookie('_fbc') || undefined,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };
  } catch (err) {
    return {};
  }
}

/**
 * Standard client-side Meta Pixel tracking helper
 */
export function trackMetaPixel(eventName, customData = {}, eventId = null) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (eventId) {
        window.fbq('track', eventName, customData, { eventID: eventId });
      } else {
        window.fbq('track', eventName, customData);
      }
    } catch (err) {
      console.error(`Meta Pixel ${eventName} error:`, err);
    }
  }
}

/**
 * Send Meta Conversions API (CAPI) server-side event with full user_data parameters
 */
export async function sendMetaCapiEvent({
  eventName = 'Purchase',
  eventId,
  email = '',
  phone = '',
  fullName = '',
  firstName = '',
  lastName = '',
  city = '',
  state = '',
  zipcode = '',
  country = 'India',
  gender = '',
  dateOfBirth = '',
  externalId = '',
  value = 0,
  currency = 'INR',
  items = [],
  eventSourceUrl = 'https://www.reenattrends.com/cart',
  clientIpAddress = null,
  clientUserAgent = null,
  fbp = null,
  fbc = null,
  testEventCode = null
}) {
  try {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1600677861596675';
    const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.warn('Meta Pixel ID or CAPI Access Token missing. Skipping server event.');
      return { success: false, reason: 'Missing credentials' };
    }

    if (!eventId) {
      console.warn('Meta CAPI event skipped: eventId is required for deduplication.');
      return { success: false, reason: 'Missing eventId' };
    }

    // Resolve first & last names
    let fName = firstName;
    let lName = lastName;
    if (!fName && fullName) {
      const nameParts = String(fullName).trim().split(/\s+/);
      fName = nameParts[0] || '';
      lName = nameParts.slice(1).join(' ') || '';
    }

    // Standardized normalization & SHA-256 PII Hashing per Meta CAPI documentation
    const normEmail = normalizeEmail(email);
    const normPhone = normalizePhone(phone);
    const normFirstName = normalizeName(fName);
    const normLastName = normalizeName(lName);
    const normCity = normalizeCity(city);
    const normState = normalizeState(state);
    const normZip = normalizeZip(zipcode);
    const normCountry = normalizeCountry(country);
    const normGender = normalizeGender(gender);
    const normDob = normalizeDateOfBirth(dateOfBirth);
    const normExtId = externalId ? String(externalId).trim().toLowerCase() : null;

    const hashedEmail = sha256Hash(normEmail);
    const hashedPhone = sha256Hash(normPhone);
    const hashedFirstName = sha256Hash(normFirstName);
    const hashedLastName = sha256Hash(normLastName);
    const hashedCity = sha256Hash(normCity);
    const hashedState = sha256Hash(normState);
    const hashedZipcode = sha256Hash(normZip);
    const hashedCountry = sha256Hash(normCountry);
    const hashedGender = sha256Hash(normGender);
    const hashedDob = sha256Hash(normDob);
    const hashedExtId = sha256Hash(normExtId);

    // Build user_data object:
    // ALL PII fields must be arrays of SHA-256 hashed strings
    const userDataObj = {};
    if (hashedEmail) userDataObj.em = [hashedEmail];
    if (hashedPhone) userDataObj.ph = [hashedPhone];
    if (hashedFirstName) userDataObj.fn = [hashedFirstName];
    if (hashedLastName) userDataObj.ln = [hashedLastName];
    if (hashedCity) userDataObj.ct = [hashedCity];
    if (hashedState) userDataObj.st = [hashedState];
    if (hashedZipcode) userDataObj.zp = [hashedZipcode];
    if (hashedCountry) userDataObj.country = [hashedCountry];
    if (hashedGender) userDataObj.ge = [hashedGender];
    if (hashedDob) userDataObj.db = [hashedDob];
    if (hashedExtId) userDataObj.external_id = [hashedExtId];

    // Technical fields — must NOT be hashed per Meta spec
    if (clientIpAddress) userDataObj.client_ip_address = clientIpAddress;
    if (clientUserAgent) userDataObj.client_user_agent = clientUserAgent;
    if (fbp) userDataObj.fbp = fbp;
    if (fbc) userDataObj.fbc = fbc;

    const formattedContents = (items || []).map(item => ({
      id: String(item.id || item.variantId || item.productId || 'NSY10000001'),
      quantity: Number(item.qty || item.quantity || 1),
      item_price: Number(item.price || item.unit_price || 0)
    }));

    const testCode = testEventCode || process.env.META_TEST_EVENT_CODE || process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE || null;

    const capiPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url: eventSourceUrl,
          user_data: userDataObj,
          custom_data: {
            currency: currency || 'INR',
            value: Number(value || 0),
            content_type: 'product',
            contents: formattedContents
          }
        }
      ]
    };

    if (testCode) {
      capiPayload.test_event_code = testCode;
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capiPayload)
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`❌ Meta CAPI ${eventName} error:`, data);
      return { success: false, data };
    }

    console.log(`✅ Meta CAPI ${eventName} event recorded (event_id: ${eventId}):`, data);
    return { success: true, data };
  } catch (err) {
    console.error(`❌ Meta CAPI ${eventName} exception:`, err);
    return { success: false, error: err.message };
  }
}
