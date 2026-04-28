# 🎬 GUIDE ÉTAPE PAR ÉTAPE - RELANCER LE BACKEND

## 📍 OÙ TU ES MAINTENANT

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ✅ Nettoyage terminé                                          │
│  ✅ Code mailing supprimé                                      │
│  ✅ ApplicationController restauré                             │
│  ✅ Compilation réussie (BUILD SUCCESS)                        │
│                                                                 │
│  👉 PROCHAINE ÉTAPE: Relancer le backend                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 ÉTAPE 1: ARRÊTER JAVA (si le serveur tourne)

### Option A: Depuis PowerShell
```powershell
# Ouvre une fenêtre PowerShell et exécute:
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# Attends 2 secondes
Start-Sleep -Seconds 2

# Vérifie que Java est arrêté
Get-Process java -ErrorAction SilentlyContinue
# (Devrait retourner rien)
```

### Option B: Depuis IntelliJ
```
1. Regarde en bas de la fenêtre IntelliJ
2. Si tu vois "Spring Boot App" en train de tourner
3. Clique sur le carré rouge ⏹️ pour l'arrêter
```

---

## 📂 ÉTAPE 2: VÉRIFIER LE DOSSIER DU PROJET

### Vérifie que tu es dans le bon répertoire:
```powershell
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"

# Vérifie la présence de pom.xml
dir pom.xml
# Devrait afficher: pom.xml

# Vérifie l'absence de EmailService.java
dir /s EmailService.java
# Devrait retourner: (rien trouvé)
```

---

## 🎯 ÉTAPE 3: RELANCER LE SERVEUR

### 🏆 MEILLEURE MÉTHODE: Depuis IntelliJ

```
1. Ouvre IntelliJ
2. Ouvre le fichier: B2bModuleApplication.java
   (Chemin: src/main/java/org/example/b2bmodule/B2bModuleApplication.java)
3. Appuie sur: Shift + F10
   (ou clic sur le bouton Run ▶️ en haut à droite)
4. IntelliJ va compiler et lancer le serveur
5. Attends 2-3 minutes (il y a un spinning loader)
6. Regarde en bas de la fenêtre pour:
   "Started B2bModuleApplication in X.XXX seconds"
```

**Écran attendu:**
```
15:43:22.123  INFO 12345 --- [B2BMODULE] [main] o.e.b2bmodule.B2bModuleApplication : Starting B2bModuleApplication
15:43:23.456  INFO 12345 --- [B2BMODULE] [main] o.s.b.w.embedded.tomcat.TomcatWebServer : Tomcat initialized with port(s): 8083 (http)
...
15:43:25.789  INFO 12345 --- [B2BMODULE] [main] o.e.b2bmodule.B2bModuleApplication : Started B2bModuleApplication in 3.666 seconds
```

---

## ✅ ÉTAPE 4: VÉRIFIER QUE LE SERVEUR EST DÉMARRÉ

### Vérifier que le port 8083 est accessible

```powershell
# Ouvre une NOUVELLE fenêtre PowerShell
# (garde la première ouverte avec le serveur)

# Teste la connexion au serveur
curl http://localhost:8083/api/b2b/applications

# Résultat attendu:
# [...]  (Liste JSON des candidatures)
# Status: 200 OK ✅
```

---

## 🧪 ÉTAPE 5: TESTER LES ENDPOINTS

### Test 1: Lister les candidatures
```powershell
curl http://localhost:8083/api/b2b/applications
```

**Résultat attendu:**
```json
[...]  # Array JSON
# Status: 200 OK ✅
```

**⚠️ Pas ça (Erreur):**
```json
{
  "timestamp": "2026-03-05T00:39:52.000+00:00",
  "status": 500,
  "error": "Internal Server Error"
}
# Status: 500 ❌
```

---

### Test 2: Obtenir une candidature spécifique
```powershell
curl http://localhost:8083/api/b2b/applications/1
```

**Résultat attendu:**
- Status: 200 OK (si la candidature existe) ✅
- OU Status: 404 Not Found (si elle n'existe pas) ✅

**Pas accepté:**
- Status: 500 ❌

---

### Test 3: Swagger UI
```
Ouvre ton navigateur sur:
http://localhost:8083/swagger-ui.html
```

**Tu dois voir:**
- Une belle interface Swagger
- La liste de tous les endpoints
- Les 8 endpoints d'applications (pas les 2 de mailing)

---

## 📊 CHECKLIST DE VÉRIFICATION

- [ ] Java arrêté (pas de "Port already in use")
- [ ] IntelliJ compilant/démarrant
- [ ] Console affichant "Started B2bModuleApplication"
- [ ] Port 8083 accessible (curl retourne 200)
- [ ] GET /api/b2b/applications retourne 200 ✅
- [ ] GET /api/b2b/applications/1 retourne 200 ou 404 ✅
- [ ] Swagger UI accessible et complet ✅
- [ ] Pas d'erreur "EmailService not found" ❌
- [ ] Pas d'erreur "Port already in use" ❌

---

## 🎓 SI QUELQUE CHOSE NE MARCHE PAS

### Problème 1: "Port 8083 already in use"

**Solution:**
```powershell
# Arrêter TOUS les processus Java
Get-Process java | Stop-Process -Force -ErrorAction SilentlyContinue

# Attends 3 secondes
Start-Sleep -Seconds 3

# Relance depuis IntelliJ (Shift+F10)
```

---

### Problème 2: "emailService field cannot be resolved"

**Solution:**
```
Cette erreur signifie que le nettoyage n'a pas fonctionné.
1. Ferme IntelliJ complètement
2. Va à: src/main/java/org/example/b2bmodule/controller/ApplicationController.java
3. Cherche "EmailService" dans le fichier
4. Si tu le vois, ouvre NEXT_STEPS.md
```

---

### Problème 3: "BUILD FAILURE during compilation"

**Solution:**
```powershell
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"

# Nettoie complètement le projet
mvn clean

# Relance depuis IntelliJ (Shift+F10)
```

---

### Problème 4: "curl: command not found"

```powershell
# Si tu utilises PowerShell et que curl ne marche pas:
Invoke-WebRequest -Uri http://localhost:8083/api/b2b/applications

# Ou utilise un navigateur:
http://localhost:8083/swagger-ui.html
```

---

## 🎉 SUCCÈS!

Si tu vois ça:

```
✅ Serveur lancé (console affiche "Started B2bModuleApplication")
✅ curl retourne 200 OK
✅ Swagger UI accessible
✅ Pas d'erreur concernant EmailService
```

**ALORS TU AS RÉUSSI! 🚀**

---

## 📞 RESSOURCES

- **Doute?** Consulte `NEXT_STEPS.md`
- **Vérification détaillée?** Consulte `VERIFICATION_NETTOYAGE.md`
- **Résumé visuel?** Consulte `RESUME_NETTOYAGE.md`

---

**Créé:** 2026-03-05 00:39:52+01:00  
**Prêt à relancer!** 🚀

Appuie sur **Shift+F10** et attends! ⏱️

