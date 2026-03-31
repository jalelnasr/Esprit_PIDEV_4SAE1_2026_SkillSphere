# Fonctionnalités Métier Avancées - SkillSphere

## 1. SYSTÈME D'ABONNEMENT À 3 NIVEAUX ✅

### Fonctionnalité
Contrôle d'accès aux formations basé sur l'abonnement de l'utilisateur.

### Plans Disponibles
- **BASIC** (9.99€/mois) → Accès formations BEGINNER
- **PLUS** (19.99€/mois) → Accès formations BEGINNER + INTERMEDIATE  
- **PREMIUM** (29.99€/mois) → Accès toutes les formations

### APIs Utilisées
- `GET /api/subscription-plans` - Liste des plans
- `POST /api/subscriptions/subscribe` - S'abonner
- `GET /api/subscriptions/user/{userId}` - Mon abonnement
- `GET /api/subscriptions/user/{userId}/access?courseLevel=X` - Vérifier accès

### Pages Frontend
- `/pricing` - Page des tarifs
- `/account/subscription` - Gestion abonnement
- `/learning/courses` - Catalogue avec badges d'accès

---

## 2. SYSTÈME DE PAIEMENT AVEC OTP EMAIL ✅

### Fonctionnalité
Paiement sécurisé avec validation par code OTP envoyé par email.

### Flux
1. Utilisateur choisit un plan → Initie paiement
2. Email envoyé avec code OTP (6 chiffres)
3. Utilisateur saisit le code OTP
4. Validation → Abonnement activé

### APIs Utilisées
- `POST /api/payments/initiate` - Initier paiement
- `POST /api/payments/verify-otp` - Vérifier OTP
- `GET /api/payments/{id}` - Statut paiement

### Pages Frontend
- `/checkout` - Page de paiement
- `/payment-verify-otp` - Saisie OTP

### Email Automatique
- Template HTML professionnel
- Logo SkillSphere
- Code OTP valide 10 minutes
- Facture PDF en pièce jointe

---

## 3. GÉNÉRATION AUTOMATIQUE DE FACTURES PDF ✅

### Fonctionnalité
Création automatique de facture PDF après chaque paiement réussi.

### Contenu Facture
- Logo SkillSphere
- Informations client
- Détails abonnement
- Montant TTC
- Numéro de facture unique
- Date de paiement

### APIs Utilisées
- Génération automatique lors du paiement
- PDF envoyé par email
- Stocké dans le système

### Service Backend
- `InvoiceService.java` - Génération PDF
- `EmailService.java` - Envoi email avec PDF

---

## 4. GESTION COMPLÈTE DES FORMATIONS (FORMATEUR) ✅

### Fonctionnalités
- Créer/Modifier/Supprimer formations
- Publier/Dépublier formations
- Upload image de couverture
- Définir niveau et durée
- Gérer les chapitres (leçons)
- Ajouter ressources (vidéos, PDFs)

### APIs Utilisées
- `POST /api/courses` - Créer formation
- `PUT /api/courses/{id}` - Modifier
- `POST /api/courses/{id}/publish` - Publier
- `DELETE /api/courses/{id}` - Supprimer
- `POST /api/formation/courses/{courseId}/lessons` - Créer leçon
- `POST /api/formation/lessons/{lessonId}/resources/video` - Ajouter vidéo
- `POST /api/formation/lessons/{lessonId}/resources/pdf` - Ajouter PDF

### Pages Frontend
- `/learning/instructor/formations` - Mes formations
- `/learning/instructor/content/{id}` - Gestion contenu

---

## 5. GESTION DES SESSIONS DE FORMATION ✅

### Fonctionnalités
- Créer sessions avec dates/horaires
- Définir capacité max
- Ouvrir/Fermer inscriptions
- Voir liste des participants
- Gérer plusieurs sessions par formation

### APIs Utilisées
- `POST /api/courses/{id}/sessions` - Créer session
- `PUT /api/sessions/{id}` - Modifier session
- `POST /api/sessions/{id}/open` - Ouvrir inscriptions
- `POST /api/sessions/{id}/close` - Fermer inscriptions
- `GET /api/sessions/{sessionId}/participants` - Liste participants
- `POST /api/sessions/{id}/enroll` - Inscription étudiant

### Pages Frontend
- `/learning/instructor/sessions` - Gestion sessions
- `/admin/sessions` - Admin sessions

---

## 6. SUIVI AUTOMATIQUE DE PROGRESSION ✅

### Fonctionnalité
Calcul automatique de la progression de l'étudiant dans chaque formation.

### Mécanisme
- Progression = (Leçons complétées / Total leçons) × 100
- Mise à jour automatique quand étudiant ouvre une leçon
- Affichage barre de progression en temps réel

### APIs Utilisées
- `POST /api/lesson-progress/complete` - Marquer leçon complétée
- `POST /api/lesson-progress/access` - Enregistrer accès
- `GET /api/enrollments/{enrollmentId}/progress` - Progression détaillée

### Pages Frontend
- `/learning/my-courses` - Mes formations avec progression
- `/learning/course-player/{id}` - Lecteur avec auto-tracking

---

## 7. STATISTIQUES FORMATEUR (DASHBOARD) ✅

### Fonctionnalités
- Nombre total de formations
- Nombre total de sessions
- Nombre total d'étudiants
- Taux de complétion moyen
- Tendances d'inscriptions (graphique)
- Top formations
- Activités récentes

### APIs Utilisées
- `GET /api/instructors/{instructorId}/statistics` - Toutes les stats
- `GET /api/instructors/{instructorId}/courses` - Mes formations
- `GET /api/instructors/{instructorId}/sessions` - Mes sessions

### Pages Frontend
- `/learning/instructor/dashboard` - Dashboard formateur

---

## 8. SUIVI DES ÉTUDIANTS (FORMATEUR) ✅

### Fonctionnalités
- Liste de tous les étudiants inscrits
- Progression par étudiant
- Filtrage par formation
- Export CSV de la liste
- Temps passé par étudiant
- Date dernière activité

### APIs Utilisées
- `GET /api/instructors/{instructorId}/students` - Tous mes étudiants
- `GET /api/courses/{courseId}/students` - Étudiants d'une formation
- `GET /api/instructors/{instructorId}/students/export` - Export CSV

### Pages Frontend
- `/learning/instructor/students` - Suivi étudiants

---

## 9. SYSTÈME D'AVIS AVEC MODÉRATION ✅

### Fonctionnalités
- Étudiants inscrits peuvent donner avis (1-5 étoiles + commentaire)
- 1 avis par utilisateur par formation
- Modification possible de son avis
- Affichage moyenne et nombre d'avis
- Modal pour voir tous les commentaires
- **Filtre automatique des mots inappropriés**

### Modération de Contenu
- Détection automatique mots vulgaires/offensants
- Blocage avec message d'erreur clair
- Détection variations obfusquées (f*ck, sh!t, etc.)
- Validation côté backend (sécurisé)

### APIs Utilisées
- `POST /api/courses/{courseId}/reviews` - Créer/modifier avis
- `GET /api/courses/{courseId}/reviews/stats` - Statistiques
- `GET /api/courses/{courseId}/reviews` - Tous les avis
- `GET /api/courses/{courseId}/reviews/my-review` - Mon avis

### Pages Frontend
- `/learning/my-courses` - Donner un avis
- `/learning/courses` - Voir les avis (modal)

---

## 10. LECTEUR DE COURS INTÉGRÉ ✅

### Fonctionnalités
- Navigation entre chapitres
- Lecture vidéos intégrées
- Visualisation PDFs
- Progression automatique
- Sidebar avec liste des leçons
- Marquage automatique "complété"

### APIs Utilisées
- `GET /api/formation/courses/{courseId}/lessons` - Liste leçons
- `GET /api/formation/lessons/{lessonId}/resources` - Ressources
- `POST /api/lesson-progress/complete` - Marquer complété
- `POST /api/lesson-progress/access` - Enregistrer accès

### Pages Frontend
- `/learning/course-player/{courseId}` - Lecteur de cours

---

## 11. UPLOAD DE FICHIERS MULTI-FORMAT ✅

### Fonctionnalités
- Upload images (formations, profil)
- Upload vidéos (ressources cours)
- Upload PDFs (documents cours)
- Prévisualisation avant upload
- Validation taille/format
- Stockage sécurisé

### APIs Utilisées
- `POST /api/uploads/image` - Upload image
- `POST /api/uploads/video` - Upload vidéo
- `POST /api/uploads/pdf` - Upload PDF

### Formats Supportés
- Images: JPG, PNG, GIF (max 5MB)
- Vidéos: MP4, AVI, MOV (max 100MB)
- PDFs: PDF (max 20MB)

---

## 12. CONTRÔLE D'ACCÈS PAR RÔLE ✅

### Fonctionnalités
- **ADMIN**: Accès total (gestion users, formations, sessions, paiements)
- **FORMATEUR**: Créer formations, gérer sessions, voir étudiants
- **APPRENANT**: S'inscrire, suivre cours, donner avis

### Mécanisme
- JWT avec rôle dans le token
- Guards Angular par rôle
- Validation backend sur chaque endpoint
- Headers `X-User-Role` pour certaines APIs

### Pages par Rôle

**ADMIN:**
- `/admin/dashboard` - Dashboard admin
- `/admin/users` - Gestion utilisateurs
- `/admin/formations` - Gestion formations
- `/admin/sessions` - Gestion sessions
- `/admin/payments` - Historique paiements

**FORMATEUR:**
- `/learning/instructor/dashboard` - Dashboard formateur
- `/learning/instructor/formations` - Mes formations
- `/learning/instructor/sessions` - Mes sessions
- `/learning/instructor/students` - Mes étudiants
- `/learning/instructor/content/{id}` - Gestion contenu

**APPRENANT:**
- `/learning/courses` - Catalogue formations
- `/learning/my-courses` - Mes formations
- `/learning/course-player/{id}` - Lecteur cours
- `/pricing` - Plans d'abonnement
- `/account/subscription` - Mon abonnement

---

## 13. INSCRIPTION AUTOMATIQUE AUX SESSIONS ✅

### Fonctionnalités
- Inscription en 1 clic
- Vérification capacité disponible
- Indicateur "Inscrit" sur les sessions
- Liste des sessions inscrites
- Annulation possible

### APIs Utilisées
- `POST /api/sessions/{id}/enroll` - S'inscrire
- `GET /api/users/{userId}/sessions/{sessionId}/enrollment-status` - Vérifier inscription
- `GET /api/users/{userId}/enrolled-session-ids` - Mes sessions

### Pages Frontend
- `/learning/course/{id}` - Détails formation avec sessions
- Bouton "S'inscrire" sur chaque session

---

## 14. NOTIFICATIONS PAR EMAIL ✅

### Fonctionnalités
- Email de bienvenue à l'inscription
- Email avec OTP pour paiement
- Email de confirmation paiement avec facture PDF
- Email d'activation abonnement
- Templates HTML professionnels

### Service Backend
- `EmailService.java` - Envoi emails
- Templates HTML avec logo
- Support pièces jointes (PDF)

---

## 15. DASHBOARD PERSONNALISÉ PAR RÔLE ✅

### ADMIN Dashboard
- Statistiques globales
- Nombre total users/formations/sessions
- Revenus totaux
- Graphiques d'activité

### FORMATEUR Dashboard
- Mes statistiques
- Nombre formations/sessions/étudiants
- Taux de complétion
- Actions rapides (créer formation, session)

### APPRENANT Dashboard
- Mes formations en cours
- Progression globale
- Formations recommandées
- Actions rapides (parcourir catalogue)

### APIs Utilisées
- `GET /api/instructors/{instructorId}/statistics` - Stats formateur
- Agrégation côté frontend pour admin

### Pages Frontend
- `/dashboard` - Dashboard adapté au rôle

---

## RÉSUMÉ DES FONCTIONNALITÉS

| # | Fonctionnalité | Status | Complexité |
|---|----------------|--------|------------|
| 1 | Abonnement 3 niveaux | ✅ | Avancée |
| 2 | Paiement OTP Email | ✅ | Avancée |
| 3 | Factures PDF auto | ✅ | Avancée |
| 4 | Gestion formations | ✅ | Moyenne |
| 5 | Gestion sessions | ✅ | Moyenne |
| 6 | Progression auto | ✅ | Avancée |
| 7 | Stats formateur | ✅ | Avancée |
| 8 | Suivi étudiants | ✅ | Avancée |
| 9 | Avis + Modération | ✅ | Avancée |
| 10 | Lecteur cours | ✅ | Moyenne |
| 11 | Upload fichiers | ✅ | Moyenne |
| 12 | Contrôle accès rôle | ✅ | Avancée |
| 13 | Inscription sessions | ✅ | Simple |
| 14 | Emails auto | ✅ | Moyenne |
| 15 | Dashboards | ✅ | Moyenne |

---

## TECHNOLOGIES UTILISÉES

### Backend
- Spring Boot 3.x
- Spring Security + JWT
- JPA/Hibernate
- MySQL
- iText (PDF)
- JavaMail (Email)

### Frontend
- Angular 18
- TypeScript
- RxJS
- Standalone Components
- JWT Interceptor

### Architecture
- Microservices
- API Gateway (port 8087)
- Formation Service (port 8086)
- User Service (port 8083)

---

## POINTS FORTS

1. **Sécurité**: JWT + Validation backend + Modération contenu
2. **Automatisation**: Progression, emails, factures
3. **UX**: Dashboards personnalisés, notifications claires
4. **Scalabilité**: Architecture microservices
5. **Monétisation**: Système d'abonnement complet
