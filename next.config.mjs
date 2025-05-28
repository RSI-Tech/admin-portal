/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only set basePath in production when deployed as sub-application
  basePath: process.env.DEPLOY_AS_SUBAPP === 'true' ? '/admin-portal' : '',
  assetPrefix: process.env.DEPLOY_AS_SUBAPP === 'true' ? '/admin-portal' : '',
};

export default nextConfig;