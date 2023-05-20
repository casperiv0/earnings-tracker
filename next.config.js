// @ts-check

/**
 * @type {import("next").NextConfig}
 */
module.exports = {
  cleanDistDir: true,
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: true,
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
};
