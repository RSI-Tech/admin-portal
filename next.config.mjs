/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin-portal',
  assetPrefix: '/admin-portal',
  trailingSlash: true,
  // Add this to help with static file serving
  publicRuntimeConfig: {
    basePath: '/admin-portal',
  },
  // Remove standalone output as it interferes with CSS serving in sub-application deployment
  // Force CSS to be included
  webpack: (config, { isServer, dev }) => {
    // Ensure CSS modules are properly handled
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Force CSS extraction in production
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss|sass)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    
    return config;
  },
};

export default nextConfig;