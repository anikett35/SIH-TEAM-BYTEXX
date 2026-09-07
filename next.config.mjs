/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['images.unsplash.com', 'tile.openstreetmap.org', 'server.arcgisonline.com'],
  },
};

export default nextConfig;
