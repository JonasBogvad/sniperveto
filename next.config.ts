import type { NextConfig } from 'next';

const securityHeaders = [
  // Prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser feature APIs we don't use
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Content Security Policy
  // unsafe-inline is required for Next.js hydration scripts; no unsafe-eval in production
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Twitch + Kick avatars + data URIs for placeholders
      "img-src 'self' data: blob: https://static-cdn.jtvnw.net https://kick.com https://files.kick.com",
      "font-src 'self' https://fonts.gstatic.com",
      // API routes and NextAuth callbacks
      "connect-src 'self' https://va.vercel-scripts.com",
      // No frames anywhere
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      // OAuth redirects go through our own server (NextAuth), not direct form posts
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static-cdn.jtvnw.net', // Twitch avatars
      },
      {
        protocol: 'https',
        hostname: 'kick.com', // Kick avatars
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.kick.com', // Kick CDN avatars
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
