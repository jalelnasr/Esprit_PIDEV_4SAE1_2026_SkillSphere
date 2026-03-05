# 🛣️ Configuration des Routes - API Gateway

## 📋 Routes configurées

### 1. Authentication (Auth Service)
**Route**: `/api/auth/**`  
**Service cible**: `auth-service` (Port 8086)  
**Exemples**:
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

---

### 2. User Management (Auth Service)
**Route**: `/api/users/**`  
**Service cible**: `auth-service` (Port 8086)  
**Exemples**:
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/{id}` - Détails d'un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur
- `GET /api/users/profile` - Profil de l'utilisateur connecté
- `PUT /api/users/profile` - Modifier son profil

---

### 3. Competitions (Competitions Service)
**Route**: `/api/competitions/**`  
**Service cible**: `competitions-service` (Port 8087)  
**Exemples**:
- `GET /api/competitions` - Liste des compétitions
- `POST /api/competitions` - Créer une compétition
- `GET /api/competitions/{id}` - Détails d'une compétition
- `PUT /api/competitions/{id}` - Modifier une compétition
- `DELETE /api/competitions/{id}` - Supprimer une compétition
- `POST /api/competitions/{id}/register` - S'inscrire à une compétition
- `GET /api/competitions/{id}/teams` - Liste des équipes
- `POST /api/competitions/{id}/teams/{teamId}/join` - Rejoindre une équipe

---

### 4. Tasks Management (Auth Service)
**Route**: `/api/tasks/**`  
**Service cible**: `auth-service` (Port 8086)  
**Exemples**:
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `GET /api/tasks/{id}` - Détails d'une tâche
- `PUT /api/tasks/{id}` - Modifier une tâche
- `DELETE /api/tasks/{id}` - Supprimer une tâche
- `PUT /api/tasks/{id}/status` - Changer le statut d'une tâche
- `GET /api/tasks/my-tasks` - Mes tâches

---

## 🔄 Flux de routage

```
Frontend (localhost:4200)
    │
    │ Requête HTTP
    ↓
API Gateway (localhost:8080)
    │
    ├─ /api/auth/**        → auth-service (8086)
    ├─ /api/users/**       → auth-service (8086)
    ├─ /api/tasks/**       → auth-service (8086)
    └─ /api/competitions/** → competitions-service (8087)
```

---

## 📊 Tableau récapitulatif

| Route                    | Service cible          | Port | Description                |
|-------------------------|------------------------|------|----------------------------|
| `/api/auth/**`          | auth-service           | 8086 | Authentification           |
| `/api/users/**`         | auth-service           | 8086 | Gestion des utilisateurs   |
| `/api/tasks/**`         | auth-service           | 8086 | Gestion des tâches         |
| `/api/competitions/**`  | competitions-service   | 8087 | Gestion des compétitions   |

---

## 🔐 Authentification

Toutes les routes (sauf `/api/auth/login` et `/api/auth/register`) nécessitent un token JWT:

```
Authorization: Bearer <token>
```

---

## 🧪 Tests des routes

### 1. Authentication
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","motDePasse":"test123"}'
```

### 2. User Management
```bash
# Get user profile
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all users
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Tasks Management
```bash
# Get my tasks
curl http://localhost:8080/api/tasks/my-tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Ma tâche","description":"Description"}'
```

### 4. Competitions
```bash
# Get competitions
curl http://localhost:8080/api/competitions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create competition
curl -X POST http://localhost:8080/api/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"titre":"Ma compétition","description":"Description"}'
```

---

## 🎯 Configuration CORS

Toutes les routes acceptent les requêtes depuis:
- `http://localhost:4200`
- `http://localhost:4201`

Méthodes autorisées:
- GET, POST, PUT, DELETE, PATCH, OPTIONS

Headers autorisés:
- Tous (`*`)

---

## 📝 Notes importantes

1. **Load Balancing**: Le préfixe `lb://` active le load balancing automatique via Eureka
2. **Service Discovery**: Les services sont découverts dynamiquement via Eureka
3. **StripPrefix=0**: Conserve le chemin complet lors du routage
4. **CORS**: Géré globalement par la Gateway

---

## 🔧 Ajouter une nouvelle route

Pour ajouter une nouvelle route, modifier `application.yml`:

```yaml
- id: nouvelle-route
  uri: lb://nom-du-service
  predicates:
    - Path=/api/nouveau-path/**
  filters:
    - StripPrefix=0
```

Puis redémarrer l'API Gateway.

---

## ✅ Vérification

Pour voir toutes les routes actives:
```bash
curl http://localhost:8080/actuator/gateway/routes
```

