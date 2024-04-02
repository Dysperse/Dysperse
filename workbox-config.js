module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,ttf,ico,html,json,css}"],
  swDest: "dist/sw.js",
  // 2 gigabytes
  maximumFileSizeToCacheInBytes: 2 * 1024 * 1024 * 1024,
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};
