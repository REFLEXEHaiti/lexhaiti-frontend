/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: 'https', hostname: '*.supabase.co' },
      // Unsplash (illustrations)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // YouTube thumbnails
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
};

export default nextConfig;
