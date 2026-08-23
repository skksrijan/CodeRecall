import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  silent: true,
  org: "coderecall",
  project: "coderecall",
}, {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  disableLogger: true,
});
