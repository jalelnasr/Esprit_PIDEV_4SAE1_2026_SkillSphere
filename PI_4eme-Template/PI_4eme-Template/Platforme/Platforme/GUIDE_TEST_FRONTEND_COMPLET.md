# Guide Complet - Test Frontend avec Backend

## 🎯 Prérequis

### 1. Vérifier que les 3 Applications Sont Démarrées

✅ **Backend Auth (IntelliJ):**
```
Port: 8086
Status: Running
Logs: "Tomcat started on port(s): 8086"
```

✅ **Backend Competitions (IntelliJ):**
```
Port: 8087
Status: Running
Logs: "Tomcat started on port(s): 8087"
```

✅ **Frontend Angular:**
```bash
cd Platforme
ng serve
```
```
Port: 4200
URL: http://localhost:4200
```

---

## 🚀 ÉTAPE 1: Démarrer le Frontend

### Dans le Terminal (ici dans cet éditeur):

```bash
cd Platforme
ng serve
```

**Attendez le message:**
```
✔ Browser application bundle generation complete.
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

**Ouvrez votre navigateur:** `http://localhost:4200`

---

## 🧪 ÉTAPE 2: Test de l'Authentification

### 2.1 Créer un Compte (Register)

1. Sur la page d'accueil, cliquez sur **"S'inscrire"** ou **"Register"**
2. Remplissez le formulaire:
   - **Nom:** Dupont
   - **Prénom:** Jean
   - **Email:** jean.dupont@test.com
   - **Mot de passe:** password123
   - **Téléphone:** 0612345678
   - **Adresse:** 123 Rue de Paris

3. Cliquez sur **"S'inscrire"**

**Résultat Attendu:**
- ✅ Redirection vers le dashboard
- ✅ Message de bienvenue avec le nom de l'utilisateur
- ✅ Token stocké dans localStorage (F12 → Application → Local Storage)

### 2.2 Se Déconnecter

1. Cliquez sur le bouton **"Déconnexion"** ou votre profil
2. Vous devriez être redirigé vers la page de login

### 2.3 Se Reconnecter (Login)

1. Cliquez sur **"Se connecter"** ou **"Login"**
2. Entrez:
   - **Email:** jean.dupont@test.com
   - **Mot de passe:** password123
3. Cliquez sur **"Se connecter"**

**Résultat Attendu:**
- ✅ Redirection vers le dashboard
- ✅ Token rafraîchi dans localStorage

---

## 🏆 ÉTAPE 3: Test du Module Compétitions

### 3.1 Accéder au Module Compétitions

1. Dans le menu de navigation (sidebar), cliquez sur **"Compétitions"**
2. Vous devriez voir la page de liste des compétitions

**URL:** `http://localhost:4200/competitions`

**Résultat Attendu:**
- ✅ Page affichée sans erreur 401
- ✅ Liste vide au début (message "Aucune compétition disponible")

### 3.2 Créer une Compétition (FORMATEUR uniquement)

**⚠️ IMPORTANT:** Par défaut, les nouveaux utilisateurs sont APPRENANT. Pour tester la création, vous devez:

#### Option A: Modifier le Rôle dans la Base de Données

```sql
USE platforme;
UPDATE users SET role = 'FORMATEUR' WHERE email = 'jean.dupont@test.com';
```

Puis **déconnectez-vous et reconnectez-vous** pour obtenir un nouveau token.

#### Option B: Créer un Nouveau Compte Formateur

1. Créez un compte avec un autre email
2. Modifiez le rôle dans la DB
3. Connectez-vous avec ce compte

#### Créer la Compétition:

1. Cliquez sur **"Créer une Compétition"** ou **"Nouvelle Compétition"**
2. Remplissez le formulaire:
   - **Titre:** Hackathon Spring Boot 2026
   - **Description:** Compétition de développement d'applications web
   - **Type:** ONLINE (ou PHYSICAL)
   - **Date de début:** 15/03/2026 09:00
   - **Date de fin:** 17/03/2026 18:00
   - **Participants max:** 100
   - **Statut:** OPEN

3. Cliquez sur **"Créer"**

**Résultat Attendu:**
- ✅ Message de succès
- ✅ Redirection vers la liste des compétitions
- ✅ La nouvelle compétition apparaît dans la liste

**Vérification Backend:**
```sql
USE professional_events_db;
SELECT * FROM competitions;
```

### 3.3 Voir les Détails d'une Compétition

1. Dans la liste, cliquez sur une compétition
2. Vous devriez voir la page de détails

**URL:** `http://localhost:4200/competitions/1`

**Résultat Attendu:**
- ✅ Titre, description, dates affichés
- ✅ Bouton "S'inscrire" visible (si APPRENANT)
- ✅ Bouton "Gérer" visible (si FORMATEUR)

### 3.4 S'inscrire à une Compétition (APPRENANT)

**⚠️ Connectez-vous avec un compte APPRENANT**

1. Sur la page de détails d'une compétition
2. Cliquez sur **"S'inscrire"** ou **"Participer"**
3. Confirmez l'inscription

**Résultat Attendu:**
- ✅ Message de succès
- ✅ Bouton "S'inscrire" devient "Annuler l'inscription"
- ✅ Vous apparaissez dans la liste des participants

**Vérification Backend:**
```sql
USE professional_events_db;
SELECT * FROM participants;
```

### 3.5 Voir le Classement (Leaderboard)

1. Cliquez sur **"Classement"** ou **"Leaderboard"**
2. Vous devriez voir le classement des participants

**URL:** `http://localhost:4200/competitions/1/leaderboard`

**Résultat Attendu:**
- ✅ Liste des participants avec scores et rangs
- ✅ Podium affiché (top 3)
- ✅ Design responsive

### 3.6 Gérer une Compétition (FORMATEUR)

**⚠️ Connectez-vous avec un compte FORMATEUR**

1. Sur la page de détails d'une compétition
2. Cliquez sur **"Gérer"** ou **"Manage"**

**URL:** `http://localhost:4200/competitions/1/manage`

**Fonctionnalités:**
- ✅ Voir la liste des participants
- ✅ Attribuer des scores
- ✅ Modifier le statut (OPEN/CLOSED)
- ✅ Supprimer la compétition

---

## 🔍 ÉTAPE 4: Vérifications Techniques

### 4.1 Vérifier les Requêtes HTTP

**Ouvrez les DevTools (F12) → Onglet Network:**

1. Connectez-vous
2. Vérifiez la requête POST vers `http://localhost:8086/api/auth/login`
3. Vérifiez que la réponse contient le token

4. Allez sur la liste des compétitions
5. Vérifiez la requête GET vers `http://localhost:8087/api/competitions`
6. Vérifiez que le header `Authorization: Bearer TOKEN` est présent

### 4.2 Vérifier le Token dans localStorage

**F12 → Application → Local Storage → http://localhost:4200:**

Vous devriez voir:
```
token: eyJhbGciOiJIUzI1NiJ9...
user: {"userId":1,"nom":"Dupont",...}
```

### 4.3 Vérifier les Erreurs Console

**F12 → Console:**

- ❌ Pas d'erreurs 401 Unauthorized
- ❌ Pas d'erreurs CORS
- ❌ Pas d'erreurs de compilation Angular

---

## 🎨 ÉTAPE 5: Test de l'Interface Utilisateur

### 5.1 Test du Dark Mode

1. Cherchez le bouton de changement de thème (icône lune/soleil)
2. Cliquez dessus
3. Vérifiez que le thème change

### 5.2 Test du Responsive Design

1. Ouvrez les DevTools (F12)
2. Activez le mode responsive (Ctrl+Shift+M)
3. Testez différentes tailles d'écran:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Vérifications:**
- ✅ Menu hamburger sur mobile
- ✅ Cartes de compétitions adaptées
- ✅ Formulaires lisibles
- ✅ Pas de débordement horizontal

### 5.3 Test de Navigation

1. Testez tous les liens du menu
2. Vérifiez que les routes fonctionnent:
   - `/dashboard`
   - `/competitions`
   - `/competitions/create`
   - `/competitions/:id`
   - `/competitions/:id/leaderboard`
   - `/competitions/:id/manage`

---

## 📋 ÉTAPE 6: Scénario de Test Complet

### Scénario 1: Utilisateur APPRENANT

1. ✅ Créer un compte
2. ✅ Se connecter
3. ✅ Voir la liste des compétitions
4. ✅ Voir les détails d'une compétition
5. ✅ S'inscrire à une compétition
6. ✅ Voir le classement
7. ✅ Voir "Mes Participations"
8. ✅ Se déconnecter

### Scénario 2: Utilisateur FORMATEUR

1. ✅ Se connecter (compte FORMATEUR)
2. ✅ Créer une nouvelle compétition
3. ✅ Voir la liste des compétitions
4. ✅ Gérer une compétition
5. ✅ Voir les participants
6. ✅ Attribuer des scores
7. ✅ Changer le statut (OPEN → CLOSED)
8. ✅ Supprimer une compétition
9. ✅ Se déconnecter

---

## 🐛 Résolution de Problèmes

### Erreur: Cannot GET /competitions

**Cause:** Le routing Angular n'est pas configuré correctement

**Solution:**
1. Vérifiez que `app.routes.ts` contient les routes competitions
2. Redémarrez `ng serve`

### Erreur: 401 Unauthorized

**Cause:** Token manquant ou invalide

**Solution:**
1. Déconnectez-vous
2. Reconnectez-vous
3. Vérifiez que le token est dans localStorage
4. Vérifiez que l'intercepteur JWT fonctionne

### Erreur: CORS Policy

**Cause:** Configuration CORS incorrecte dans les backends

**Solution:**
1. Vérifiez `cors.allowed-origins=http://localhost:4200` dans les 2 `application.properties`
2. Redémarrez les backends

### Erreur: Connection Refused

**Cause:** Un des backends n'est pas démarré

**Solution:**
1. Vérifiez que les 2 backends sont en cours d'exécution dans IntelliJ
2. Vérifiez les ports 8086 et 8087

### Page Blanche

**Cause:** Erreur de compilation Angular

**Solution:**
1. Vérifiez la console (F12)
2. Vérifiez le terminal où `ng serve` est lancé
3. Corrigez les erreurs TypeScript

---

## ✅ Checklist Finale

### Backend
- [ ] Backend Auth démarré (8086)
- [ ] Backend Competitions démarré (8087)
- [ ] MySQL en cours d'exécution
- [ ] Bases de données créées

### Frontend
- [ ] `ng serve` démarré (4200)
- [ ] Pas d'erreurs de compilation
- [ ] Page accessible dans le navigateur

### Fonctionnalités
- [ ] Register fonctionne
- [ ] Login fonctionne
- [ ] Token stocké dans localStorage
- [ ] Liste des compétitions affichée
- [ ] Création de compétition (FORMATEUR)
- [ ] Inscription à une compétition (APPRENANT)
- [ ] Classement affiché
- [ ] Gestion des compétitions (FORMATEUR)
- [ ] Déconnexion fonctionne

### UI/UX
- [ ] Dark mode fonctionne
- [ ] Responsive design OK
- [ ] Navigation fluide
- [ ] Messages de succès/erreur affichés

---

## 🎉 Félicitations!

Si tous les tests passent, votre application full-stack avec microservices fonctionne parfaitement!

**Architecture Complète:**
```
Frontend (Angular - Port 4200)
    ↓
Backend Auth (Spring Boot - Port 8086) → MySQL (platforme)
    ↓
Backend Competitions (Spring Boot - Port 8087) → MySQL (professional_events_db)
```

**Prochaines Étapes:**
1. Ajouter plus de fonctionnalités (équipes, récompenses)
2. Améliorer le design
3. Ajouter des tests unitaires
4. Déployer en production
