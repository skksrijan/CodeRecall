import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'firebase-admin', 'jwks-rsa', 'jose'];
    }
    return config;
  },
};

// Only wrap with Sentry in production builds to avoid dev overhead
const finalConfig = process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: "coderecall",
      project: "coderecall",
    }, {
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
    })
  : nextConfig;

export default finalConfig;
