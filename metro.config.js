/* eslint-disable @typescript-eslint/no-var-requires */
// This replaces `const { getDefaultConfig } = require('expo/metro-config');`

if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getDefaultConfig } = require('expo/metro-config');
    module.exports = getDefaultConfig(__dirname);
}
else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getSentryExpoConfig } = require("@sentry/react-native/metro");
    const config = getSentryExpoConfig(__dirname, { annotateReactComponents: true });

    config.transformer.minifierConfig = {
        compress: {
            drop_console: ['log', 'info']
        },
    };

    module.exports = config;
}