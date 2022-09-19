// @ts-check

/**
 * @type {import("next").NextConfig}
 */
module.exports = {
  cleanDistDir: true,
  reactStrictMode: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  experimental: {
    browsersListForSwc: true,
    legacyBrowsers: false,
  },
};
