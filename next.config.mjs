import { withSentryConfig } from "@sentry/nextjs";

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
    hostname: 'upload.meeshosupplyassets.com',
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: "onyx-enterprises",
  project: "reenat",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",
});
