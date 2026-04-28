# Guide de Test Complet - Système d'Entretiens

## 🚀 Démarrage Rapide

### Étape 1 : Démarrer le Backend

```bash
# Dans le dossier B2BModule
mvn clean install
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8083`

### Étape 2 : Démarrer le Frontend

```bash
# Dans le dossier PI_4eme-Template/Platforme
npm install
ng serve
```

Le frontend démarre sur `http://localhost:4200`

### Étape 3 : Accéder à l'Application

```
http://localhost:4200/admin/b2b/interviews/list
```

---

## 📋 Tests avec Postman

### Collection Postman

Créez une nouvelle collection avec les requêtes suivantes :

### 1. Créer un Entretien

**Nom** : Create Interview
**Méthode** : POST
**URL** : `http://localhost:8083/api/interviews`

**Headers** :
```
Content-Type: application/json
```

**Body** (raw JSON) :
```json
{
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-15T14:00:00",
  "location": "Bureau - Salle 101",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Entretien technique pour poste Senior Developer"
}
```

**Réponse attendue** (201 Created) :
```json
{
  "id": 1,
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-15T14:00:00",
  "status": "SCHEDULED",
  "location": "Bureau - Salle 101",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Entretien technique pour poste Senior Developer",
  "googleCalendarEventId": "abc123xyz",
  "reminderSent24h": false,
  "reminderSent1h": false,
  "createdAt": "2026-03-05T10:30:00",
  "updatedAt": "2026-03-05T10:30:00"
}
```

---

### 2. Récupérer un Entretien

**Nom** : Get Interview by ID
**Méthode** : GET
**URL** : `http://localhost:8083/api/interviews/1`

**Réponse attendue** (200 OK) :
```json
{
  "id": 1,
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-15T14:00:00",
  "status": "SCHEDULED",
  "location": "Bureau - Salle 101",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Entretien technique pour poste Senior Developer",
  "googleCalendarEventId": "abc123xyz",
  "reminderSent24h": false,
  "reminderSent1h": false,
  "createdAt": "2026-03-05T10:30:00",
  "updatedAt": "2026-03-05T10:30:00"
}
```

---

### 3. Récupérer les Entretiens d'un Candidat

**Nom** : Get Interviews by Candidate
**Méthode** : GET
**URL** : `http://localhost:8083/api/interviews/candidate/1`

**Réponse attendue** (200 OK) :
```json
[
  {
    "id": 1,
    "candidateId": 1,
    "recruiterId": 1,
    "jobOfferId": 1,
    "interviewDateTime": "2026-03-15T14:00:00",
    "status": "SCHEDULED",
    "location": "Bureau - Salle 101",
    "meetingLink": "https://zoom.us/j/123456789",
    "notes": "Entretien technique",
    "googleCalendarEventId": "abc123xyz",
    "reminderSent24h": false,
    "reminderSent1h": false,
    "createdAt": "2026-03-05T10:30:00",
    "updatedAt": "2026-03-05T10:30:00"
  }
]
```

---

### 4. Récupérer les Entretiens d'un Recruteur

**Nom** : Get Interviews by Recruiter
**Méthode** : GET
**URL** : `http://localhost:8083/api/interviews/recruiter/1`

---

### 5. Récupérer les Entretiens d'une Offre d'Emploi

**Nom** : Get Interviews by Job Offer
**Méthode** : GET
**URL** : `http://localhost:8083/api/interviews/job-offer/1`

---

### 6. Récupérer les Entretiens entre Deux Dates

**Nom** : Get Interviews by Date Range
**Méthode** : GET
**URL** : `http://localhost:8083/api/interviews/calendar?startDate=2026-03-01T00:00:00&endDate=2026-03-31T23:59:59`

**Réponse attendue** (200 OK) :
```json
[
  {
    "id": 1,
    "candidateId": 1,
    "recruiterId": 1,
    "jobOfferId": 1,
    "interviewDateTime": "2026-03-15T14:00:00",
    "status": "SCHEDULED",
    "location": "Bureau - Salle 101",
    "meetingLink": "https://zoom.us/j/123456789",
    "notes": "Entretien technique",
    "googleCalendarEventId": "abc123xyz",
    "reminderSent24h": false,
    "reminderSent1h": false,
    "createdAt": "2026-03-05T10:30:00",
    "updatedAt": "2026-03-05T10:30:00"
  }
]
```

---

### 7. Modifier un Entretien

**Nom** : Update Interview
**Méthode** : PUT
**URL** : `http://localhost:8083/api/interviews/1`

**Headers** :
```
Content-Type: application/json
```

**Body** (raw JSON) :
```json
{
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-16T15:00:00",
  "location": "Bureau - Salle 102",
  "meetingLink": "https://zoom.us/j/987654321",
  "notes": "Entretien technique - Reporté à 15h"
}
```

**Réponse attendue** (200 OK) :
```json
{
  "id": 1,
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-16T15:00:00",
  "status": "SCHEDULED",
  "location": "Bureau - Salle 102",
  "meetingLink": "https://zoom.us/j/987654321",
  "notes": "Entretien technique - Reporté à 15h",
  "googleCalendarEventId": "abc123xyz",
  "reminderSent24h": false,
  "reminderSent1h": false,
  "createdAt": "2026-03-05T10:30:00",
  "updatedAt": "2026-03-05T11:00:00"
}
```

---

### 8. Annuler un Entretien

**Nom** : Cancel Interview
**Méthode** : PUT
**URL** : `http://localhost:8083/api/interviews/1/cancel`

**Réponse attendue** (200 OK) :
```json
{
  "id": 1,
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-16T15:00:00",
  "status": "CANCELLED",
  "location": "Bureau - Salle 102",
  "meetingLink": "https://zoom.us/j/987654321",
  "notes": "Entretien technique - Reporté à 15h",
  "googleCalendarEventId": "abc123xyz",
  "reminderSent24h": false,
  "reminderSent1h": false,
  "createdAt": "2026-03-05T10:30:00",
  "updatedAt": "2026-03-05T11:05:00"
}
```

---

### 9. Supprimer un Entretien

**Nom** : Delete Interview
**Méthode** : DELETE
**URL** : `http://localhost:8083/api/interviews/1`

**Réponse attendue** (204 No Content)

---

### 10. Envoyer les Rappels

**Nom** : Send Reminders
**Méthode** : POST
**URL** : `http://localhost:8083/api/interviews/send-reminders`

**Réponse attendue** (200 OK) :
```json
"Reminders sent successfully"
```

---

## 🧪 Tests Frontend

### Test 1 : Accéder à la Liste des Entretiens

1. Ouvrir `http://localhost:4200/admin/b2b/interviews/list`
2. Vérifier que la page se charge correctement
3. Vérifier que le tableau est vide ou affiche les entretiens existants

### Test 2 : Créer un Nouvel Entretien

1. Cliquer sur le bouton "Nouvel Entretien"
2. Remplir le formulaire :
   - ID Candidat : 1
   - ID Recruteur : 1
   - ID Offre d'emploi : 1
   - Date & Heure : 2026-03-15 14:00
   - Lieu : Bureau - Salle 101
   - Lien de réunion : https://zoom.us/j/123456789
   - Notes : Entretien technique
3. Cliquer sur "Enregistrer"
4. Vérifier que l'entretien apparaît dans la liste

### Test 3 : Modifier un Entretien

1. Cliquer sur le bouton "Modifier" (icône crayon)
2. Modifier les informations
3. Cliquer sur "Enregistrer"
4. Vérifier que les modifications sont appliquées

### Test 4 : Annuler un Entretien

1. Cliquer sur le bouton "Annuler" (icône croix)
2. Confirmer l'annulation
3. Vérifier que le statut passe à "CANCELLED"

### Test 5 : Supprimer un Entretien

1. Cliquer sur le bouton "Supprimer" (icône poubelle)
2. Confirmer la suppression
3. Vérifier que l'entretien disparaît de la liste

### Test 6 : Filtrer les Entretiens

1. Utiliser la barre de recherche pour filtrer par ID
2. Utiliser le dropdown "Statut" pour filtrer par statut
3. Vérifier que les filtres fonctionnent correctement

### Test 7 : Accéder au Calendrier

1. Ouvrir `http://localhost:4200/admin/b2b/interviews/calendar`
2. Vérifier que le calendrier s'affiche correctement
3. Naviguer entre les mois
4. Cliquer sur un entretien pour voir les détails

---

## 📊 Scénario de Test Complet

### Scénario 1 : Cycle de Vie Complet d'un Entretien

1. **Créer** un entretien via Postman
2. **Vérifier** qu'il apparaît dans la liste frontend
3. **Modifier** la date et l'heure
4. **Vérifier** que les modifications sont appliquées
5. **Annuler** l'entretien
6. **Vérifier** que le statut change à "CANCELLED"
7. **Supprimer** l'entretien
8. **Vérifier** qu'il disparaît de la liste

### Scénario 2 : Filtrage et Recherche

1. **Créer** 5 entretiens avec différents statuts
2. **Filtrer** par statut "SCHEDULED"
3. **Vérifier** que seuls les entretiens planifiés s'affichent
4. **Rechercher** par ID candidat
5. **Vérifier** que la recherche fonctionne correctement

### Scénario 3 : Calendrier

1. **Créer** 3 entretiens pour le même mois
2. **Ouvrir** le calendrier
3. **Vérifier** que les entretiens s'affichent sur les bons jours
4. **Cliquer** sur un entretien pour voir les détails
5. **Naviguer** vers le mois suivant
6. **Vérifier** que le calendrier se met à jour

---

## ✅ Checklist de Validation

- [ ] Backend démarre sans erreurs
- [ ] Frontend démarre sans erreurs
- [ ] Créer un entretien fonctionne
- [ ] Récupérer un entretien fonctionne
- [ ] Modifier un entretien fonctionne
- [ ] Annuler un entretien fonctionne
- [ ] Supprimer un entretien fonctionne
- [ ] Filtrer les entretiens fonctionne
- [ ] Rechercher les entretiens fonctionne
- [ ] Calendrier s'affiche correctement
- [ ] Navigation du calendrier fonctionne
- [ ] Détails de l'entretien s'affichent correctement
- [ ] Rappels sont envoyés (vérifier les logs)
- [ ] Google Calendar est synchronisé (si configuré)

---

## 🐛 Troubleshooting

### Erreur : "Cannot GET /api/interviews"
**Solution** : Vérifier que le backend est démarré sur le port 8083

### Erreur : "CORS error"
**Solution** : Vérifier que CORS est activé dans `CorsConfig.java`

### Erreur : "Interview not found"
**Solution** : Vérifier que l'ID existe dans la base de données

### Erreur : "Failed to create Google Calendar event"
**Solution** : Vérifier que le fichier `credentials.json` est configuré

### Entretiens non affichés
**Solution** : Vérifier que les données existent dans la base de données MySQL

---

## 📝 Notes

- Les dates doivent être au format ISO 8601 : `YYYY-MM-DDTHH:mm:ss`
- Les IDs doivent être des nombres entiers positifs
- Le statut par défaut est "SCHEDULED"
- Les rappels sont envoyés automatiquement toutes les heures
- Google Calendar est optionnel et nécessite une configuration

---

## 🎯 Résultat Attendu

Après tous les tests, vous devriez avoir :
- ✅ Un système d'entretiens fonctionnel
- ✅ Une liste des entretiens avec CRUD complet
- ✅ Un calendrier visuel des entretiens
- ✅ Des rappels automatiques par email
- ✅ Une intégration Google Calendar (optionnel)
- ✅ Une interface utilisateur intuitive et responsive
