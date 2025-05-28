/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove basePath when running behind IIS sub-application
  // IIS handles the /admin-portal prefix
  basePath: process.env.DEPLOY_AS_SUBAPP === 'true' ? '' : '/admin-portal',
  assetPrefix: process.env.DEPLOY_AS_SUBAPP === 'true' ? '/admin-portal' : '/admin-portal',
  trailingSlash: false,
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