export const environment = {
  production: true,
  apiUrl: 'https://api.skillsphere.com/api',
  communityApiUrl: 'https://api.skillsphere.com',
  wsUrl: 'wss://api.skillsphere.com',
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
