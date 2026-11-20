/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets a production build run beside `npm run dev` without sharing the .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
