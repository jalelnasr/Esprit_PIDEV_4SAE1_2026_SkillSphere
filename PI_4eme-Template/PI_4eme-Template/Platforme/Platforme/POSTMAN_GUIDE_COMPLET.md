# Guide Complet Postman - Test des Backends

## 📥 Prérequis

1. ✅ Télécharger Postman: https://www.postman.com/downloads/
2. ✅ Backend Auth démarré sur port 8086
3. ✅ Backend Competitions démarré sur port 8087
4. ✅ MySQL en cours d'exécution

---

## 🎯 PARTIE 1: GESTION DES UTILISATEURS (Backend Auth - Port 8086)

### 1.1 Créer un Utilisateur (Register)

**Méthode:** `POST`  
**URL:** `http://localhost:8086/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@test.com",
  "password": "password123",
  "phone": "0612345678",
  "adresse": "123 Rue de Paris"
}
```

**Réponse Attendue (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@test.com",
  "role": "APPRENANT"
}
```

**⚠️ IMPORTANT:** Copiez le token pour les prochaines requêtes!

---

### 1.2 Se Connecter (Login)

**Méthode:** `POST`  
**URL:** `http://localhost:8086/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "jean.dupont@test.com",
  "password": "password123"
}
```

**Réponse Attendue (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJBUFBSRU5BTlQiLCJzdWIiOiJqZWFuLmR1cG9udEB0ZXN0LmNvbSIsImlhdCI6MTcwOTU2ODAwMCwiZXhwIjoxNzA5NjU0NDAwfQ...",
  "userId": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@test.com",
  "role": "APPRENANT"
}
```

---

### 1.3 Créer un Formateur (pour tester les compétitions)

**Méthode:** `POST`  
**URL:** `http://localhost:8086/api/auth/register`

**Body (raw JSON):**
```json
{
  "nom": "Martin",
  "prenom": "Sophie",
  "email": "sophie.martin@test.com",
  "password": "password123",
  "phone": "0623456789",
  "adresse": "456 Avenue des Champs"
}
```

**Note:** Par défaut, tous les utilisateurs sont créés avec le rôle APPRENANT. Pour créer un FORMATEUR, vous devez modifier le rôle dans la base de données:

```sql
USE platforme;
UPDATE users SET role = 'FORMATEUR' WHERE email = 'sophie.martin@test.com';
```

Puis reconnectez-vous pour obtenir un nouveau token avec le rôle FORMATEUR.

---

### 1.4 Mot de Passe Oublié (Forgot Password)

**Méthode:** `POST`  
**URL:** `http://localhost:8086/api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "jean.dupont@test.com"
}
```

**Réponse Attendue (200 OK):**
Le lien de réinitialisation sera affiché dans les logs du backend (console IntelliJ).

---

### 1.5 Réinitialiser le Mot de Passe

**Méthode:** `POST`  
**URL:** `http://localhost:8086/api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "TOKEN_FROM_FORGOT_PASSWORD",
  "newPassword": "newpassword123"
}
```

---

## 🎯 PARTIE 2: GESTION DES COMPÉTITIONS (Backend Competitions - Port 8087)

### 2.1 Configuration du Token dans Postman

Pour toutes les requêtes suivantes, vous devez ajouter le token JWT:

**Dans Postman:**
1. Allez dans l'onglet **Authorization**
2. Type: **Bearer Token**
3. Token: Collez le token obtenu lors du login

**OU ajoutez manuellement dans Headers:**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

---

### 2.2 Lister Toutes les Compétitions

**Méthode:** `GET`  
**URL:** `http://localhost:8087/api/competitions`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN
```

**Réponse Attendue (200 OK):**
```json
[]
```
(Vide au début, puis contiendra la liste des compétitions)

---

### 2.3 Créer une Compétition (FORMATEUR uniquement)

**Méthode:** `POST`  
**URL:** `http://localhost:8087/api/competitions`

**Headers:**
```
Authorization: Bearer TOKEN_FORMATEUR
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Hackathon Spring Boot 2026",
  "description": "Compétition de développement d'applications web avec Spring Boot et Angular",
  "type": "ONLINE",
  "startDate": "2026-03-15T09:00:00",
  "endDate": "2026-03-17T18:00:00",
  "maxParticipants": 100,
  "status": "OPEN"
}
```

**Réponse Attendue (201 Created):**
```json
{
  "competitionId": 1,
  "title": "Hackathon Spring Boot 2026",
  "description": "Compétition de développement d'applications web avec Spring Boot et Angular",
  "type": "ONLINE",
  "startDate": "2026-03-15T09:00:00",
  "endDate": "2026-03-17T18:00:00",
  "maxParticipants": 100,
  "status": "OPEN"
}
```

---

### 2.4 Obtenir une Compétition par ID

**Méthode:** `GET`  
**URL:** `http://localhost:8087/api/competitions/1`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN
```

**Réponse Attendue (200 OK):**
```json
{
  "competitionId": 1,
  "title": "Hackathon Spring Boot 2026",
  "description": "...",
  "type": "ONLINE",
  "startDate": "2026-03-15T09:00:00",
  "endDate": "2026-03-17T18:00:00",
  "maxParticipants": 100,
  "status": "OPEN"
}
```

---

### 2.5 Lister les Compétitions Ouvertes

**Méthode:** `GET`  
**URL:** `http://localhost:8087/api/competitions/status/open`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN
```

---

### 2.6 Lister les Compétitions Fermées

**Méthode:** `GET`  
**URL:** `http://localhost:8087/api/competitions/status/closed`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN
```

---

### 2.7 S'inscrire à une Compétition (APPRENANT)

**Méthode:** `POST`  
**URL:** `http://localhost:8087/api/competitions/1/register/1`

**Note:** Remplacez:
- `1` (premier) = ID de la compétition
- `1` (deuxième) = ID de l'utilisateur (userId du token)

**Headers:**
```
Authorization: Bearer TOKEN_APPRENANT
```

**Réponse Attendue (201 Created):**
```json
{
  "registrationId": 1,
  "userId": 1,
  "competitionId": 1,
  "registrationDate": "2026-02-25T22:00:00",
  "score": null,
  "rank": null
}
```

---

### 2.8 Obtenir les Participants d'une Compétition

**Méthode:** `GET`  
**URL:** `http://localhost:8087/api/competitions/1/participants`

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN
```

**Réponse Attendue (200 OK):**
```json
[
  {
    "registrationId": 1,
    "userId": 1,
    "competitionId": 1,
    "registrationDate": "2026-02-25T22:00:00",
    "score": null,
    "rank": null
  }
]
```

---

### 2.9 Obtenir les Inscriptions d'un Utilisateur

**Méthode:** `GET`  
**URL:** `http://localhost:8087/api/competitions/user/1/registrations`

**Note:** Remplacez `1` par l'ID de l'utilisateur

**Headers:**
```
Authorization: Bearer VOTRE_TOKEN
```

---

### 2.10 Mettre à Jour le Score d'un Participant (FORMATEUR)

**Méthode:** `PUT`  
**URL:** `http://localhost:8087/api/competitions/participant/1/score?score=95&rank=1`

**Note:** Remplacez `1` par l'ID de l'inscription (registrationId)

**Headers:**
```
Authorization: Bearer TOKEN_FORMATEUR
```

**Réponse Attendue (200 OK):**
```json
{
  "registrationId": 1,
  "userId": 1,
  "competitionId": 1,
  "registrationDate": "2026-02-25T22:00:00",
  "score": 95,
  "rank": 1
}
```

---

### 2.11 Changer le Statut d'une Compétition (FORMATEUR)

**Méthode:** `PUT`  
**URL:** `http://localhost:8087/api/competitions/1/status?status=CLOSED`

**Headers:**
```
Authorization: Bearer TOKEN_FORMATEUR
```

**Réponse Attendue (200 OK):**
```json
{
  "competitionId": 1,
  "title": "Hackathon Spring Boot 2026",
  "status": "CLOSED",
  ...
}
```

---

### 2.12 Supprimer une Compétition (FORMATEUR)

**Méthode:** `DELETE`  
**URL:** `http://localhost:8087/api/competitions/1`

**Headers:**
```
Authorization: Bearer TOKEN_FORMATEUR
```

**Réponse Attendue (204 No Content)**

---

## 📋 Scénario de Test Complet

### Étape 1: Créer les Utilisateurs
1. Créer un APPRENANT (Jean Dupont)
2. Créer un FORMATEUR (Sophie Martin) - modifier le rôle dans la DB
3. Se connecter avec chaque utilisateur et sauvegarder les tokens

### Étape 2: Créer une Compétition (avec token FORMATEUR)
1. POST `/api/competitions` avec les détails
2. Noter l'ID de la compétition créée

### Étape 3: Inscription (avec token APPRENANT)
1. POST `/api/competitions/{id}/register/{userId}`
2. Vérifier l'inscription

### Étape 4: Lister les Participants (avec n'importe quel token)
1. GET `/api/competitions/{id}/participants`
2. Vérifier que l'apprenant est inscrit

### Étape 5: Mettre à Jour le Score (avec token FORMATEUR)
1. PUT `/api/competitions/participant/{registrationId}/score?score=95&rank=1`
2. Vérifier le score mis à jour

### Étape 6: Fermer la Compétition (avec token FORMATEUR)
1. PUT `/api/competitions/{id}/status?status=CLOSED`
2. Vérifier le statut

---

## 🔍 Vérification dans la Base de Données

### Vérifier les Utilisateurs
```sql
USE platforme;
SELECT * FROM users;
```

### Vérifier les Compétitions
```sql
USE professional_events_db;
SELECT * FROM competitions;
```

### Vérifier les Participants
```sql
USE professional_events_db;
SELECT * FROM participants;
```

---

## 🐛 Erreurs Courantes

### Erreur 401 Unauthorized
- **Cause:** Token manquant, invalide ou expiré
- **Solution:** Reconnectez-vous pour obtenir un nouveau token

### Erreur 403 Forbidden
- **Cause:** Rôle insuffisant (ex: APPRENANT essaie de créer une compétition)
- **Solution:** Utilisez un token FORMATEUR

### Erreur 404 Not Found
- **Cause:** ID de compétition ou utilisateur inexistant
- **Solution:** Vérifiez les IDs dans la base de données

### Erreur 500 Internal Server Error
- **Cause:** Erreur dans le backend
- **Solution:** Vérifiez les logs dans IntelliJ

---

## 💡 Astuces Postman

### 1. Créer une Collection
1. Cliquez sur "New" → "Collection"
2. Nommez-la "Microservices Tests"
3. Ajoutez toutes vos requêtes dedans

### 2. Utiliser des Variables d'Environnement
1. Créez un environnement "Local"
2. Ajoutez les variables:
   - `authUrl`: `http://localhost:8086/api`
   - `competitionsUrl`: `http://localhost:8087/api`
   - `token`: (sera mis à jour après login)
   - `userId`: (sera mis à jour après login)

3. Utilisez-les dans vos requêtes:
   - URL: `{{authUrl}}/auth/login`
   - Header: `Authorization: Bearer {{token}}`

### 3. Sauvegarder Automatiquement le Token
Dans l'onglet "Tests" de la requête Login, ajoutez:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
pm.environment.set("userId", jsonData.userId);
```

---

## ✅ Checklist de Test

### Backend Auth (8086)
- [ ] Register un APPRENANT
- [ ] Register un FORMATEUR (modifier rôle dans DB)
- [ ] Login APPRENANT
- [ ] Login FORMATEUR
- [ ] Forgot Password
- [ ] Reset Password

### Backend Competitions (8087)
- [ ] Lister compétitions (vide)
- [ ] Créer compétition (FORMATEUR)
- [ ] Lister compétitions (avec données)
- [ ] Obtenir compétition par ID
- [ ] S'inscrire (APPRENANT)
- [ ] Lister participants
- [ ] Mettre à jour score (FORMATEUR)
- [ ] Changer statut (FORMATEUR)
- [ ] Supprimer compétition (FORMATEUR)

---

## 🎉 Félicitations!

Si tous les tests passent, vos backends fonctionnent correctement! Vous pouvez maintenant tester le frontend Angular.
