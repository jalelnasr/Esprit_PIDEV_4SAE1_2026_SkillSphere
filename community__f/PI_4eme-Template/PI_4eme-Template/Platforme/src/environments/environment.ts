export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081',
  communityApiUrl: 'http://localhost:8081',
  wsUrl: 'ws://localhost:8080',
  supabase: {
    url: 'https://yvivroonarervdmbpbqz.supabase.co',
    publishableKey: 'sb_publishable_uVw27yhF8TsFVb_tm-hJAA_KVgE6VLE',
    voiceMessagesBucket: 'voice-messages',
    messageMediaBucket: 'voice-messages',
    maxVoiceSizeBytes: 5 * 1024 * 1024,
    maxImageSizeBytes: 10 * 1024 * 1024,
    maxVideoSizeBytes: 50 * 1024 * 1024
  },
  appName: 'SkillSphere',
  version: '1.0.0',

  features: {
    gamification: true,
    community: true,
    virtualLabs: true,
    blockchain: false,
    aiRecommendations: false
  }
};
