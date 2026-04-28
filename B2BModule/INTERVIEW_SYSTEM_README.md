# 📅 Système de Calendrier & Entretiens

## Vue d'ensemble

Un système complet de gestion des entretiens avec :
- ✅ API REST complète
- ✅ Interface Angular intuitive
- ✅ Calendrier visuel
- ✅ Rappels automatiques par email
- ✅ Intégration Google Calendar
- ✅ Gestion des statuts d'entretiens

---

## 🏗️ Architecture

### Backend (Spring Boot)

**Fichiers créés** :
- `Interview.java` - Entité JPA
- `InterviewRequest.java` - DTO pour les requêtes
- `InterviewResponse.java` - DTO pour les réponses
- `InterviewRepository.java` - Accès à la base de données
- `InterviewService.java` - Logique métier
- `InterviewController.java` - Endpoints REST
- `GoogleCalendarService.java` - Intégration Google Calendar
- `InterviewReminderScheduler.java` - Tâche planifiée pour les rappels

**Dépendances ajoutées** :
- Google Calendar API
- Google Auth Library

### Frontend (Angular)

**Fichiers créés** :
- `interview.service.ts` - Service HTTP
- `interview-list.component.ts` - Composant liste
- `interview-list.component.html` - Template liste
- `interview-list.component.css` - Styles liste
- `interview-calendar.component.ts` - Composant calendrier
- `interview-calendar.component.html` - Template calendrier
- `interview-calendar.component.css` - Styles calendrier
- `interviews.routes.ts` - Routes

---

## 🚀 Démarrage Rapide

### 1. Backend

```bash
# Compiler et démarrer
cd B2BModule
mvn clean install
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8083`

### 2. Frontend

```bash
# Installer les dépendances
cd PI_4eme-Template/Platforme
npm install

# Démarrer le serveur de développement
ng serve
```

Le frontend démarre sur `http://localhost:4200`

### 3. Accéder à l'application

```
http://localhost:4200/admin/b2b/interviews/list
http://localhost:4200/admin/b2b/interviews/calendar
```

---

## 📚 Documentation

### Backend
- [INTERVIEW_CALENDAR_SYSTEM.md](./INTERVIEW_CALENDAR_SYSTEM.md) - Documentation complète du backend

### Frontend
- [INTERVIEW_SYSTEM_FRONTEND_GUIDE.md](../PI_4eme-Template/Platforme/INTERVIEW_SYSTEM_FRONTEND_GUIDE.md) - Guide d'intégration et d'utilisation

### Tests
- [INTERVIEW_SYSTEM_TEST_GUIDE.md](./INTERVIEW_SYSTEM_TEST_GUIDE.md) - Guide complet de test

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8083/api/interviews
```

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/` | Créer un entretien |
| GET | `/{id}` | Récupérer un entretien |
| GET | `/candidate/{candidateId}` | Entretiens d'un candidat |
| GET | `/recruiter/{recruiterId}` | Entretiens d'un recruteur |
| GET | `/job-offer/{jobOfferId}` | Entretiens d'une offre |
| GET | `/calendar` | Entretiens entre deux dates |
| PUT | `/{id}` | Modifier un entretien |
| PUT | `/{id}/cancel` | Annuler un entretien |
| DELETE | `/{id}` | Supprimer un entretien |
| POST | `/send-reminders` | Envoyer les rappels |

---

## 💾 Base de Données

### Table `interviews`

```sql
CREATE TABLE interviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  candidate_id BIGINT NOT NULL,
  recruiter_id BIGINT NOT NULL,
  job_offer_id BIGINT NOT NULL,
  interview_date_time DATETIME NOT NULL,
  status VARCHAR(50),
  notes VARCHAR(500),
  location VARCHAR(100),
  meeting_link VARCHAR(100),
  google_calendar_event_id VARCHAR(255),
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_1h BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

---

## 🎨 Interface Utilisateur

### Liste des Entretiens
- Tableau avec tous les entretiens
- Recherche par ID ou candidat
- Filtrage par statut
- CRUD complet (Créer, Lire, Mettre à jour, Supprimer)
- Modal pour créer/modifier

### Calendrier
- Calendrier mensuel
- Visualisation des entretiens par jour
- Navigation entre les mois
- Détails de l'entretien au clic
- Code couleur par statut

---

## 📧 Rappels Automatiques

Les rappels sont envoyés automatiquement :
- **24 heures** avant l'entretien
- **1 heure** avant l'entretien

Les rappels sont envoyés par email au candidat.

**Configuration** :
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

---

## 🔗 Intégration Google Calendar

Les entretiens sont automatiquement ajoutés à Google Calendar.

**Configuration** :
1. Créer un projet Google Cloud
2. Activer l'API Google Calendar
3. Créer des identifiants (Service Account)
4. Télécharger le fichier JSON
5. Placer le fichier dans le répertoire racine du projet

**Fichier de configuration** :
```properties
google.calendar.credentials.path=credentials.json
google.calendar.id=primary
```

---

## 🧪 Tests

### Avec Postman

Voir [INTERVIEW_SYSTEM_TEST_GUIDE.md](./INTERVIEW_SYSTEM_TEST_GUIDE.md) pour les exemples de requêtes.

### Avec le Frontend

1. Accéder à `http://localhost:4200/admin/b2b/interviews/list`
2. Créer un nouvel entretien
3. Modifier, annuler ou supprimer
4. Accéder au calendrier pour visualiser

---

## 📊 Statuts des Entretiens

- **SCHEDULED** : Entretien planifié
- **COMPLETED** : Entretien terminé
- **CANCELLED** : Entretien annulé
- **RESCHEDULED** : Entretien reporté

---

## 🔧 Configuration

### application.properties

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/b2bmodule
spring.datasource.username=root
spring.datasource.password=

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# Google Calendar
google.calendar.credentials.path=credentials.json
google.calendar.id=primary

# Scheduling
spring.task.scheduling.pool.size=2
```

---

## 📦 Dépendances

### Backend
```xml
<!-- Google Calendar API -->
<dependency>
    <groupId>com.google.apis</groupId>
    <artifactId>google-api-services-calendar</artifactId>
    <version>v3-rev20240422-2.0.0</version>
</dependency>

<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.23.0</version>
</dependency>
```

### Frontend
```json
{
  "ngx-toastr": "^17.0.0"
}
```

---

## 🐛 Troubleshooting

### Erreur : "Cannot GET /api/interviews"
- Vérifier que le backend est démarré sur le port 8083
- Vérifier que l'URL de l'API est correcte

### Erreur : "CORS error"
- Vérifier que CORS est activé dans le backend
- Vérifier la configuration dans `CorsConfig.java`

### Entretiens non affichés
- Vérifier que les données existent dans la base de données
- Vérifier les logs du backend

### Rappels non envoyés
- Vérifier que le service EmailService est configuré
- Vérifier que la tâche planifiée est activée
- Vérifier les logs du backend

---

## 📝 Prochaines Étapes

1. ✅ Système d'entretiens de base
2. ⏳ Notifications en temps réel (WebSocket)
3. ⏳ Statistiques et rapports
4. ⏳ Export en PDF/Excel
5. ⏳ Notifications push
6. ⏳ Synchronisation avec Outlook

---

## 👥 Équipe

- **Backend** : Spring Boot, Java
- **Frontend** : Angular, TypeScript
- **Base de données** : MySQL
- **Intégrations** : Google Calendar, Gmail

---

## 📄 Licence

Projet académique - PI 4ème année

---

## 📞 Support

Pour toute question ou problème, consultez :
- [INTERVIEW_CALENDAR_SYSTEM.md](./INTERVIEW_CALENDAR_SYSTEM.md)
- [INTERVIEW_SYSTEM_FRONTEND_GUIDE.md](../PI_4eme-Template/Platforme/INTERVIEW_SYSTEM_FRONTEND_GUIDE.md)
- [INTERVIEW_SYSTEM_TEST_GUIDE.md](./INTERVIEW_SYSTEM_TEST_GUIDE.md)

---

**Créé le** : 5 Mars 2026
**Dernière mise à jour** : 5 Mars 2026
