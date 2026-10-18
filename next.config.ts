import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy (CSP)
 *
 * Configured in enforcing mode (`Content-Security-Policy`).
 * The policy has been tightened to permit only the assets, fonts, and external
 * endpoints that the application actually uses:
 * - `default-src 'self'`: Default fallback to same origin only.
 * - `script-src 'self' 'unsafe-inline'`: Permits Next.js scripts/runtime; includes
 *   `'unsafe-eval'` in development mode for React stack reconstruction.
 * - `style-src 'self' 'unsafe-inline'`: Permits Next.js styles, Tailwind CSS, and
 *   inline component styles (such as background grid styling on the landing page).
 * - `img-src 'self' blob: data: https://i.pravatar.cc`: Permits local images, data/blob
 *   URIs, and the third-party avatar host `https://i.pravatar.cc` (from issue A12).
 * - `font-src 'self'`: Permits self-hosted Google Fonts (Inter & Space Grotesk via next/font).
 * - `connect-src 'self' https://horizon-testnet.stellar.org`: Permits local APIs and Stellar
 *   Horizon testnet queries for transaction receipts.
 * - `object-src 'none'`: Prevents embedding Flash, Java, and other legacy plugin objects.
 * - `base-uri 'self'`: Restricts `<base>` tag URLs to preventing base tag hijacking.
 * - `form-action 'self'`: Restricts form submissions to the same origin.
 * - `frame-ancestors 'none'`: Disallows embedding in iframes (anti-clickjacking).
 * - `upgrade-insecure-requests`: Automatically upgrades HTTP requests to HTTPS.
 */
const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://i.pravatar.cc;
  font-src 'self';
  connect-src 'self' https://horizon-testnet.stellar.org;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

/**
 * Documented Security Headers
 *
 * Applied across all routes (`/:path*`) to establish defense-in-depth:
 * 1. Content-Security-Policy: Restricts resource loading, script execution, and outbound connections.
 * 2. Referrer-Policy: Prevents leaking full URLs and sensitive paths in the Referer header cross-origin.
 * 3. X-Content-Type-Options: Prevents MIME-type sniffing exploits (`nosniff`).
 * 4. Permissions-Policy: Restricts access to sensitive browser features (camera, mic, geolocation).
 * 5. X-Frame-Options: Clickjacking defense for user agents that do not support CSP `frame-ancestors`.
 * 6. Strict-Transport-Security: Enforces HTTPS connections and prevents SSL-stripping.
 * 7. X-DNS-Prefetch-Control: Manages DNS prefetching for privacy and latency optimization.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
