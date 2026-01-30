export enum ConnectorType {
  GOOGLE = 'google',
  SPOTIFY = 'spotify',
  YOUTUBE = 'youtube',
  DISCORD = 'discord',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  UPLOAD = 'upload',
  MANUAL = 'manual',
}

export enum ConnectorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}
