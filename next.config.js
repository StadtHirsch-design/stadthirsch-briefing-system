/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for fresh builds
  staticPageGenerationTimeout: 120,
  // Ensure no caching issues
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
