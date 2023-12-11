const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const tailwind = require("tailwindcss/lib/cli/build");

module.exports = (async () => {
  /** @type {import('expo/metro-config').MetroConfig} */
  const config = getDefaultConfig(__dirname, {
    // Enable CSS support.
    isCSSEnabled: true,
  });

  config.transformer.minifierConfig.compress.drop_console = true;
  config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

  // Run Tailwind CLI to generate CSS files.
  await tailwind.build({
    "--input": path.relative(__dirname, "./global.css"),
    "--output": path.resolve(
      __dirname,
      "node_modules/.cache/expo/tailwind/eval.css"
    ),
    "--watch": process.env.NODE_ENV === "development" ? "always" : false,
    "--poll": true,
  });

  return withNativeWind(config, { input: "./global.css" });
})();
