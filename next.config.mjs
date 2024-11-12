/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['nodemailer']
  },
  eslint: {
    // 暫時忽略某些 ESLint 警告
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 暫時忽略 TypeScript 錯誤
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;