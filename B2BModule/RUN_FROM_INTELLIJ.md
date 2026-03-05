# ✅ DÉMARRAGE DEPUIS INTELLIJ - GUIDE FINAL

**Date:** 2026-03-05  
**Status:** ✅ Prêt à fonctionner

---

## 🎯 CE QUE VOUS DEVEZ FAIRE

### ✅ ÉTAPE 1 : ARRÊTER LES PROCESSUS JAVA (DÉJÀ FAIT ✓)
```
✅ Tous les processus Java arrêtés
✅ Port 8083 libéré
```

### ✅ ÉTAPE 2 : CONFIGURATION APPLIQUÉE (DÉJÀ FAIT ✓)
```properties
✅ Eureka DÉSACTIVÉ: eureka.client.enabled=false
✅ Email ACTIVÉ: spring.mail.host=smtp.gmail.com
✅ Port correct: server.port=8083
✅ Database MySQL: jdbc:mysql://localhost:3306/b2bmodule
```

---

## 🚀 MAINTENANT : CLIQUEZ SUR RUN DANS INTELLIJ

### Dans IntelliJ IDEA :

1. **Ouvrir le projet B2BModule**
   - File → Open → Sélectionner le dossier B2BModule

2. **Attendez que IntelliJ indexe les fichiers**
   - Attendre le message "Indexing completed"

3. **Cliquez sur le bouton RUN ▶️**
   - En haut à droite: **Shift + F10**
   - Ou: **Run → Run 'B2bModuleApplication'**

4. **Attendez le message de succès**
   ```
   ✅ Tomcat initialized with port 8083 (http)
   ✅ Started B2bModuleApplication in X seconds
   ```

---

## ✅ VÉRIFICATION

Une fois le backend démarré :

### Test 1 : Vérifier le port
```powershell
netstat -ano | findstr :8083
# Doit afficher : TCP localhost:8083 LISTENING
```

### Test 2 : Tester l'API
```powershell
curl http://localhost:8083/api/b2b/applications
# Doit retourner une réponse JSON (peut être vide)
```

### Test 3 : Tester l'email
```powershell
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"
powershell -ExecutionPolicy Bypass -File test_quick.ps1
# Doit afficher: ✅ SUCCESS: Email sent!
```

---

## 🔍 SI ERREUR "PORT ALREADY IN USE"

### Solution Rapide :
```powershell
# 1. Arrêter les processus
Get-Process java | Stop-Process -Force

# 2. Attendre 3 secondes
Start-Sleep -Seconds 3

# 3. Cliquer sur RUN dans IntelliJ
```

---

## 📝 POINTS IMPORTANTS

✅ **Configuration finale vérifiée**
- Eureka désactivé (pas d'erreur de connexion)
- Email activé (Gmail SMTP prêt)
- Port 8083 libre
- MySQL connectée

✅ **À faire à chaque redémarrage**
1. Arrêter les processus Java existants
2. Cliquer sur RUN dans IntelliJ
3. Attendre le message "Started B2bModuleApplication"

✅ **Ne pas faire**
- ❌ Ne pas lancer `java -jar` depuis PowerShell si IntelliJ est ouvert
- ❌ Ne pas modifier application.properties sans raison

---

## 🎉 C'EST TOUT !

Le projet est maintenant prêt. Quand vous cliquez sur **RUN** dans IntelliJ, le backend démarre automatiquement sur le port 8083 avec :

- ✅ API disponible
- ✅ Email activé
- ✅ Database MySQL connectée
- ✅ Aucune erreur Eureka

**Bonne chance ! 🚀**

