export const environment = {
  production: false,

  
  apiUrl: 'http://localhost:8087/user-service/api',

  formationApi: 'http://localhost:8087/formation-service/api',
  competitionsApiUrl: 'http://localhost:8080/api',

  wsUrl: 'ws://localhost:8087',
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
