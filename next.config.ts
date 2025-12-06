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
    ],
  },
};

export default nextConfig;