# 📋 DOCUMENTATION COMPLÈTE DU PROJET - PROFESSIONAL EVENTS

## 🏗️ ARCHITECTURE DU PROJET

### Architecture Microservices
Le projet utilise une **architecture microservices** avec les composants suivants:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                        │
│                   Port: 4200                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY                                │
│                   Port: 8888                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  PlatformeBack   │                  │ Professional     │
│  (Auth Service)  │                  │ Events Service   │
│  Port: 8081      │                  │ Port: 8087       │
│  DB: auth_db     │                  │ DB: professional │
└──────────────────┘                  │    _events_db    │
                                      └──────────────────┘
        ↑                                       ↑
        └───────────────────┬───────────────────┘
                            ↓
                  ┌──────────────────┐
                  │  Eureka Server   │
                  │  (Discovery)     │
                  │  Port: 8761      │
                  └──────────────────┘
```

---

## 🎯 MICROSERVICES DÉTAILLÉS

### 1. **Eureka Server** (Service Discovery)
- **Port**: 8761
- **Rôle**: Registre de services pour la découverte automatique
- **Technologie**: Spring Cloud Netflix Eureka
- **URL**: http://localhost:8761

### 2. **API Gateway**
- **Port**: 8888
- **Rôle**: Point d'entrée unique, routage des requêtes
- **Technologie**: Spring Cloud Gateway
- **URL**: http://localhost:8888

### 3. **PlatformeBack** (Service d'Authentification)
- **Port**: 8081
- **Base de données**: `auth_db` (MySQL)
- **Rôle**: Gestion des utilisateurs, authentification, autorisation
- **Technologies**: Spring Boot, Spring Security, JWT
- **Entités principales**:
  - User (id, nom, prenom, email, password, role)
  - Roles: ADMIN, FORMATEUR, APPRENANT, RH_ENTREPRISE

### 4. **Professional Events Service**
- **Port**: 8087
- **Base de données**: `professional_events_db` (MySQL)
- **Rôle**: Gestion des compétitions/événements professionnels
- **Technologies**: Spring Boot, JPA, Twilio SMS, WebSocket
- **Entités principales**:
  - Competition
  - Participant
  - Team
  - ChatMessage
  - Notification

### 5. **Frontend Angular**
- **Port**: 4200
- **Framework**: Angular 18 (Standalone Components)
- **Technologies**: TypeScript, RxJS, Chart.js, WebSocket
- **URL**: http://localhost:4200

---

## 📊 ENTITÉS ET MODÈLES DE DONNÉES

### Service Professional Events

#### 1. **Competition** (Compétition)
```java
- competitionId: Long (PK)
- title: String
- description: String
- type: String (HACKATHON, CODING_CHALLENGE, DESIGN_CONTEST)
- status: String (OPEN, CLOSED, ONGOING)
- participationType: String (INDIVIDUAL, TEAM)
- startDate: LocalDateTime
- endDate: LocalDateTime
- maxParticipants: Integer
- formateurId: Long (FK vers User)
- createdAt: LocalDateTime
```

#### 2. **Participant**
```java
- participantId: Long (PK)
- userId: Long (FK vers User)
- competitionId: Long (FK vers Competition)
- teamId: Long (FK vers Team, nullable)
- score: Integer
- registrationDate: LocalDateTime
- createdAt: LocalDateTime
```

#### 3. **Team** (Équipe)
```java
- teamId: Long (PK)
- teamName: String
- competitionId: Long (FK vers Competition)
- createdBy: Long (FK vers User)
- maxMembers: Integer
- createdAt: LocalDateTime
```

#### 4. **ChatMessage** (Messages de chat)
```java
- messageId: Long (PK)
- competitionId: Long (FK vers Competition)
- senderId: Long (FK vers User)
- senderName: String
- content: String
- timestamp: LocalDateTime
- type: String (TEXT, JOIN, LEAVE)
```

#### 5. **Notification**
```java
- notificationId: Long (PK)
- userId: Long (FK vers User)
- message: String
- type: String (INFO, SUCCESS, WARNING, ERROR)
- isRead: Boolean
- createdAt: LocalDateTime
```

---

## 🔌 APIs IMPLÉMENTÉES

### 1. **Competition API** (`/api/competitions`)

#### Endpoints CRUD de base:
- `GET /api/competitions` - Liste toutes les compétitions
- `GET /api/competitions/{id}` - Détails d'une compétition
- `POST /api/competitions` - Créer une compétition (FORMATEUR)
- `PUT /api/competitions/{id}` - Modifier une compétition (FORMATEUR)
- `DELETE /api/competitions/{id}` - Supprimer une compétition (FORMATEUR)

#### Endpoints de participation:
- `POST /api/competitions/{id}/register` - S'inscrire à une compétition
- `POST /api/competitions/{id}/unregister` - Se désinscrire
- `GET /api/competitions/{id}/participants` - Liste des participants
- `GET /api/competitions/user/{userId}` - Compétitions d'un utilisateur

#### Endpoints de gestion:
- `GET /api/competitions/formateur/{formateurId}` - Compétitions d'un formateur
- `PUT /api/competitions/{id}/status` - Changer le statut

---

### 2. **Team API** (`/api/teams`)

- `POST /api/teams` - Créer une équipe
- `GET /api/teams/competition/{competitionId}` - Équipes d'une compétition
- `GET /api/teams/{teamId}` - Détails d'une équipe
- `POST /api/teams/{teamId}/join` - Rejoindre une équipe
- `POST /api/teams/{teamId}/leave` - Quitter une équipe
- `DELETE /api/teams/{teamId}` - Supprimer une équipe
- `GET /api/teams/{teamId}/members` - Membres d'une équipe

---

### 3. **Leaderboard API** (`/api/leaderboard`)

- `GET /api/leaderboard/competition/{competitionId}` - Classement d'une compétition
- `PUT /api/leaderboard/participant/{participantId}/score` - Mettre à jour le score

---

### 4. **Chat API** (`/api/chat`)

- `GET /api/chat/competition/{competitionId}` - Historique des messages
- `POST /api/chat/send` - Envoyer un message
- WebSocket: `/ws/chat` - Chat en temps réel

---

### 5. **SMS API** (`/api/sms`)

- `POST /api/sms/send` - Envoyer un SMS individuel
- `POST /api/sms/broadcast/{competitionId}` - Envoyer SMS à tous les participants
- `GET /api/sms/history/{competitionId}` - Historique des SMS

---

### 6. **Notification API** (`/api/notifications`)

- `GET /api/notifications/user/{userId}` - Notifications d'un utilisateur
- `GET /api/notifications/user/{userId}/unread` - Notifications non lues
- `PUT /api/notifications/{id}/read` - Marquer comme lu
- `PUT /api/notifications/user/{userId}/read-all` - Tout marquer comme lu
- `DELETE /api/notifications/{id}` - Supprimer une notification

---

### 7. **Dashboard API** (`/api/dashboard`)

- `GET /api/dashboard/stats` - Statistiques globales
- `POST /api/dashboard/competitions/filter` - Filtrer les compétitions
- `GET /api/dashboard/competitions/search?q={term}` - Rechercher

**Statistiques retournées**:
- Nombre total de compétitions
- Compétitions actives/terminées
- Nombre total de participants
- Nombre d'équipes
- Nombre de messages
- Taux de participation
- Répartition par type/statut
- Évolution mensuelle (6 mois)
- Top 5 compétitions
- Statistiques de messages

---

## 🛠️ FONCTIONNALITÉS IMPLÉMENTÉES

### 1. **Gestion des Compétitions**
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Filtrage par type, statut, dates
- ✅ Recherche dynamique
- ✅ Gestion des inscriptions
- ✅ Validation des contraintes (max participants, dates)

### 2. **Système d'Équipes**
- ✅ Création d'équipes
- ✅ Rejoindre/Quitter une équipe
- ✅ Gestion des membres
- ✅ Limite de membres par équipe
- ✅ Affichage des équipes complètes

### 3. **Classement (Leaderboard)**
- ✅ Classement en temps réel
- ✅ Podium (Top 3)
- ✅ Tableau complet des participants
- ✅ Mise à jour des scores
- ✅ Affichage des médailles

### 4. **Chat en Temps Réel**
- ✅ WebSocket pour communication instantanée
- ✅ Messages par compétition
- ✅ Historique des messages
- ✅ Notifications de connexion/déconnexion

### 5. **Notifications**
- ✅ Système de notifications en temps réel
- ✅ Badge de compteur non lus
- ✅ Centre de notifications (dropdown)
- ✅ Marquer comme lu
- ✅ Notifications automatiques (80%) et manuelles (20%)

### 6. **SMS (Twilio)**
- ✅ Envoi de SMS individuels
- ✅ Broadcast SMS à tous les participants
- ✅ Historique des SMS envoyés
- ✅ Statistiques d'envoi

### 7. **Dashboard Statistiques**
- ✅ 8 cartes de statistiques
- ✅ 3 graphiques (Chart.js):
  - Pie chart: Répartition par type
  - Doughnut chart: Répartition par statut
  - Line chart: Évolution mensuelle
- ✅ Top 5 compétitions
- ✅ Statistiques de messages
- ✅ Filtrage avancé
- ✅ Recherche rapide

### 8. **Internationalisation (i18n)**
- ✅ Support Français/Anglais
- ✅ Sélecteur de langue
- ✅ Traductions complètes

### 9. **Mode Dark/Light**
- ✅ Toggle thème
- ✅ Persistance du choix
- ✅ Styles adaptés

### 10. **Authentification & Autorisation**
- ✅ JWT Token
- ✅ Guards Angular
- ✅ Rôles: ADMIN, FORMATEUR, APPRENANT
- ✅ Protection des routes

---

## 📁 STRUCTURE DES FICHIERS

### Backend - Professional Events Service

```
Professional Events/
├── src/main/java/org/example/professional_events/
│   ├── controller/
│   │   ├── CompetitionController.java
│   │   ├── TeamController.java
│   │   ├── LeaderboardController.java
│   │   ├── ChatController.java
│   │   ├── SmsController.java
│   │   ├── NotificationController.java
│   │   └── DashboardController.java
│   ├── service/
│   │   ├── CompetitionService.java
│   │   ├── TeamService.java
│   │   ├── LeaderboardService.java
│   │   ├── ChatService.java
│   │   ├── SmsService.java
│   │   ├── NotificationService.java
│   │   └── DashboardService.java
│   ├── repository/
│   │   ├── CompetitionRepository.java
│   │   ├── ParticipantRepository.java
│   │   ├── TeamRepository.java
│   │   ├── ChatMessageRepository.java
│   │   └── NotificationRepository.java
│   ├── entity/
│   │   ├── Competition.java
│   │   ├── Participant.java
│   │   ├── Team.java
│   │   ├── ChatMessage.java
│   │   └── Notification.java
│   ├── dto/
│   │   ├── DashboardStatsDTO.java
│   │   ├── MonthlyStatsDTO.java
│   │   ├── CompetitionStatsDTO.java
│   │   ├── CompetitionMessageStatsDTO.java
│   │   └── CompetitionFilterDTO.java
│   └── config/
│       ├── WebSocketConfig.java
│       └── CorsConfig.java
└── src/main/resources/
    └── application.properties
```

### Frontend - Angular

```
Platforme/src/app/
├── features/
│   ├── competitions/
│   │   ├── pages/
│   │   │   ├── competition-list/
│   │   │   ├── competition-detail/
│   │   │   ├── competition-create/
│   │   │   ├── competition-manage/
│   │   │   ├── competition-leaderboard/
│   │   │   ├── formateur-dashboard/
│   │   │   ├── my-participations/
│   │   │   └── sms-management/
│   │   └── competitions.routes.ts
│   ├── auth/
│   ├── dashboard/
│   └── home/
├── core/
│   ├── services/
│   │   ├── competition.service.ts
│   │   ├── team.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── chat.service.ts
│   │   ├── sms.service.ts
│   │   ├── notification.service.ts
│   │   └── dashboard.service.ts
│   ├── models/
│   │   ├── competition.model.ts
│   │   ├── team.model.ts
│   │   └── notification.model.ts
│   └── guards/
│       ├── auth.guard.ts
│       └── role.guard.ts
├── shared/
│   └── components/
│       ├── notification-center/
│       └── language-selector/
└── layout/
    ├── sidebar/
    └── topbar/
```

---

## 🚀 ÉTAPES D'IMPLÉMENTATION

### Phase 1: Configuration de Base (Semaine 1)
1. ✅ Configuration Eureka Server
2. ✅ Configuration API Gateway
3. ✅ Configuration PlatformeBack (Auth)
4. ✅ Configuration Professional Events Service
5. ✅ Configuration Frontend Angular
6. ✅ Configuration des bases de données MySQL

### Phase 2: Entités et Repositories (Semaine 2)
1. ✅ Création entité Competition
2. ✅ Création entité Participant
3. ✅ Création entité Team
4. ✅ Création entité ChatMessage
5. ✅ Création entité Notification
6. ✅ Création des repositories JPA

### Phase 3: Services Backend (Semaine 3-4)
1. ✅ CompetitionService (CRUD + logique métier)
2. ✅ TeamService (gestion équipes)
3. ✅ LeaderboardService (classement)
4. ✅ ChatService (WebSocket)
5. ✅ SmsService (Twilio)
6. ✅ NotificationService
7. ✅ DashboardService (statistiques)

### Phase 4: Controllers/APIs (Semaine 5)
1. ✅ CompetitionController (7 endpoints)
2. ✅ TeamController (7 endpoints)
3. ✅ LeaderboardController (2 endpoints)
4. ✅ ChatController (2 endpoints + WebSocket)
5. ✅ SmsController (3 endpoints)
6. ✅ NotificationController (5 endpoints)
7. ✅ DashboardController (3 endpoints)

### Phase 5: Frontend - Services Angular (Semaine 6)
1. ✅ CompetitionService
2. ✅ TeamService
3. ✅ LeaderboardService
4. ✅ ChatService (WebSocket)
5. ✅ SmsService
6. ✅ NotificationService
7. ✅ DashboardService

### Phase 6: Frontend - Composants (Semaine 7-8)
1. ✅ competition-list (liste + filtres)
2. ✅ competition-detail (détails + inscription)
3. ✅ competition-create (formulaire création)
4. ✅ competition-manage (gestion formateur)
5. ✅ competition-leaderboard (podium + tableau)
6. ✅ formateur-dashboard (statistiques + graphiques)
7. ✅ my-participations (mes inscriptions)
8. ✅ sms-management (envoi SMS)
9. ✅ notification-center (centre notifications)
10. ✅ language-selector (i18n)

### Phase 7: Fonctionnalités Avancées (Semaine 9)
1. ✅ WebSocket Chat temps réel
2. ✅ Notifications automatiques
3. ✅ Dashboard avec Chart.js
4. ✅ Filtrage et recherche dynamique
5. ✅ Mode Dark/Light
6. ✅ Internationalisation (FR/EN)

### Phase 8: Tests et Déploiement (Semaine 10)
1. ✅ Tests unitaires backend
2. ✅ Tests d'intégration
3. ✅ Scripts de démarrage PowerShell
4. ✅ Documentation complète
5. ✅ Validation finale

---

## 🗄️ BASE DE DONNÉES

### Database: `professional_events_db`

#### Tables:
1. **competition** (11 colonnes)
2. **participant** (7 colonnes)
3. **team** (6 colonnes)
4. **chat_message** (7 colonnes)
5. **notification** (6 colonnes)

### Database: `auth_db`

#### Tables:
1. **user** (7 colonnes)
2. **role** (2 colonnes)

---

## 🔧 TECHNOLOGIES UTILISÉES

### Backend:
- Java 17
- Spring Boot 3.x
- Spring Cloud (Eureka, Gateway)
- Spring Data JPA
- Spring Security + JWT
- Spring WebSocket
- MySQL 8.0
- Twilio API (SMS)
- Maven

### Frontend:
- Angular 18 (Standalone)
- TypeScript 5.x
- RxJS
- Chart.js
- WebSocket (SockJS + Stomp)
- Bootstrap/CSS3
- i18n (ngx-translate)

### DevOps:
- Git/GitHub
- PowerShell (scripts)
- Postman (tests API)

---

## 📝 SCRIPTS UTILES

### Démarrage complet:
```powershell
.\DEMARRER_PROJET_COMPLET.ps1
```

### Arrêt des services:
```powershell
.\ARRETER_PROJET.ps1
```

### Vérification des services:
```powershell
.\VERIFIER_SERVICES.ps1
```

---

## 🌐 URLs IMPORTANTES

- Frontend: http://localhost:4200
- Dashboard Stats: http://localhost:4200/competitions/dashboard
- Eureka: http://localhost:8761
- API Gateway: http://localhost:8888
- PlatformeBack: http://localhost:8081
- Professional Events: http://localhost:8087

---

## 👥 RÔLES UTILISATEURS

### FORMATEUR (Trainer)
- Créer des compétitions
- Gérer les compétitions
- Voir le dashboard statistiques
- Envoyer des SMS
- Voir le classement
- Accéder au chat

### APPRENANT (Learner)
- S'inscrire aux compétitions
- Créer/Rejoindre des équipes
- Voir le classement
- Participer au chat
- Recevoir des notifications

### ADMIN
- Accès complet
- Gestion des utilisateurs
- Dashboard admin

---

## 📊 MÉTRIQUES DU PROJET

- **Nombre de microservices**: 5
- **Nombre d'APIs**: 7 controllers
- **Nombre d'endpoints**: ~35
- **Nombre d'entités**: 5
- **Nombre de composants Angular**: ~15
- **Nombre de services Angular**: ~10
- **Lignes de code Backend**: ~5000
- **Lignes de code Frontend**: ~8000
- **Durée de développement**: 10 semaines

---

## ✅ VALIDATION FINALE

### Critères de validation:
- ✅ Architecture microservices fonctionnelle
- ✅ Communication entre services via Eureka
- ✅ APIs REST complètes et documentées
- ✅ Frontend responsive et moderne
- ✅ Authentification JWT sécurisée
- ✅ WebSocket temps réel fonctionnel
- ✅ Intégration SMS (Twilio)
- ✅ Dashboard avec graphiques
- ✅ Notifications en temps réel
- ✅ Mode Dark/Light
- ✅ Internationalisation
- ✅ Documentation complète

---

**Date de création**: Mars 2026
**Auteur**: Équipe de développement
**Version**: 1.0.0
