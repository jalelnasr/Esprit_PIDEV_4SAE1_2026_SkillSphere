# Système d'Avis avec Modération ✅

## Fonctionnalités

### 1. Donner un Avis
- **Qui:** Étudiants inscrits uniquement
- **Où:** "Mes Formations" → Bouton "Donner un avis"
- **Quoi:** Note 1-5 étoiles + commentaire optionnel
- **Limite:** 1 avis par formation (mise à jour possible)

### 2. Voir les Avis
- **Qui:** Tous les utilisateurs
- **Où:** "Browse Courses" → Widget d'avis → Bouton "Voir les avis"
- **Affichage:** ⭐⭐⭐⭐⭐ (4.6 / 120 avis)

### 3. Modération Automatique
- Filtre les mots inappropriés en anglais
- Détecte les variations (f*ck, sh!t, etc.)
- Message d'erreur clair si contenu inapproprié

## Fichiers Créés

**Backend:**
- `CourseReview.java` - Entité
- `CourseReviewRepository.java` - Repository
- `ReviewService.java` - Service avec validation
- `ReviewController.java` - API REST
- `ContentModerationUtil.java` - Filtre de modération
- `ReviewRequest.java` - DTO
- `CourseRatingStats.java` - DTO

**Frontend:**
- Modifié `formation.service.ts` - Méthodes API
- Modifié `my-courses.component.ts` - Modal donner avis
- Modifié `course-catalog.component.ts` - Modal voir avis
- Modifié `course-catalog.component.html` - UI
- Modifié `course-catalog.component.css` - Styles

## Endpoints API

- `POST /api/courses/{id}/reviews` - Créer/modifier avis
- `GET /api/courses/{id}/reviews/stats` - Statistiques
- `GET /api/courses/{id}/reviews` - Tous les avis
- `GET /api/courses/{id}/reviews/my-review?userId=X` - Mon avis

## Redémarrage Backend Requis

Après modifications Java:
```bash
cd Formation_service
# Ctrl+C pour arrêter
./mvnw.cmd clean compile
./mvnw.cmd spring-boot:run
```
