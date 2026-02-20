// Dynamic Expo config so we can change API base URL per build.
// Usage:
//   EXPO_PUBLIC_API_URL="https://api.yourdomain.com/api/v1" npx expo start
//   EXPO_PUBLIC_API_URL="http://192.168.1.70:4000/api/v1" npx eas build -p android --profile preview

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

module.exports = ({ config }) => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || appJson.expo?.extra?.apiUrl || 'http://localhost:4000/api/v1';

  return {
    ...appJson.expo,
    // Expo merges extra; we set it explicitly so Constants.expoConfig.extra.apiUrl is stable.
    extra: {
      ...(appJson.expo?.extra || {}),
      apiUrl,
    },
  };
};
