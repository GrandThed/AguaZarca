/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export when explicitly building for static hosting
  ...(process.env.STATIC_BUILD === 'true' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
