# Eureka Server - Service Discovery

## Description
Serveur de découverte de services pour l'architecture microservices SkillSphere.

## Port
8761

## Démarrage

### Dans IntelliJ
1. Ouvrir le projet `eureka-server`
2. Maven → Reload Project
3. Run `EurekaServerApplication.java`

### Vérification
Ouvrir: http://localhost:8761

Vous devriez voir le dashboard Eureka avec la liste des services enregistrés.

## Configuration

### application.properties
```properties
spring.application.name=eureka-server
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

## Services attendus

Une fois tous les services démarrés, vous devriez voir:
- `AUTH-SERVICE` (Port 8086)
- `COMPETITIONS-SERVICE` (Port 8087)
- `API-GATEWAY` (Port 8080)

## Dépendances

- Spring Boot 3.2.0
- Spring Cloud 2023.0.0
- Netflix Eureka Server

## Notes

- Démarrer ce service EN PREMIER avant tous les autres
- Les services mettent ~30 secondes pour s'enregistrer
- Le dashboard est accessible sans authentification
