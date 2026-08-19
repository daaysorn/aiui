import type { NextConfig } from "next"

import { getApiUrl } from "./lib/env"

const apiUrl = getApiUrl()

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${apiUrl}/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
