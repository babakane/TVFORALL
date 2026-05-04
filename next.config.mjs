/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/TVFORALL' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/TVFORALL' : '',
}

export default nextConfig
