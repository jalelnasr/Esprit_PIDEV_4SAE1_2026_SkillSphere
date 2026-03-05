# 🔍 DIAGNOSTIC - POURQUOI LE MAILING NE FONCTIONNE PAS

## ❌ PROBLÈMES POSSIBLES (dans l'ordre)

### 1️⃣ Le Backend N'A PAS ÉTÉ REDÉMARRÉ
**Solution :**
```powershell
# Arrêter tous les processus Java
powershell -ExecutionPolicy Bypass -File stop_and_clean.ps1

# Relancer dans IntelliJ
# Shift + F10 (attendez 2-3 minutes)
```

### 2️⃣ Les Credentials Gmail Sont Mauvais
**Vérifier dans application.properties :**
```properties
spring.mail.username=aziz2guizeni@gmail.com
spring.mail.password=dabwejwnyqaryees
```

**Si l'authentification échoue :**
1. Allez sur : https://myaccount.google.com/apppasswords
2. Générez un nouveau mot de passe d'application
3. Remplacez dans application.properties

### 3️⃣ Compilation Non Complète
**Solution :**
```powershell
# Nettoyer et recompiler
cd "C:\Users\mouha\Downloads\...\B2BModule"
mvn clean compile
```

### 4️⃣ Pom.xml Manque la Dépendance Mail
**Vérifier que pom.xml contient :**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

---

## ✅ CHECKLIST DE VÉRIFICATION

Exécutez dans PowerShell (admin) :

```powershell
# ÉTAPE 1 : Arrêter les processus
Write-Host "Arrêt des processus Java..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# ÉTAPE 2 : Vérifier les fichiers
Write-Host "Vérification des fichiers..." -ForegroundColor Cyan

$files = @(
    "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule\src\main\java\org\example\b2bmodule\dto\EmailNotificationDTO.java",
    "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule\src\main\java\org\example\b2bmodule\service\EmailService.java",
    "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule\src\main\java\org\example\b2bmodule\controller\ApplicationController.java",
    "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule\src\main\resources\application.properties"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NOT FOUND" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Maintenant: Relancer IntelliJ et appuyer sur Shift + F10" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
```

---

## 🎯 APRÈS LE REDÉMARRAGE

Une fois le backend redémarré, exécutez :

```powershell
powershell -ExecutionPolicy Bypass -File test_email_quick.ps1
```

---

## 📋 VÉRIFICATION DÉTAILLÉE

### Vérifier que JavaMailSender est injecté

Dans les logs IntelliJ, cherchez :
```
o.s.b.a.m.MailSenderAutoConfiguration
```

### Vérifier la configuration SMTP

Les logs doivent montrer :
```
Initializing JavaMailSender...
Mail configuration loaded from application.properties
```

### Tester manuellement

```powershell
# Test basique - vérifier que l'API répond
curl http://localhost:8083/api/b2b/applications

# Doit retourner du JSON (même si c'est une liste vide)
# Si ça marche, le backend est actif
```

---

## 🚨 SI RIEN NE MARCHE

### Option A : Compiler en ligne de commande
```powershell
cd "C:\Users\mouha\Downloads\wetransfer_pi_4eme-template-rar_2026-02-23_2049\B2BModule"
mvn clean install
mvn spring-boot:run
```

### Option B : Vérifier les logs complets
1. Dans IntelliJ, allez dans **Run** → **Edit Configurations**
2. Vérifiez que **Spring Boot** est sélectionné
3. Copiez les logs complets et cherchez les erreurs

### Option C : Recréer les fichiers

Si rien ne fonctionne, on recrée les fichiers de zéro. Dites-moi!

---

## 💡 RAPPEL DE LA PROCÉDURE CORRECTE

```
1. Arrêter Java                    → stop_and_clean.ps1
2. Ouvrir IntelliJ                 → Double-clic sur pom.xml
3. Laisser charger (2-3 min)       → Attendre "Ready"
4. Appuyer Shift + F10             → Backend démarre
5. Attendre "Started B2B..."       → Environ 30-60 secondes
6. Exécuter test_email_quick.ps1   → Tester l'API
7. Vérifier Gmail                  → Après 1-2 minutes
```

---

## ✨ COMMANDES RAPIDES

```powershell
# Afficher l'aide
Get-Alias | where Name -like "*process*"

# Tuer rapidement tous les Java
Get-Process java | Kill

# Vérifier si le port 8083 est libre
(Get-NetTCPConnection -LocalPort 8083 -ErrorAction SilentlyContinue) | Select *

# Relancer tout
powershell -ExecutionPolicy Bypass -File stop_and_clean.ps1; Write-Host "Backend arrêté. Relancez Shift+F10" -ForegroundColor Green
```

---

**Dites-moi :** Quel est exactement le symptôme?
- [ ] Les endpoints ne sont pas créés (404 Not Found)
- [ ] Les endpoints répondent mais email non envoyé
- [ ] Erreur lors du démarrage du backend
- [ ] Autre: _________________

Je vais corriger le problème directement! 🔧

