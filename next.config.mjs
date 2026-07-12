/** @type {import('next').NextConfig} */
const remotePatterns = [
  {
    protocol: 'https',
    hostname: '**.supabase.co',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'reenat-trends.vercel.app',
  },
  {
    protocol: 'https',
    hostname: '**.sslip.io',
  },
  {
    protocol: 'http',
    hostname: '**.sslip.io',
  },
];

// Dynamically extract and whitelist local development supabase host if configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
    });
    if (parsed.protocol === 'http:') {
      remotePatterns.push({
        protocol: 'https',
        hostname: parsed.hostname,
      });
    } else {
      remotePatterns.push({
        protocol: 'http',
        hostname: parsed.hostname,
      });
    }
  } catch (e) {
    console.error("Failed to parse NEXT_PUBLIC_SUPABASE_URL in next.config.mjs:", e);
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

// Triggering rebuild for HTTPS database endpoint and passcode sync
export default nextConfig;
