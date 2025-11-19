/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Use standalone output for DigitalOcean deployment
  output: 'standalone',
  // Prevent static generation of error pages
  // This is the permanent fix for the Html import error
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
