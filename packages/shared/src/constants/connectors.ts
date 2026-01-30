import { ConnectorConfig, ConnectorType } from '../types';

export const CONNECTOR_CONFIGS: Record<ConnectorType, ConnectorConfig> = {
  [ConnectorType.GOOGLE]: {
    type: ConnectorType.GOOGLE,
    name: 'Google',
    description: 'Connect your Google account to import interests from YouTube, Search, and more',
    icon: 'google',
    availableScopes: [
      {
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        name: 'YouTube Read',
        description: 'View your YouTube activity including watch history and subscriptions',
        required: false
      },
      {
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
        name: 'Profile',
        description: 'View your basic profile information',
        required: true
      },
      {
        scope: 'https://www.googleapis.com/auth/userinfo.email',
        name: 'Email',
        description: 'View your email address',
        required: true
      }
    ],
    dataCategories: [
      {
        category: 'profile',
        name: 'Profile Information',
        description: 'Your name, profile picture, and basic info',
        examples: ['Display name', 'Profile photo']
      },
      {
        category: 'interests',
        name: 'Interests & Preferences',
        description: 'Topics and content you engage with',
        examples: ['YouTube subscriptions', 'Video categories watched']
      }
    ],
    supportsUpload: false
  },
  [ConnectorType.SPOTIFY]: {
    type: ConnectorType.SPOTIFY,
    name: 'Spotify',
    description: 'Connect Spotify to discover interests through your music taste',
    icon: 'spotify',
    availableScopes: [
      {
        scope: 'user-read-recently-played',
        name: 'Recently Played',
        description: 'View your recently played tracks',
        required: false
      },
      {
        scope: 'user-top-read',
        name: 'Top Items',
        description: 'View your top artists and tracks',
        required: true
      }
    ],
    dataCategories: [
      {
        category: 'interests',
        name: 'Music Interests',
        description: 'Your music preferences and listening habits',
        examples: ['Favorite genres', 'Top artists', 'Listening patterns']
      }
    ],
    supportsUpload: false
  },
  [ConnectorType.YOUTUBE]: {
    type: ConnectorType.YOUTUBE,
    name: 'YouTube',
    description: 'Connect YouTube directly for detailed video interests',
    icon: 'youtube',
    availableScopes: [
      {
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        name: 'YouTube Read',
        description: 'View your YouTube activity',
        required: true
      }
    ],
    dataCategories: [
      {
        category: 'interests',
        name: 'Video Interests',
        description: 'Topics from videos you watch and channels you follow',
        examples: ['Subscribed channels', 'Video categories', 'Watch history topics']
      }
    ],
    supportsUpload: false
  },
  [ConnectorType.DISCORD]: {
    type: ConnectorType.DISCORD,
    name: 'Discord',
    description: 'Connect Discord to find interests from your communities',
    icon: 'discord',
    availableScopes: [
      {
        scope: 'identify',
        name: 'Identity',
        description: 'View your Discord profile',
        required: true
      },
      {
        scope: 'guilds',
        name: 'Servers',
        description: 'View servers you are a member of',
        required: false
      }
    ],
    dataCategories: [
      {
        category: 'interests',
        name: 'Community Interests',
        description: 'Topics from Discord communities you participate in',
        examples: ['Server themes', 'Community topics']
      }
    ],
    supportsUpload: false
  },
  [ConnectorType.INSTAGRAM]: {
    type: ConnectorType.INSTAGRAM,
    name: 'Instagram',
    description: 'Connect Instagram to discover interests from your social activity',
    icon: 'instagram',
    availableScopes: [
      {
        scope: 'user_profile',
        name: 'Profile',
        description: 'View your Instagram profile',
        required: true
      }
    ],
    dataCategories: [
      {
        category: 'interests',
        name: 'Social Interests',
        description: 'Topics from accounts you follow and content you engage with',
        examples: ['Followed accounts themes', 'Interest hashtags']
      }
    ],
    supportsUpload: false
  },
  [ConnectorType.TWITTER]: {
    type: ConnectorType.TWITTER,
    name: 'X (Twitter)',
    description: 'Connect X to discover interests from your timeline',
    icon: 'twitter',
    availableScopes: [
      {
        scope: 'tweet.read',
        name: 'Read Tweets',
        description: 'View tweets on your timeline',
        required: true
      },
      {
        scope: 'users.read',
        name: 'Read Profile',
        description: 'View your profile information',
        required: true
      }
    ],
    dataCategories: [
      {
        category: 'interests',
        name: 'Topic Interests',
        description: 'Topics from accounts you follow and engage with',
        examples: ['Followed accounts', 'Engaged topics', 'Lists']
      }
    ],
    supportsUpload: false
  },
  [ConnectorType.UPLOAD]: {
    type: ConnectorType.UPLOAD,
    name: 'File Upload',
    description: 'Upload files to import your interests manually',
    icon: 'upload',
    availableScopes: [],
    dataCategories: [
      {
        category: 'interests',
        name: 'Imported Interests',
        description: 'Interests from your uploaded files',
        examples: ['CSV lists', 'JSON exports', 'Text lists']
      }
    ],
    supportsUpload: true
  },
  [ConnectorType.MANUAL]: {
    type: ConnectorType.MANUAL,
    name: 'Manual Entry',
    description: 'Manually add your interests and preferences',
    icon: 'edit',
    availableScopes: [],
    dataCategories: [
      {
        category: 'interests',
        name: 'Manual Interests',
        description: 'Interests you add yourself',
        examples: ['Hobbies', 'Skills', 'Goals']
      }
    ],
    supportsUpload: false
  }
};

export const SUPPORTED_UPLOAD_FORMATS = [
  { extension: 'csv', mimeType: 'text/csv', name: 'CSV' },
  { extension: 'json', mimeType: 'application/json', name: 'JSON' },
  { extension: 'txt', mimeType: 'text/plain', name: 'Text' }
];

export const MAX_UPLOAD_SIZE_MB = 10;
