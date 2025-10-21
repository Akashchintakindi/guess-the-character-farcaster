// next.config.js
import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019a0627-4856-ecfb-e5a5-061eeda1ada5',
        permanent: false,
      },
    ]
  },
}
 
export default nextConfig
