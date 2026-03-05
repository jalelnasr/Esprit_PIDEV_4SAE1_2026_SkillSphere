# 📮 GUIDE POSTMAN - TEST DES ENDPOINTS EMAIL

## Installation et Configuration

### Étape 1 : Télécharger Postman
- Allez sur : https://www.postman.com/downloads/
- Téléchargez la version pour Windows
- Installez-la

### Étape 2 : Importer la collection

1. Ouvrez **Postman**
2. Cliquez sur **"File"** → **"Import"**
3. Sélectionnez le fichier :
   ```
   B2B_Email_Notification_Postman.json
   ```
4. La collection s'importe automatiquement

---

## 🎯 Utilisation des Endpoints

### Test 1 : Envoyer un email ACCEPTED

**URL :** `POST http://localhost:8083/api/b2b/applications/notify`

**Headers :**
```
Content-Type: application/json
```

**Body (JSON Raw) :**
```json
{
  "candidateEmail": "votre.email@gmail.com",
  "candidateName": "Jean Dupont",
  "jobTitle": "Senior Backend Developer",
  "companyName": "TechCorp International",
  "status": "ACCEPTED",
  "message": "Nous sommes ravis de vous accueillir dans notre équipe! Votre profil nous a beaucoup impressionnés."
}
```

**Résultat attendu :**
```json
{
  "message": "Email sent successfully to votre.email@gmail.com"
}
```

**Status Code :** `200 OK`

---

### Test 2 : Envoyer un email REJECTED

**URL :** `POST http://localhost:8083/api/b2b/applications/notify`

**Headers :**
```
Content-Type: application/json
```

**Body (JSON Raw) :**
```json
{
  "candidateEmail": "candidate@example.com",
  "candidateName": "Marie Martin",
  "jobTitle": "Data Scientist",
  "companyName": "InnovateLabs",
  "status": "REJECTED",
  "message": "Merci pour votre candidature. Nous vous encourageons à postuler pour d'autres offres."
}
```

**Résultat attendu :**
```json
{
  "message": "Email sent successfully to candidate@example.com"
}
```

**Status Code :** `200 OK`

---

### Test 3 : Mettre à jour statut ET envoyer email

**URL :** `PUT http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED`

**Note :** Remplacez `1` par l'ID réel d'une application

**Headers :**
```
Content-Type: application/json
```

**Body (JSON Raw) :**
```json
{
  "candidateEmail": "pierre.dupont@example.com",
  "candidateName": "Pierre Dupont",
  "jobTitle": "Architecte Logiciel",
  "companyName": "GlobalTech Solutions",
  "status": "ACCEPTED",
  "message": "Bienvenue! Nous avons hâte de commencer avec vous."
}
```

**Résultat attendu :**
```json
{
  "id": 1,
  "candidate": { ... },
  "jobOffer": { ... },
  "status": "ACCEPTED",
  "appliedAt": "2026-03-05T00:00:00"
}
```

**Status Code :** `200 OK`

---

## 🧪 Scénarios de Test Complets

### Scénario 1 : Candidat Accepté

1. **Créer un candidat :**
   - POST `/api/b2b/candidates`

2. **Créer une application :**
   - POST `/api/b2b/applications`

3. **Envoyer email d'acceptation :**
   - POST `/api/b2b/applications/notify` avec status = "ACCEPTED"

4. **Vérifier dans Gmail :**
   - L'email doit avoir un badge ✅ ACCEPTED (vert)

### Scénario 2 : Candidat Refusé

1. Mêmes étapes 1-2

2. **Envoyer email de rejet :**
   - POST `/api/b2b/applications/notify` avec status = "REJECTED"

3. **Vérifier dans Gmail :**
   - L'email doit avoir un badge ❌ REJECTED (gris)

### Scénario 3 : Mise à Jour avec Message HR

1. Créer candidat + application

2. **Mettre à jour et notifier :**
   - PUT `/api/b2b/applications/{id}/status-notify?status=ACCEPTED`
   - Ajouter un message personnalisé du RH

3. **Vérifier dans Gmail :**
   - Le message HR doit apparaître dans une section spéciale

---

## 📊 Vérification des Champs

| Champ | Type | Exemple | Obligatoire |
|-------|------|---------|------------|
| candidateEmail | String | aziz2guizeni@gmail.com | ✅ |
| candidateName | String | Ahmed Guizeni | ✅ |
| jobTitle | String | Développeur Senior | ✅ |
| companyName | String | MarketingPro | ✅ |
| status | String | ACCEPTED ou REJECTED | ✅ |
| message | String | Bienvenue! | ❌ (optionnel) |

---

## 🎨 Apparence des Emails

### Email ACCEPTED (Status 200)
```
Header: MarketingPro (gradient bleu/violet)

✅ ACCEPTED (badge vert)

Chère Ahmed,

We are delighted to inform you that your application for the 
position of Développeur Senior at MarketingPro has been accepted! 🎉

We are excited to welcome you to our team. Our HR department 
will contact you shortly with the next steps.

[Message HR optionnel en italique]

Position: Développeur Senior
Company: MarketingPro
Status: ✅ ACCEPTED

Best regards,
MarketingPro HR Team

────────────────────────────────────────────────────────
This is an automated email from MarketingPro HR Portal
Powered by B2B Platform
```

### Email REJECTED (Status 200)
```
Header: InnovateLabs (gradient bleu/violet)

❌ REJECTED (badge gris)

Chère Marie,

Thank you for your interest in the position of Data Scientist 
at InnovateLabs.

After careful review of all applications, we regret to inform you 
that your application has not been retained at this time.

We encourage you to apply for future opportunities with us. 
We wish you the best in your career.

[Message HR optionnel]

Position: Data Scientist
Company: InnovateLabs
Status: ❌ REJECTED

Best regards,
InnovateLabs HR Team

────────────────────────────────────────────────────────
This is an automated email from InnovateLabs HR Portal
Powered by B2B Platform
```

---

## ⚡ Astuces Postman

### Sauvegarder les variables

1. Cliquez sur **"Environments"** (en bas à gauche)
2. Cliquez sur **"Create"**
3. Nommez-le "B2B Development"
4. Ajoutez des variables :

```
baseUrl = http://localhost:8083
apiPath = /api/b2b/applications
email = aziz2guizeni@gmail.com
```

### Utiliser les variables dans les requêtes

```
{{baseUrl}}{{apiPath}}/notify
```

Cela évite de taper l'URL complète à chaque fois!

### Pre-request Script

Ajouter automatiquement des headers :

```javascript
pm.request.headers.add({
    key: 'Content-Type',
    value: 'application/json'
});
```

### Tests automatiques

Ajouter des assertions après chaque requête :

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response contains success message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Email sent successfully");
});
```

---

## 🔍 Vérification des Erreurs

### Status 500 : Erreur serveur
```
Vérifier:
1. Le backend est démarré
2. Les logs IntelliJ affichent des erreurs
3. La configuration email est correcte
```

### Status 400 : Requête invalide
```
Vérifier:
1. Tous les champs obligatoires sont présents
2. Le JSON est valide (pas de virgules manquantes)
3. Les types sont corrects (string, pas int)
```

### Status 404 : Ressource non trouvée (endpoint PUT)
```
Vérifier:
1. L'ID de l'application existe
2. L'endpoint est correct
3. L'ID n'a pas de zéro avant le chiffre
```

---

## 📧 Configuration Email dans Postman

Pour tester sans connaissance détaillée :

**URL Base :** `http://localhost:8083/api/b2b/applications`

**Chemins :**
- **POST** → `/notify` → Envoyer email simple
- **PUT** → `/{id}/status-notify?status=ACCEPTED` → Mettre à jour + email
- **PUT** → `/{id}/status-notify?status=REJECTED` → Mettre à jour + email

**Format obligatoire :** JSON

---

## 🎯 Checklist Avant Test Postman

- [ ] Backend démarré (IntelliJ - Shift + F10)
- [ ] Logs affichent "Started B2bModuleApplication"
- [ ] Port 8083 actif
- [ ] Postman ouvert
- [ ] Collection importée
- [ ] Gmail accessible (internet OK)

---

## ✅ Test de Succès

Après chaque requête, vous devez voir :

1. **Status Code : 200** (vert)
2. **Response Body :**
   ```json
   {
     "message": "Email sent successfully to [email]"
   }
   ```
3. **Email reçu dans Gmail** (après 1-2 minutes)

---

## 🚀 Prochaines Étapes

1. **Automatiser les tests :** Utiliser les Pre-request Scripts
2. **Documenter les réponses :** Ajouter des exemples
3. **Partager la collection :** Via Postman Cloud
4. **Intégrer dans CI/CD :** Newman (CLI Postman)

---

**Bon test! 📮✨**

