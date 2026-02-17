// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8080',
  appName: 'SkillSphere',
  version: '1.0.0',
  
  // Feature flags
  features: {
    gamification: true,
    community: true,
    virtualLabs: true,
    blockchain: false,
    aiRecommendations: false
  }
};
