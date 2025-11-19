/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Use standalone output for DigitalOcean deployment
  output: 'standalone',
  reactStrictMode: true,
  // Prevent static generation of error pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
