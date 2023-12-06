const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support.
  isCSSEnabled: true,
});

config.transformer.minifierConfig.compress.drop_console = true;
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

module.exports = config;
