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
  // Skip generating 404 and 500 routes - these are handled by App Router error boundaries
  generateStaticParams: async () => {
    return []
  },
  // Disable static optimization for error routes
  experimental: {
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig
