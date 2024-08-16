/* eslint-disable @typescript-eslint/no-var-requires */
// This replaces `const { getDefaultConfig } = require('expo/metro-config');`
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// This replaces `const config = getDefaultConfig(__dirname);`
const config = getSentryExpoConfig(__dirname, { annotateReactComponents: true });

config.transformer.minifierConfig = {
    compress: {
        drop_console: ['log', 'info']
    },
};

module.exports = config;
