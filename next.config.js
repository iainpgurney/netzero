/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Disable static export to prevent error page generation issues
  output: 'standalone',
  // Ensure error pages are not statically generated
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig

