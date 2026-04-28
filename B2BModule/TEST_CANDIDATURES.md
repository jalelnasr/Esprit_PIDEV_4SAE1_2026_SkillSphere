# 🧪 GUIDE DE TEST - Gestion des Candidatures

## 📋 Prérequis

1. **Backend démarré** sur port 8083
2. **Frontend démarré** sur port 4200
3. **Base de données MySQL** configurée

---

## 🚀 ÉTAPE 1: Démarrer les Services

### Terminal 1 - Backend
```bash
cd c:\Users\mouha\Desktop\skill\B2BModule
mvn spring-boot:run
```
✅ Attendre: `Tomcat started on port(s): 8083 (http)`

### Terminal 2 - Frontend
```bash
cd c:\Users\mouha\Desktop\skill\PI_4eme-Template\PI_4eme-Template\Platforme
npm install
ng serve
```
✅ Attendre: `Compiled successfully`

---

## 🔧 ÉTAPE 2: Créer des Données de Test

### Option A: Via Swagger UI

1. Ouvrir: http://localhost:8083/swagger-ui.html

2. **Créer une Entreprise** (CompanyController)
   ```json
   POST /api/b2b/companies
   {
     "name": "TechCorp",
     "email": "contact@techcorp.com",
     "siret": "12345678901234",
     "sector": "IT",
     "address": "123 Rue de Paris",
     "phone": "0123456789",
     "createdBy": 1
   }
   ```

3. **Créer une Offre d'Emploi** (JobOfferController)
   ```json
   POST /api/b2b/job-offers
   {
     "companyId": 1,
     "title": "Développeur Full Stack",
     "description": "Nous recherchons un développeur expérimenté",
     "contractType": "CDI",
     "location": "Paris",
     "requiredSkills": ["Java", "Spring Boot", "Angular", "MySQL"]
   }
   ```

4. **Créer un Candidat** (CandidateController)
   ```json
   POST /api/b2b/candidates
   {
     "id": 1,
     "title": "Jean Dupont",
     "skills": ["Java", "Spring", "Angular"],
     "experienceYears": 5,
     "resumeUrl": "https://example.com/cv.pdf",
     "isLookingForJob": true
   }
   ```

5. **Créer une Candidature** (ApplicationController)
   ```json
   POST /api/b2b/applications
   {
     "jobOfferId": 1,
     "candidateId": 1
   }
   ```

### Option B: Via Postman

Importer la collection: `B2BModule/B2B_Email_Notification_Postman.json`

### Option C: Via Script PowerShell

```powershell
# Créer une entreprise
$company = @{
    name = "TechCorp"
    email = "contact@techcorp.com"
    siret = "12345678901234"
    sector = "IT"
    address = "123 Rue de Paris"
    phone = "0123456789"
    createdBy = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8083/api/b2b/companies" -Method Post -Body $company -ContentType "application/json"

# Créer une offre
$job = @{
    companyId = 1
    title = "Développeur Full Stack"
    description = "Nous recherchons un développeur expérimenté"
    contractType = "CDI"
    location = "Paris"
    requiredSkills = @("Java", "Spring Boot", "Angular")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8083/api/b2b/job-offers" -Method Post -Body $job -ContentType "application/json"

# Créer un candidat
$candidate = @{
    id = 1
    title = "Jean Dupont"
    skills = @("Java", "Spring", "Angular")
    experienceYears = 5
    resumeUrl = "https://example.com/cv.pdf"
    isLookingForJob = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8083/api/b2b/candidates" -Method Post -Body $candidate -ContentType "application/json"

# Créer une candidature
$application = @{
    jobOfferId = 1
    candidateId = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8083/api/b2b/applications" -Method Post -Body $application -ContentType "application/json"
```

---

## 🌐 ÉTAPE 3: Accéder à l'Interface

1. Ouvrir le navigateur: **http://localhost:4200**

2. Se connecter (si authentification requise)

3. Naviguer vers: **Admin > B2B > Applications**
   - URL directe: http://localhost:4200/admin/b2b/applications

---

## ✅ ÉTAPE 4: Tester les Fonctionnalités

### 4.1 Liste des Candidatures

**Ce que tu dois voir:**
- ✅ Statistiques en haut (Total, En attente, Présélectionnées, etc.)
- ✅ Filtres (Statut, Recherche, Tri)
- ✅ Table avec toutes les candidatures
- ✅ Boutons d'action (Voir, Accepter, Refuser)

**Tests à faire:**
1. ✅ Filtrer par statut (En attente, Acceptée, Refusée)
2. ✅ Rechercher un candidat par nom
3. ✅ Trier par date, score, statut
4. ✅ Cliquer sur "Voir détails" (icône œil)

### 4.2 Accepter un Candidat

**Étapes:**
1. Cliquer sur le bouton vert ✅ "Accepter"
2. Une modale s'ouvre avec:
   - Informations du candidat
   - Email du candidat (auto-rempli)
   - Message personnalisé
   - Aperçu de l'email
3. Modifier le message si nécessaire
4. Cliquer sur "Envoyer l'email"

**Ce qui doit se passer:**
- ✅ Email envoyé au candidat
- ✅ Statut changé en "ACCEPTED"
- ✅ Message de succès affiché
- ✅ Liste rafraîchie automatiquement

### 4.3 Refuser un Candidat

**Étapes:**
1. Cliquer sur le bouton rouge ❌ "Refuser"
2. Modale similaire à l'acceptation
3. Message par défaut pour refus
4. Cliquer sur "Envoyer l'email"

**Ce qui doit se passer:**
- ✅ Email envoyé au candidat
- ✅ Statut changé en "REJECTED"
- ✅ Message de succès affiché

### 4.4 Voir les Détails

**Étapes:**
1. Cliquer sur l'icône œil 👁️
2. Page de détail s'ouvre

**Ce que tu dois voir:**
- ✅ Informations du candidat
- ✅ Informations de l'offre d'emploi
- ✅ Score de compatibilité (cercle coloré)
- ✅ Timeline de la candidature
- ✅ Boutons d'action (Accepter/Refuser)

---

## 📧 ÉTAPE 5: Vérifier les Emails

### Configuration Email (si pas déjà fait)

Le backend utilise Gmail SMTP. Vérifier dans:
```
B2BModule/src/main/resources/application.properties
```

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**Pour tester l'envoi d'email:**
1. Utiliser une vraie adresse email pour le candidat
2. Accepter ou refuser la candidature
3. Vérifier la boîte email du candidat

---

## 🐛 DÉPANNAGE

### Problème 1: Backend ne démarre pas
```bash
# Vérifier MySQL
# Vérifier le port 8083 est libre
netstat -ano | findstr :8083

# Nettoyer et recompiler
mvn clean install
mvn spring-boot:run
```

### Problème 2: Frontend ne compile pas
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install

# Vérifier la version de Node
node --version  # Doit être >= 18

# Redémarrer
ng serve
```

### Problème 3: Page blanche ou erreur 404
- Vérifier que tu es sur: http://localhost:4200/admin/b2b/applications
- Vérifier la console du navigateur (F12)
- Vérifier que le backend répond: http://localhost:8083/api/b2b/applications

### Problème 4: Erreur CORS
Vérifier dans `B2BModule/src/main/java/.../controller/ApplicationController.java`:
```java
@CrossOrigin(origins = "*")
```

### Problème 5: Email ne s'envoie pas
- Vérifier les logs du backend
- Vérifier la configuration SMTP
- Tester avec Postman d'abord:
  ```
  POST http://localhost:8083/api/b2b/applications/notify
  {
    "candidateEmail": "test@example.com",
    "candidateName": "Test User",
    "jobTitle": "Developer",
    "companyName": "TechCorp",
    "status": "ACCEPTED",
    "message": "Welcome!"
  }
  ```

---

## 📊 CHECKLIST DE TEST

### Fonctionnalités de Base
- [ ] Backend démarre sans erreur
- [ ] Frontend compile sans erreur
- [ ] Page de liste s'affiche
- [ ] Statistiques sont correctes
- [ ] Filtres fonctionnent
- [ ] Recherche fonctionne
- [ ] Tri fonctionne

### Fonctionnalités Avancées
- [ ] Modal d'acceptation s'ouvre
- [ ] Email auto-rempli
- [ ] Aperçu de l'email correct
- [ ] Envoi d'email fonctionne
- [ ] Statut mis à jour
- [ ] Page de détail s'affiche
- [ ] Timeline affichée correctement
- [ ] Score de compatibilité affiché

### Design & UX
- [ ] Design moderne et professionnel
- [ ] Animations fluides
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Pas d'erreurs dans la console
- [ ] Messages de succès/erreur clairs

---

## 🎯 RÉSULTAT ATTENDU

Après tous ces tests, tu devrais avoir:
1. ✅ Une liste complète des candidatures
2. ✅ Des filtres fonctionnels
3. ✅ La possibilité d'accepter/refuser avec envoi d'email
4. ✅ Une page de détail complète
5. ✅ Un système professionnel et utilisable

---

## 📞 BESOIN D'AIDE?

Si tu rencontres un problème:
1. Vérifier les logs du backend (terminal 1)
2. Vérifier la console du navigateur (F12)
3. Vérifier que les données existent dans la base
4. Me donner l'erreur exacte pour que je t'aide!

**Bon test! 🚀**
