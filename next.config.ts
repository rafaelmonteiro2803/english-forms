import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Vercel compresses at the edge. Node's built-in gzip (used by `next start`)
  // holds back streamed Server Action responses, so it stays off.
  compress: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

export default nextConfig;
