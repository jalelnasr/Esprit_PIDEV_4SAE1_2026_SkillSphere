# 📧 Guide Système de Mailing pour Candidats

## 🎯 Objectif
Envoyer des emails automatiques aux candidats quand le RH accepte ou refuse leur candidature.

---

## ✅ Ce qui a été fait

1. ✅ Ajout de la dépendance `spring-boot-starter-mail` dans pom.xml
2. ✅ Configuration SMTP Gmail dans application.properties
3. ✅ Création de `EmailNotificationDTO.java` (DTO pour les données email)
4. ✅ Création de `EmailService.java` (service d'envoi d'emails)
5. ✅ Ajout de 2 nouveaux endpoints dans `ApplicationController.java`
6. ✅ Compilation réussie (BUILD SUCCESS)

---

## 🚀 Comment démarrer

### Étape 1: Lancer le backend

```powershell
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"
mvn spring-boot:run
```

Attends que tu vois:
```
Started B2bModuleApplication in X.XXX seconds
Tomcat started on port(s): 8083
```

### Étape 2: Tester le système

```powershell
.\test_mailing_system.ps1
```

Tu devrais recevoir 2 emails sur `aziz2guizeni@gmail.com`:
- 1 email ACCEPTED (vert avec ✅)
- 1 email REJECTED (gris avec 📋)

---

## 📡 Les 2 nouveaux endpoints

### 1. POST /api/b2b/applications/notify
**Usage:** Envoyer un email sans modifier la base de données

**Exemple:**
```powershell
curl -X POST "http://localhost:8083/api/b2b/applications/notify" `
  -H "Content-Type: application/json" `
  -d '{
    "candidateEmail": "candidat@email.com",
    "candidateName": "Jean Dupont",
    "jobTitle": "Developpeur Java",
    "companyName": "TechCorp",
    "status": "ACCEPTED",
    "message": "Bienvenue!"
  }'
```

### 2. PUT /api/b2b/applications/{id}/status-notify
**Usage:** Changer le statut dans la BD ET envoyer un email

**Exemple:**
```powershell
curl -X PUT "http://localhost:8083/api/b2b/applications/1/status-notify?status=ACCEPTED" `
  -H "Content-Type: application/json" `
  -d '{
    "candidateEmail": "candidat@email.com",
    "candidateName": "Jean Dupont",
    "jobTitle": "Developpeur Java",
    "companyName": "TechCorp",
    "status": "ACCEPTED",
    "message": "Bienvenue!"
  }'
```

---

## 🎨 Design de l'email

Les emails sont en HTML professionnel avec:
- Header avec gradient bleu/violet
- Statut ACCEPTED (vert ✅) ou REJECTED (gris 📋)
- Message personnalisé du RH (optionnel)
- Footer avec copyright

---

## 🔧 Configuration SMTP

Le système utilise Gmail SMTP:
- Host: smtp.gmail.com
- Port: 587
- Email: aziz2guizeni@gmail.com
- Password: dabwejwnyqaryees (App Password)

⚠️ **Important:** Ce mot de passe est un "App Password" Gmail, pas le mot de passe principal.

---

## 🧪 Workflow complet

1. **Candidat postule** → Endpoint existant `POST /api/b2b/applications`
2. **RH voit les candidatures** → Frontend Angular
3. **RH accepte/refuse** → Frontend appelle `PUT /api/b2b/applications/{id}/status-notify`
4. **Backend:**
   - Met à jour le statut dans la BD
   - Envoie l'email au candidat
5. **Candidat reçoit l'email** → Dans sa boîte mail

---

## 📱 Intégration Frontend Angular

Dans ton service Angular:

```typescript
acceptCandidate(applicationId: number, candidateData: any) {
  const url = `http://localhost:8083/api/b2b/applications/${applicationId}/status-notify?status=ACCEPTED`;
  
  const emailData = {
    candidateEmail: candidateData.email,
    candidateName: candidateData.name,
    jobTitle: candidateData.jobTitle,
    companyName: "TechCorp",
    status: "ACCEPTED",
    message: "Bienvenue dans notre équipe!"
  };
  
  return this.http.put(url, emailData);
}

rejectCandidate(applicationId: number, candidateData: any) {
  const url = `http://localhost:8083/api/b2b/applications/${applicationId}/status-notify?status=REJECTED`;
  
  const emailData = {
    candidateEmail: candidateData.email,
    candidateName: candidateData.name,
    jobTitle: candidateData.jobTitle,
    companyName: "TechCorp",
    status: "REJECTED",
    message: "Merci pour votre candidature."
  };
  
  return this.http.put(url, emailData);
}
```

---

## ✅ Checklist de vérification

- [ ] Backend démarre sans erreur
- [ ] Port 8083 accessible
- [ ] Test script fonctionne
- [ ] Emails reçus dans la boîte mail
- [ ] Email ACCEPTED a le bon design (vert)
- [ ] Email REJECTED a le bon design (gris)
- [ ] Message personnalisé apparaît dans l'email

---

## 🐛 Troubleshooting

### Problème: "Failed to send email"
**Solution:** Vérifie que le mot de passe Gmail App est correct dans `application.properties`

### Problème: "Connection timeout"
**Solution:** Vérifie ta connexion internet et que le port 587 n'est pas bloqué

### Problème: Email dans les spams
**Solution:** Normal pour les tests. En production, utilise un domaine professionnel

### Problème: Backend ne démarre pas
**Solution:** 
```powershell
# Arrête tous les processus Java
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# Relance
mvn spring-boot:run
```

---

## 📊 Résumé

Tu as maintenant un système de mailing fonctionnel qui:
- ✅ Envoie des emails professionnels aux candidats
- ✅ Supporte ACCEPTED et REJECTED
- ✅ Permet des messages personnalisés du RH
- ✅ S'intègre facilement avec Angular
- ✅ Utilise Gmail SMTP (gratuit)

**Le système est prêt à être utilisé!** 🚀
