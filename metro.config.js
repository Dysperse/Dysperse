// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  /** @type {import('expo/metro-config').MetroConfig} */
  const config = getDefaultConfig(__dirname, {
    // Enable CSS support.
    isCSSEnabled: true,
  });

  config.transformer.minifierPath = require.resolve("metro-minify-esbuild");
  config.transformer.minifierConfig = {
    drop: ["console"],
  };
  // config.transformer.minifierConfig.compress.drop_console = true;
  config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

  return config;
})();
