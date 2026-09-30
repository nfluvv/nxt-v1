import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts")

const nextConfig: NextConfig = {
  logging: {
    serverFunctions: false,
  },
  async headers() {
    return [
      {
        source: "/tonconnect-manifest.json",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Accept" },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)