const { execSync } = require('child_process')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Use standalone output for DigitalOcean deployment
  output: 'standalone',
  reactStrictMode: true,
  // Use the git commit SHA so the build ID is stable within a deployment
  // and only changes when new code is pushed — allowing DO build cache to work.
  generateBuildId: async () => {
    try {
      return execSync('git rev-parse HEAD').toString().trim()
    } catch {
      return 'build-' + Date.now()
    }
  },
}

module.exports = nextConfig
