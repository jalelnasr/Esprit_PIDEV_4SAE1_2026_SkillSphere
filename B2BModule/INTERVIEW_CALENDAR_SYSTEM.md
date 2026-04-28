# Système de Calendrier & Entretiens

## Vue d'ensemble

Ce système permet de gérer les entretiens des candidats avec intégration Google Calendar et rappels automatiques par email.

## Fonctionnalités

✅ **Planification des entretiens**
- Créer, modifier, annuler les entretiens
- Définir date, heure, lieu et lien de réunion
- Ajouter des notes

✅ **Intégration Google Calendar**
- Création automatique d'événements dans Google Calendar
- Synchronisation des modifications
- Suppression automatique lors de l'annulation

✅ **Rappels automatiques**
- Rappel 24 heures avant l'entretien
- Rappel 1 heure avant l'entretien
- Envoi par email

✅ **Calendrier visuel**
- Affichage des entretiens par date
- Filtrage par candidat, recruteur ou offre d'emploi

## Architecture

### Entités
- **Interview** : Représente un entretien avec tous les détails

### Services
- **InterviewService** : Logique métier pour les entretiens
- **GoogleCalendarService** : Intégration avec Google Calendar
- **InterviewReminderScheduler** : Tâche planifiée pour les rappels

### Contrôleurs
- **InterviewController** : Endpoints REST pour les opérations CRUD

### Repositories
- **InterviewRepository** : Accès à la base de données

## Endpoints API

### Créer un entretien
```
POST /api/interviews
Content-Type: application/json

{
  "candidateId": 1,
  "recruiterId": 2,
  "jobOfferId": 3,
  "interviewDateTime": "2026-03-15T14:00:00",
  "location": "Office - Room 101",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Technical interview"
}
```

### Récupérer un entretien
```
GET /api/interviews/{id}
```

### Récupérer les entretiens d'un candidat
```
GET /api/interviews/candidate/{candidateId}
```

### Récupérer les entretiens d'un recruteur
```
GET /api/interviews/recruiter/{recruiterId}
```

### Récupérer les entretiens d'une offre d'emploi
```
GET /api/interviews/job-offer/{jobOfferId}
```

### Récupérer les entretiens entre deux dates
```
GET /api/interviews/calendar?startDate=2026-03-01T00:00:00&endDate=2026-03-31T23:59:59
```

### Modifier un entretien
```
PUT /api/interviews/{id}
Content-Type: application/json

{
  "candidateId": 1,
  "recruiterId": 2,
  "jobOfferId": 3,
  "interviewDateTime": "2026-03-15T15:00:00",
  "location": "Office - Room 102",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Updated notes"
}
```

### Annuler un entretien
```
PUT /api/interviews/{id}/cancel
```

### Supprimer un entretien
```
DELETE /api/interviews/{id}
```

### Envoyer les rappels (manuel)
```
POST /api/interviews/send-reminders
```

## Configuration Google Calendar

### Étapes de configuration

1. **Créer un projet Google Cloud**
   - Aller sur https://console.cloud.google.com
   - Créer un nouveau projet

2. **Activer l'API Google Calendar**
   - Dans le projet, aller à "APIs & Services"
   - Cliquer sur "Enable APIs and Services"
   - Rechercher "Google Calendar API"
   - Cliquer sur "Enable"

3. **Créer des identifiants**
   - Aller à "Credentials"
   - Cliquer sur "Create Credentials"
   - Sélectionner "Service Account"
   - Remplir les détails
   - Créer une clé JSON

4. **Placer le fichier credentials.json**
   - Télécharger le fichier JSON
   - Le placer dans le répertoire racine du projet B2BModule
   - Ou configurer le chemin dans `application.properties`

### Configuration dans application.properties
```properties
google.calendar.credentials.path=credentials.json
google.calendar.id=primary
```

## Rappels automatiques

### Fonctionnement

La tâche planifiée `InterviewReminderScheduler` s'exécute toutes les heures pour :
1. Vérifier les entretiens prévus dans 24 heures
2. Envoyer un email de rappel
3. Marquer le rappel comme envoyé
4. Vérifier les entretiens prévus dans 1 heure
5. Envoyer un email de rappel
6. Marquer le rappel comme envoyé

### Configuration
```properties
spring.task.scheduling.pool.size=2
```

## Base de données

### Table interviews
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

## Dépendances ajoutées

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

## Statuts des entretiens

- **SCHEDULED** : Entretien planifié
- **COMPLETED** : Entretien terminé
- **CANCELLED** : Entretien annulé
- **RESCHEDULED** : Entretien reporté

## Prochaines étapes

1. Configurer Google Calendar avec les credentials
2. Créer les composants Angular pour l'interface
3. Tester les endpoints avec Postman
4. Implémenter les notifications en temps réel (WebSocket)
5. Ajouter les statistiques et rapports

## Troubleshooting

### Erreur : "Failed to create Google Calendar event"
- Vérifier que le fichier `credentials.json` existe
- Vérifier que l'API Google Calendar est activée
- Vérifier les permissions du service account

### Rappels non envoyés
- Vérifier que le service EmailService est correctement configuré
- Vérifier les logs pour les erreurs
- Vérifier que la tâche planifiée est activée (@EnableScheduling)

### Problèmes de fuseau horaire
- Vérifier la configuration du fuseau horaire dans Google Calendar
- Vérifier la configuration du serveur
