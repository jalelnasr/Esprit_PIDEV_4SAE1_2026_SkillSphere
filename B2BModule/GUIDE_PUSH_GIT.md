# 🚀 GUIDE DE PUSH GIT - B2B MODULE

## 📋 RÉSUMÉ

Vous allez pusher votre travail en **2 étapes** :

1. **Backend** : Branche `b2b` → Push B2BModule uniquement → Merge dans main
2. **Frontend** : Branche `b2b-front` → Push frontend → Merge avec le frontend de vos amis

---

## ⚠️ IMPORTANT AVANT DE COMMENCER

### Vérifications :
- ✅ Vos amis ont déjà mergé leur travail dans `main`
- ✅ Vous avez Git installé
- ✅ Vous êtes authentifié avec GitHub

### Ce qui sera pushé :
- **Backend** : UNIQUEMENT `B2BModule/` (pas PlatformeBack, pas API Gateway, pas Eureka)
- **Frontend** : Votre frontend depuis `C:\Users\mouha\Desktop\skill\PI_4eme-Template`

---

## 🎯 ÉTAPE 1 : PUSH DU BACKEND (Branche b2b)

### Option A : Utiliser le script automatique (RECOMMANDÉ)

```powershell
# Ouvrir PowerShell dans le dossier B2BModule
cd C:\Users\mouha\Desktop\skill\B2BModule

# Exécuter le script
.\push_b2b_backend.ps1
```

### Option B : Commandes manuelles

```powershell
# 1. Cloner le repo
cd C:\Users\mouha\Desktop\skill
git clone https://github.com/jalehnan/Esprit_PIDEV_4SAE1_2026_SkillSphere.git temp_b2b_backend
cd temp_b2b_backend

# 2. Créer la branche b2b
git checkout -b b2b

# 3. Copier UNIQUEMENT B2BModule
Copy-Item -Path "C:\Users\mouha\Desktop\skill\B2BModule" -Destination ".\B2BModule" -Recurse -Force

# 4. Commit et push
git add B2BModule/
git commit -m "feat: add B2BModule microservice for corporate training"
git push origin b2b
```

### Après le push :

1. Aller sur GitHub : https://github.com/jalehnan/Esprit_PIDEV_4SAE1_2026_SkillSphere
2. Vous verrez un message "Compare & pull request" pour la branche `b2b`
3. Cliquer sur "Create Pull Request"
4. Titre : `feat: Add B2BModule microservice`
5. Description :
   ```
   ## 🎯 Ajout du module B2B (Corporate Training)
   
   ### Fonctionnalités :
   - Gestion des entreprises et RH
   - Demandes de formation corporate
   - Gestion des missions et candidats
   - Système de contrats et affectations
   - Notifications email automatiques
   
   ### Configuration :
   - Port : 8083
   - Eureka client configuré
   - JWT authentication
   - OpenFeign pour communication avec auth-service
   
   ### Prêt pour :
   - Intégration avec API Gateway
   - Service discovery via Eureka
   ```
6. Cliquer sur "Create Pull Request"
7. **MERGER** la Pull Request dans `main`

---

## 🎯 ÉTAPE 2 : PUSH DU FRONTEND (Branche b2b-front)

⚠️ **ATTENDEZ** que l'étape 1 soit complètement terminée (backend mergé dans main) !

### Option A : Utiliser le script automatique (RECOMMANDÉ)

```powershell
# Ouvrir PowerShell dans le dossier B2BModule
cd C:\Users\mouha\Desktop\skill\B2BModule

# Exécuter le script
.\push_b2b_frontend.ps1
```

### Option B : Commandes manuelles

```powershell
# 1. Retourner dans le repo et mettre à jour
cd C:\Users\mouha\Desktop\skill\temp_b2b_backend
git checkout main
git pull origin main

# 2. Créer la branche b2b-front
git checkout -b b2b-front

# 3. Vérifier la structure existante dans main
ls PI_4eme-Template

# 4. Copier le frontend (adapter selon la structure)
# Si le main a déjà PI_4eme-Template/Platforme/ :
Copy-Item -Path "C:\Users\mouha\Desktop\skill\PI_4eme-Template\Platforme" -Destination ".\PI_4eme-Template\Platforme" -Recurse -Force

# 5. Commit et push
git add PI_4eme-Template/
git commit -m "feat: add B2B frontend integration"
git push origin b2b-front
```

### Après le push :

1. Aller sur GitHub
2. Créer une Pull Request de `b2b-front` vers `main`
3. Titre : `feat: Add B2B frontend integration`
4. Description :
   ```
   ## 🎨 Ajout du frontend B2B
   
   ### Fonctionnalités :
   - Interface de gestion des entreprises
   - Système de demandes de formation
   - Gestion des missions et candidats
   - Tableau de bord RH
   
   ### Intégration :
   - Connecté au B2BModule (port 8083)
   - Utilise l'API Gateway (port 8080)
   - JWT authentication
   ```
5. **RÉSOUDRE LES CONFLITS** avec le frontend de vos amis
6. **MERGER** la Pull Request dans `main`

---

## 🔧 RÉSOLUTION DES CONFLITS (Frontend)

Si vous avez des conflits lors du merge du frontend :

### Conflits typiques :

1. **Fichiers de routing** (`app-routing.module.ts`)
   - Garder les routes de vos amis ET ajouter vos routes B2B
   
2. **Menu de navigation** (`navbar.component.html`)
   - Fusionner les menus

3. **Services partagés** (`auth.service.ts`)
   - Vérifier que les endpoints sont corrects

### Comment résoudre :

```powershell
# 1. GitHub vous montrera les conflits
# 2. Cliquer sur "Resolve conflicts"
# 3. Éditer les fichiers en conflit
# 4. Garder les deux versions (la leur + la vôtre)
# 5. Supprimer les marqueurs de conflit (<<<<, ====, >>>>)
# 6. Cliquer sur "Mark as resolved"
# 7. Cliquer sur "Commit merge"
```

---

## ✅ CHECKLIST FINALE

### Backend (b2b) :
- [ ] Script exécuté ou commandes manuelles effectuées
- [ ] Branche `b2b` créée
- [ ] UNIQUEMENT B2BModule copié (pas d'autres services)
- [ ] Push réussi vers GitHub
- [ ] Pull Request créée
- [ ] Pull Request mergée dans `main`

### Frontend (b2b-front) :
- [ ] Backend déjà mergé dans main
- [ ] Script exécuté ou commandes manuelles effectuées
- [ ] Branche `b2b-front` créée
- [ ] Frontend copié avec structure correcte (`PI_4eme-Template/Platforme/`)
- [ ] Push réussi vers GitHub
- [ ] Pull Request créée
- [ ] Conflits résolus (si nécessaire)
- [ ] Pull Request mergée dans `main`

---

## 🎉 APRÈS L'INTÉGRATION COMPLÈTE

Une fois les deux Pull Requests mergées :

1. **Cloner le repo final** :
   ```powershell
   git clone https://github.com/jalehnan/Esprit_PIDEV_4SAE1_2026_SkillSphere.git
   cd Esprit_PIDEV_4SAE1_2026_SkillSphere
   ```

2. **Démarrer tous les services** :
   ```powershell
   # Eureka Server (port 8761)
   cd eureka-server
   mvn spring-boot:run
   
   # API Gateway (port 8080)
   cd api-gateway
   mvn spring-boot:run
   
   # Auth Service (port 8086)
   cd PlatformeBack/PlatformeBack
   mvn spring-boot:run
   
   # B2BModule (port 8083)
   cd B2BModule
   mvn spring-boot:run
   
   # Frontend (port 4200)
   cd PI_4eme-Template/Platforme
   npm install
   npm start
   ```

3. **Tester l'intégration** :
   - Eureka : http://localhost:8761
   - API Gateway : http://localhost:8080
   - Frontend : http://localhost:4200

---

## 🆘 EN CAS DE PROBLÈME

### Erreur d'authentification Git :
```powershell
# Configurer Git avec votre compte GitHub
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### Le script ne s'exécute pas :
```powershell
# Autoriser l'exécution de scripts PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Conflit lors du push :
```powershell
# Mettre à jour votre branche avec le main
git pull origin main
# Résoudre les conflits
# Puis push à nouveau
git push origin b2b
```

---

## 📞 SUPPORT

Si vous rencontrez un problème :
1. Lisez le message d'erreur complet
2. Vérifiez que vous êtes dans le bon dossier
3. Vérifiez que Git est installé : `git --version`
4. Vérifiez votre connexion GitHub

---

**Bonne chance avec l'intégration ! 🚀**
