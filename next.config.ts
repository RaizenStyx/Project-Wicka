import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Configure Server Actions Limit
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Matches your client-side check
    },
  },
  
  // 2. Your Existing Image Config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cuvhuawqcuvycbopgrmi.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**', 
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Allow the placeholder site
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // You'll likely need this later for user uploads
      },
      {
        protocol: 'https',
        hostname: 'supa_project_id.supabase.co', 
      }
    ],
  },
};

export default nextConfig;