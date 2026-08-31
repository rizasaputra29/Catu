/** @type {import('next').NextConfig} */
const withSerwistInit = require("@serwist/next").default;

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  register: false,
});

const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.worldvectorlogo.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.seeklogo.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ]
  },
};

module.exports = withSerwist(nextConfig);
