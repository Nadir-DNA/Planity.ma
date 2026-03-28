/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.planity.ma",
      },
    ],
  },
};

export default nextConfig;
