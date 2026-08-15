import crypto from 'crypto';

/**
 * SHA-256 hash string for Meta CAPI compliance (trimmed, lowercased)
 */
export function hashMetaUserData(str) {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str.trim().toLowerCase();
  if (!cleaned) return null;
  return crypto.createHash('sha256').update(cleaned).digest('hex');
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
  city = '',
  state = '',
  zipcode = '',
  country = 'India',
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

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const nameParts = fullName ? fullName.trim().split(/\s+/) : [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Standardized SHA-256 PII Hashing
    const hashedEmail = hashMetaUserData(email);
    const hashedPhone = hashMetaUserData(cleanPhone);
    const hashedFirstName = hashMetaUserData(firstName);
    const hashedLastName = hashMetaUserData(lastName);
    const hashedCity = hashMetaUserData(city);
    const hashedState = hashMetaUserData(state);
    const hashedZipcode = hashMetaUserData(zipcode);
    const hashedCountry = hashMetaUserData(country === 'India' ? 'in' : country);

    // Build comprehensive user_data object for maximum Event Match Quality (EMQ > 8.5)
    const userDataObj = {};
    if (hashedEmail) userDataObj.em = [hashedEmail];
    if (hashedPhone) userDataObj.ph = [hashedPhone];
    if (hashedFirstName) userDataObj.fn = [hashedFirstName];
    if (hashedLastName) userDataObj.ln = [hashedLastName];
    if (hashedCity) userDataObj.ct = [hashedCity];
    if (hashedState) userDataObj.st = [hashedState];
    if (hashedZipcode) userDataObj.zp = [hashedZipcode];
    if (hashedCountry) userDataObj.country = [hashedCountry];

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
