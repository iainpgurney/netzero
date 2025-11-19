/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Use standalone output for DigitalOcean deployment
  output: 'standalone',
  // Prevent static generation of error pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Disable static optimization completely to prevent error page generation
  experimental: {
    // Disable static page generation
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig
