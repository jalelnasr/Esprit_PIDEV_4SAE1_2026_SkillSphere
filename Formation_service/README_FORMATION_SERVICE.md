# Formation Service - Microservice LMS

## Description
Microservice de gestion de formations pour une plateforme LMS (Learning Management System) type Coursera/Udemy.

## Architecture
- **Java 17**
- **Spring Boot 3.2.0**
- **Maven**
- **MySQL** (formation_db)
- **Eureka Client** (Service Discovery sur port 8762)
- **OpenFeign** (Communication inter-services)
- **Port**: 8086

## Prérequis
1. Java 17 installé
2. Maven installé
3. MySQL installé et démarré
4. Eureka Server démarré sur port 8762
5. User-Service démarré (pour validation des utilisateurs)

## Configuration Base de Données
Créer la base de données MySQL:
```sql
CREATE DATABASE formation_db;
```

Modifier `src/main/resources/application.properties` si nécessaire:
```properties
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

## Démarrage

### 1. Compiler le projet
```bash
mvn clean install
```

### 2. Lancer l'application
```bash
mvn spring-boot:run
```

Ou avec le JAR:
```bash
java -jar target/Formation_service-0.0.1-SNAPSHOT.jar
```

## Documentation API

### Swagger UI
Une fois l'application démarrée, accéder à:
- **Swagger UI**: http://localhost:8086/swagger-ui.html
- **API Docs**: http://localhost:8086/api-docs

## Endpoints Principaux

### Courses
- `POST /courses` - Créer un cours
- `PUT /courses/{id}` - Modifier un cours
- `POST /courses/{id}/publish` - Publier un cours
- `GET /courses?status=PUBLISHED` - Lister les cours
- `GET /courses/{id}` - Détails d'un cours

### Lessons
- `POST /courses/{id}/lessons` - Ajouter une leçon
- `POST /lessons/{id}/resources` - Ajouter une ressource

### Enrollments (Inscriptions)
- `POST /courses/{id}/enroll` - S'inscrire à un cours
- `POST /enrollments/{id}/cancel` - Annuler une inscription
- `GET /users/{userId}/enrollments` - Inscriptions d'un utilisateur

### Progress
- `POST /enrollments/{id}/lessons/{lessonId}/complete` - Marquer une leçon comme complétée

### Sessions
- `POST /courses/{id}/sessions` - Créer une session
- `POST /sessions/{id}/open` - Ouvrir une session
- `POST /sessions/{id}/close` - Fermer une session
- `POST /sessions/{id}/enroll` - S'inscrire à une session

### Reviews
- `POST /courses/{id}/reviews` - Ajouter un avis
- `GET /courses/{id}/reviews` - Lister les avis

### Learning Paths
- `POST /learning-paths` - Créer un parcours
- `POST /learning-paths/{id}/items` - Ajouter un cours au parcours
- `GET /learning-paths/{id}/roadmap?userId=X` - Voir la roadmap
- `GET /learning-paths/{id}/next?userId=X` - Prochain cours

## Règles Métier

### Courses
- Un cours DRAFT ne peut pas accepter d'inscription
- Seuls les cours PUBLISHED sont accessibles

### Sessions
- Une session ne peut être OPEN que si le cours est PUBLISHED
- Inscription autorisée uniquement si session OPEN
- Si capacity atteinte → refus

### Enrollments
- Vérification de l'existence de l'utilisateur via user-service
- Pas de double inscription
- Refus si cours DRAFT

### Progress
- Recalcul automatique du completionPercent
- Si 100% → enrollment passe à COMPLETED

### Reviews
- Un utilisateur = 1 seul avis par cours
- isVerified = true si l'utilisateur est inscrit

### Learning Paths
- Cours suivant accessible seulement si précédent COMPLETED

## Communication Inter-Services

### Appel à User-Service
Le service vérifie l'existence des utilisateurs via:
```
GET http://USER-SERVICE/internal/users/{id}/exists
Header: X-API-KEY: formation-to-user-secret
```

## Structure du Projet
```
src/main/java/org/example/formation_service/
├── domain/
│   ├── entity/          # Entités JPA
│   └── enums/           # Énumérations
├── repository/          # Repositories JPA
├── service/             # Services métier
├── web/
│   ├── controller/      # Controllers REST
│   └── dto/             # DTOs Request/Response
├── client/              # Feign Clients
└── exception/           # Gestion des exceptions
```

## Entités Principales
1. **Course** - Cours
2. **Lesson** - Leçons
3. **LessonResource** - Ressources (VIDEO, PDF, LINK)
4. **Session** - Sessions de cours
5. **Enrollment** - Inscriptions
6. **LessonProgress** - Progression
7. **LearningPath** - Parcours d'apprentissage
8. **LearningPathItem** - Items du parcours
9. **CourseReview** - Avis sur les cours

## Exemples de Requêtes

### Créer un cours
```json
POST /courses
{
  "title": "Introduction à Spring Boot",
  "description": "Apprendre les bases de Spring Boot",
  "level": "BEGINNER",
  "language": "Français",
  "durationMinutes": 300,
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "createdBy": 1
}
```

### S'inscrire à un cours
```json
POST /courses/1/enroll
{
  "userId": 123
}
```

### Marquer une leçon comme complétée
```json
POST /enrollments/1/lessons/5/complete
```

### Ajouter un avis
```json
POST /courses/1/reviews
{
  "userId": 123,
  "rating": 5,
  "comment": "Excellent cours!"
}
```

## Gestion des Erreurs
Toutes les erreurs métier retournent:
```json
{
  "code": "ERROR_CODE",
  "message": "Description de l'erreur"
}
```

Codes d'erreur courants:
- `COURSE_NOT_FOUND` - Cours introuvable
- `USER_NOT_FOUND` - Utilisateur introuvable
- `ALREADY_ENROLLED` - Déjà inscrit
- `COURSE_NOT_PUBLISHED` - Cours non publié
- `SESSION_FULL` - Session complète
- `REVIEW_ALREADY_EXISTS` - Avis déjà existant

## Tests
Lancer les tests:
```bash
mvn test
```

## Logs
Les logs SQL sont activés pour le développement dans `application.properties`:
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

## Support
Pour toute question, consulter la documentation Swagger ou contacter l'équipe de développement.
