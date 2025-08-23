/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration optimisée pour Vercel
  images: {
    unoptimized: true
  },
  // Configuration expérimentale
  experimental: {
    esmExternals: false
  },
  // Configuration pour éviter les erreurs de build
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig 