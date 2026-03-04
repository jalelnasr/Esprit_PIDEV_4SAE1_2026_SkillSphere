# API Gateway 2

Spring Cloud Gateway for routing requests to microservices.

## Configuration

- **Port**: 8080
- **Service Name**: api-gateway
- **Eureka Registration**: http://localhost:8761/eureka

## Routes

| Route ID | Path | Target Service |
|----------|------|----------------|
| user-service | `/api/users/**` | USER-SERVICE |
| community-service | `/api/community/**` | COMMUNITY-SERVICE |

## Running the Gateway

```bash
cd apiGateway2
./mvnw spring-boot:run
```

## API Endpoints

### User Service Routes
- `GET/POST/PUT/DELETE /api/users/**` → User Microservice (port 8081)

### Community Service Routes  
- `GET/POST/PUT/DELETE /api/community/**` → Community Microservice (port 8082)

## Features

- **Load Balancing**: Routes requests to available service instances
- **CORS Support**: Cross-origin resource sharing enabled
- **Service Discovery**: Automatically discovers services via Eureka
- **Circuit Breaker**: Built-in resilience patterns

## Example Usage

```bash
# Get all users through gateway
curl http://localhost:8080/api/users

# Get community posts through gateway  
curl http://localhost:8080/api/community/posts
```
