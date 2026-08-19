import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/auth/sign-in", destination: "/sign-in", permanent: false },
      { source: "/auth/sign-up", destination: "/sign-up", permanent: false },
      {
        source: "/auth/forgot-password",
        destination: "/forgot-password",
        permanent: false,
      },
      { source: "/auth/callback", destination: "/callback", permanent: false },
      {
        source: "/auth/verify-email",
        destination: "/verify-email",
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      { source: "/sign-in", destination: "/auth/sign-in" },
      { source: "/sign-up", destination: "/auth/sign-up" },
      { source: "/forgot-password", destination: "/auth/forgot-password" },
      { source: "/callback", destination: "/auth/callback" },
      { source: "/verify-email", destination: "/auth/verify-email" },
    ]
  },
}

export default nextConfig
