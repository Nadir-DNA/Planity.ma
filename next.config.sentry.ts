
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config
};

export default withSentryConfig(nextConfig, {
  org: "nadir-dna",
  project: "planity-ma",
  silent: !process.env.CI,
});
