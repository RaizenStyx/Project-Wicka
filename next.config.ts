import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Configure Server Actions Limit
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Matches your client-side check
    },
  },
  
  // 2. Image Config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cuvhuawqcuvycbopgrmi.supabase.co', 
        port: '',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', 
      },
    ],
  },
};

export default nextConfig;