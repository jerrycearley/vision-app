// Metro configuration for Expo (SDK 50)
// We disable package exports resolution because some dependencies (e.g. axios)
// can accidentally resolve to their Node build, which breaks React Native bundling.
//
// See: https://docs.expo.dev/guides/customizing-metro/

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...(config.resolver || {}),
  // Prefer RN/browser entrypoints.
  resolverMainFields: ['react-native', 'browser', 'module', 'main'],
  // Avoid conditional exports picking Node CJS builds.
  unstable_enablePackageExports: false,
};

module.exports = config;
