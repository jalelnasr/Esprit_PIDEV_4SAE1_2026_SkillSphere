# Documentation Complète des APIs - SkillSphere Platform

## Table des Matières
1. [Services Backend](#services-backend)
2. [API Gateway](#api-gateway)
3. [APIs par Module](#apis-par-module)

---

## Services Backend

### Architecture
- **API Gateway**: Port 8087 (Point d'entrée unique)
- **Formation Service**: Port 8086
- **User Service (PlatformeBack)**: Port 8083
- **Frontend Angular**: Port 4200

### Base URLs
- Via Gateway: `http://localhost:8087/{service-name}/api/...`
- Direct Formation Service: `http://localhost:8086/api/...`
- Direct User Service: `http://localhost:8083/api/...`

---

## APIs par Module

### 1. AUTHENTICATION & USERS (PlatformeBack)

#### Auth Controller (`/api/auth`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription utilisateur | `{ username, email, password, role }` |
| POST | `/api/auth/login` | Connexion | `{ username, password }` |
| POST | `/api/auth/logout` | Déconnexion | - |
| GET | `/api/auth/me` | Profil utilisateur connecté | - |

#### User Controller (`/api/users`)

| Méthode | Endpoint | Description | Rôle Requis |
|---------|----------|-------------|-------------|
| GET | `/api/users` | Liste tous les utilisateurs | ADMIN |
| GET | `/api/users/{id}` | Détails d'un utilisateur | ADMIN |
| PUT | `/api/users/{id}` | Modifier un utilisateur | ADMIN |
| DELETE | `/api/users/{id}` | Supprimer un utilisateur | ADMIN |

#### Internal User Controller (`/internal/users`)

| Méthode | Endpoint | Description | Usage |
|---------|----------|-------------|-------|
| GET | `/internal/users/{id}` | Récupérer user par ID | Inter-service |
| GET | `/internal/users/email/{email}` | Récupérer user par email | Inter-service |

---

### 2. COURSES (FORMATIONS)

#### Course Controller (`/api/courses`)

| Méthode | Endpoint | Description | Body/Params |
|---------|----------|-------------|-------------|
| POST | `/api/courses` | Créer une formation | `CourseRequest` |
| PUT | `/api/courses/{id}` | Modifier une formation | `CourseRequest` |
| GET | `/api/courses` | Liste des formations | `?status=PUBLISHED` |
| GET | `/api/courses/{id}` | Détails d'une formation | - |
| DELETE | `/api/courses/{id}` | Supprimer une formation | - |
| POST | `/api/courses/{id}/publish` | Publier une formation | - |
| POST | `/api/courses/{id}/unpublish` | Dépublier une formation | - |

**CourseRequest:**
```json
{
  "title": "string",
  "description": "string",
  "level": "BEGINNER|INTERMEDIATE|ADVANCED",
  "accessLevel": "BASIC|PLUS|PREMIUM",
  "language": "string",
  "durationMinutes": 0,
  "thumbnailUrl": "string",
  "createdBy": 0
}
```

---

### 3. SESSIONS

#### Session Controller (`/api`)

| Méthode | Endpoint | Description | Body/Params |
|---------|----------|-------------|-------------|
| POST | `/api/courses/{id}/sessions` | Créer une session | `SessionRequest` |
| PUT | `/api/sessions/{id}` | Modifier une session | `SessionRequest` |
| GET | `/api/courses/{id}/sessions` | Sessions d'une formation | - |
| GET | `/api/sessions` | Toutes les sessions | - |
| GET | `/api/sessions/recent` | Sessions récentes | `?limit=10` |
| POST | `/api/sessions/{id}/open` | Ouvrir une session | - |
| POST | `/api/sessions/{id}/close` | Fermer une session | - |
| POST | `/api/sessions/{id}/enroll` | S'inscrire à une session | `{ userId }` |
| DELETE | `/api/sessions/{id}` | Supprimer une session | - |
| GET | `/api/instructors/{instructorId}/sessions` | Sessions d'un formateur | - |
| GET | `/api/users/{userId}/sessions/{sessionId}/enrollment-status` | Vérifier inscription session | - |
| GET | `/api/users/{userId}/enrolled-session-ids` | IDs sessions inscrites | - |

**SessionRequest:**
```json
{
  "startAt": "2026-03-10T10:00:00",
  "endAt": "2026-03-10T12:00:00",
  "timezone": "Europe/Paris",
  "location": "Salle A",
  "capacity": 30
}
```

#### Session Participants (`/api/sessions`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/sessions/{sessionId}/participants` | Liste des participants |
| GET | `/api/sessions/{sessionId}/participants/count` | Nombre de participants |

---

### 4. ENROLLMENTS (INSCRIPTIONS)

#### Enrollment Controller (`/api`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/courses/{id}/enroll` | S'inscrire à une formation | `{ userId }` |
| POST | `/api/enrollments/{id}/cancel` | Annuler une inscription | - |
| GET | `/api/users/{userId}/enrollments` | Inscriptions d'un utilisateur | - |
| GET | `/api/users/{userId}/courses/{courseId}/enrollment-status` | Vérifier inscription | - |

---

### 5. LESSONS (LEÇONS/CHAPITRES)

#### Lesson Controller (`/api/formation`)

| Méthode | Endpoint | Description | Headers Requis |
|---------|----------|-------------|----------------|
| POST | `/api/formation/courses/{courseId}/lessons` | Créer une leçon | X-User-Id, X-User-Role |
| GET | `/api/formation/courses/{courseId}/lessons` | Leçons d'une formation | - |
| GET | `/api/formation/lessons/{lessonId}` | Détails d'une leçon | - |
| PUT | `/api/formation/lessons/{lessonId}` | Modifier une leçon | X-User-Id, X-User-Role |
| DELETE | `/api/formation/lessons/{lessonId}` | Supprimer une leçon | X-User-Id, X-User-Role |
| PUT | `/api/formation/courses/{courseId}/lessons/reorder` | Réorganiser les leçons | X-User-Id, X-User-Role |

**LessonRequest:**
```json
{
  "title": "string",
  "description": "string",
  "orderIndex": 0,
  "durationMinutes": 0
}
```

---

### 6. LESSON RESOURCES (RESSOURCES)

#### Lesson Resources (`/api/formation`)

| Méthode | Endpoint | Description | Headers Requis |
|---------|----------|-------------|----------------|
| POST | `/api/formation/lessons/{lessonId}/resources/video` | Ajouter vidéo | X-User-Id, X-User-Role |
| POST | `/api/formation/lessons/{lessonId}/resources/pdf` | Ajouter PDF | X-User-Id, X-User-Role |
| GET | `/api/formation/lessons/{lessonId}/resources` | Ressources d'une leçon | - |
| PUT | `/api/formation/resources/{resourceId}` | Modifier une ressource | X-User-Id, X-User-Role |
| DELETE | `/api/formation/resources/{resourceId}` | Supprimer une ressource | X-User-Id, X-User-Role |

**LessonResourceRequest:**
```json
{
  "title": "string",
  "type": "VIDEO|PDF|DOCUMENT",
  "url": "string",
  "durationMinutes": 0,
  "fileSizeBytes": 0
}
```

---

### 7. LESSON PROGRESS (PROGRESSION)

#### Lesson Progress Controller (`/api/lesson-progress`)

| Méthode | Endpoint | Description | Params |
|---------|----------|-------------|--------|
| POST | `/api/lesson-progress/complete` | Marquer leçon complétée | `?enrollmentId=X&lessonId=Y` |
| POST | `/api/lesson-progress/access` | Enregistrer accès leçon | `?enrollmentId=X&lessonId=Y` |

---

### 8. REVIEWS (AVIS)

#### Review Controller (`/api/courses/{courseId}/reviews`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/courses/{courseId}/reviews` | Créer/modifier un avis | `ReviewRequest` |
| GET | `/api/courses/{courseId}/reviews/stats` | Statistiques des avis | - |
| GET | `/api/courses/{courseId}/reviews/my-review` | Mon avis | `?userId=X` |
| GET | `/api/courses/{courseId}/reviews` | Tous les avis | - |

**ReviewRequest:**
```json
{
  "userId": 0,
  "rating": 5,
  "comment": "string"
}
```

**Modération de Contenu:**
- Filtre automatique des mots inappropriés
- Erreur `INAPPROPRIATE_CONTENT` si détecté

---

### 9. SUBSCRIPTIONS (ABONNEMENTS)

#### Subscription Plan Controller (`/api/subscription-plans`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/subscription-plans` | Liste des plans |
| GET | `/api/subscription-plans/{id}` | Détails d'un plan |
| POST | `/api/subscription-plans` | Créer un plan (ADMIN) |

#### User Subscription Controller (`/api/subscriptions`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/subscriptions/subscribe` | S'abonner | `{ userId, planId }` |
| GET | `/api/subscriptions/user/{userId}` | Abonnement d'un user | - |
| POST | `/api/subscriptions/{id}/cancel` | Annuler abonnement | - |
| GET | `/api/subscriptions/user/{userId}/access` | Vérifier accès | `?courseLevel=X` |

---

### 10. PAYMENTS (PAIEMENTS)

#### Payment Controller (`/api/payments`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/payments/initiate` | Initier paiement | `PaymentRequest` |
| POST | `/api/payments/verify-otp` | Vérifier OTP | `{ paymentId, otp }` |
| GET | `/api/payments/{id}` | Détails paiement | - |
| GET | `/api/payments/user/{userId}` | Paiements d'un user | - |

#### Simulated Payment Controller (`/api/payments`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/payments/simulate` | Simuler paiement | `SimulatedPaymentRequest` |
| GET | `/api/payments/simulate/{id}/status` | Statut paiement simulé | - |

#### Demo Payment Controller (`/api/payments/demo`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/payments/demo/initiate` | Initier paiement démo | `DemoPaymentRequest` |
| POST | `/api/payments/demo/confirm` | Confirmer paiement démo | `{ paymentId }` |

---

### 11. FILE UPLOADS

#### File Upload Controller (`/api/uploads`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/uploads/image` | Upload image | `MultipartFile` |
| POST | `/api/uploads/video` | Upload vidéo | `MultipartFile` |
| POST | `/api/uploads/pdf` | Upload PDF | `MultipartFile` |
| GET | `/api/uploads/{filename}` | Télécharger fichier | - |

---

### 12. INSTRUCTOR STATISTICS

#### Instructor Statistics Controller (`/api/instructors`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/instructors/{instructorId}/statistics` | Statistiques formateur |
| GET | `/api/instructors/{instructorId}/courses` | Formations d'un formateur |

---

### 13. STUDENT TRACKING

#### Student Tracking Controller (`/api`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/instructors/{instructorId}/students` | Étudiants d'un formateur |
| GET | `/api/courses/{courseId}/students` | Étudiants d'une formation |
| GET | `/api/enrollments/{enrollmentId}/progress` | Progression d'un étudiant |
| GET | `/api/instructors/{instructorId}/students/export` | Exporter liste étudiants (CSV) |

---

### 14. LEARNING PATHS (PARCOURS)

#### Learning Path Controller (`/api/learning-paths`)

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/api/learning-paths` | Créer un parcours | `LearningPathRequest` |
| GET | `/api/learning-paths` | Liste des parcours | - |
| GET | `/api/learning-paths/{id}` | Détails d'un parcours | - |
| GET | `/api/learning-paths/{id}/roadmap` | Roadmap d'un parcours | - |
| POST | `/api/learning-paths/{id}/courses` | Ajouter formation au parcours | `{ courseId, orderIndex }` |

---

## Authentification

### JWT Token
Toutes les APIs (sauf auth/register et auth/login) nécessitent un token JWT:

```
Authorization: Bearer <token>
```

### Headers Personnalisés
Certaines APIs nécessitent des headers supplémentaires:

```
X-User-Id: <userId>
X-User-Role: ADMIN|FORMATEUR|APPRENANT
```

---

## Codes de Statut HTTP

| Code | Signification |
|------|---------------|
| 200 | OK - Succès |
| 201 | Created - Ressource créée |
| 204 | No Content - Suppression réussie |
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Non authentifié |
| 403 | Forbidden - Accès refusé |
| 404 | Not Found - Ressource introuvable |
| 500 | Internal Server Error - Erreur serveur |

---

## Erreurs Métier

### BusinessException Codes

| Code | Description |
|------|-------------|
| `NOT_ENROLLED` | Utilisateur non inscrit |
| `INAPPROPRIATE_CONTENT` | Contenu inapproprié détecté |
| `INSUFFICIENT_ACCESS` | Niveau d'accès insuffisant |
| `SESSION_FULL` | Session complète |
| `ALREADY_ENROLLED` | Déjà inscrit |

---

## Exemples d'Utilisation

### 1. Créer une Formation
```bash
POST http://localhost:8087/formation-service/api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction à Angular",
  "description": "Apprendre les bases d'Angular",
  "level": "BEGINNER",
  "accessLevel": "BASIC",
  "language": "Français",
  "durationMinutes": 120,
  "createdBy": 1
}
```

### 2. S'inscrire à une Formation
```bash
POST http://localhost:8087/formation-service/api/courses/1/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 2
}
```

### 3. Donner un Avis
```bash
POST http://localhost:8087/formation-service/api/courses/1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 2,
  "rating": 5,
  "comment": "Excellent cours!"
}
```

### 4. Créer une Leçon
```bash
POST http://localhost:8087/formation-service/api/formation/courses/1/lessons
Authorization: Bearer <token>
X-User-Id: 1
X-User-Role: FORMATEUR
Content-Type: application/json

{
  "title": "Chapitre 1: Introduction",
  "description": "Présentation du cours",
  "orderIndex": 1,
  "durationMinutes": 30
}
```

---

## Notes Importantes

1. **API Gateway**: Toujours utiliser le gateway (port 8087) en production
2. **Modération**: Les commentaires sont automatiquement filtrés
3. **Progression**: La progression est calculée automatiquement
4. **Accès**: Le contrôle d'accès est basé sur les abonnements
5. **Fichiers**: Les uploads sont limités à 100MB

---

## Support

Pour toute question sur les APIs:
- Consulter les logs backend
- Vérifier les codes d'erreur
- Tester avec Postman/Insomnia
