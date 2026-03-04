# Eureka Server 2

Spring Boot Eureka Server for microservice discovery.

## Configuration

- **Port**: 8761
- **Service Name**: eureka-server
- **Dashboard**: http://localhost:8761

## Running the Server

```bash
cd eureka2
./mvnw spring-boot:run
```

## Accessing Eureka Dashboard

Open your browser and navigate to: http://localhost:8761

## What it does

- Acts as service registry for all microservices
- Enables service discovery and load balancing
- Provides dashboard to monitor registered services

## Registered Services

Once running, the following services will register:
- **USER-SERVICE**: User management microservice (port 8081)
- **COMMUNITY-SERVICE**: Community microservice (port 8082)
- **API-GATEWAY**: API Gateway (port 8080)
