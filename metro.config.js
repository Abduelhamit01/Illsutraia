// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolution for the @env module
config.resolver.extraNodeModules = {
  '@env': require.resolve('./node_modules/react-native-dotenv')
};

module.exports = config; 