export const environment = {
  production: false,
  
  // API Gateway - Point d'entrée unique pour tous les microservices
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'ws://localhost:8086',
  
  // Backend Professional Events (port 8087)
  competitionsApiUrl: 'http://localhost:8087/api',
  
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
