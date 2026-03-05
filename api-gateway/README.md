# API Gateway - Point d'entrée unique

## Description
Gateway pour router les requêtes vers les microservices appropriés.

## Port
8080

## Démarrage

### Dans IntelliJ
1. Ouvrir le projet `api-gateway`
2. Maven → Reload Project
3. Run `ApiGatewayApplication.java`

### Prérequis
- Eureka Server doit être démarré (Port 8761)
- Les microservices doivent être enregistrés dans Eureka

## Routes configurées

| Path                    | Service cible          | Port |
|------------------------|------------------------|------|
| /api/auth/**           | auth-service           | 8086 |
| /api/competitions/**   | competitions-service   | 8087 |

## Configuration CORS

Origines autorisées:
- http://localhost:4200
- http://localhost:4201

Méthodes autorisées:
- GET, POST, PUT, DELETE, PATCH, OPTIONS

## Endpoints de monitoring

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Routes actives
```bash
curl http://localhost:8080/actuator/gateway/routes
```

## Tests

### Via Gateway - Auth
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","motDePasse":"test123"}'
```

### Via Gateway - Competitions
```bash
curl http://localhost:8080/api/competitions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Configuration

### application.yml
- Routes dynamiques via Eureka (lb://)
- CORS global
- Actuator endpoints activés

## Dépendances

- Spring Boot 3.2.0
- Spring Cloud Gateway
- Spring Cloud Netflix Eureka Client
- Spring Boot Actuator

## Notes

- Démarrer APRÈS Eureka et les microservices
- Utilise le load balancing automatique (lb://)
- Les routes sont résolues dynamiquement via Eureka
