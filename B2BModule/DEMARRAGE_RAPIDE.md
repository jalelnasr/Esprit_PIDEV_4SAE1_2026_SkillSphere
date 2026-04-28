# 🚀 Guide de Démarrage Rapide - B2BModule

## ⚠️ Erreur 500 sur /b2b-api/companies

Cette erreur se produit quand:
1. Le backend B2BModule n'est pas démarré
2. Le backend PlatformeBack n'est pas démarré
3. L'utilisateur n'est pas authentifié
4. L'utilisateur n'a pas le bon rôle (ADMIN ou RH_ENTREPRISE)

---

## 📋 Ordre de Démarrage

### 1️⃣ Démarrer PlatformeBack (Port 8081)
```bash
cd PlatformeBack/PlatformeBack
mvn spring-boot:run
```
**Vérifier**: http://localhost:8081/actuator/health

### 2️⃣ Démarrer B2BModule (Port 8082)
```bash
cd B2BModule
mvn spring-boot:run
```
**Vérifier**: http://localhost:8082/actuator/health

### 3️⃣ Démarrer le Frontend Angular (Port 4200)
```bash
cd PI_4eme-Template/PI_4eme-Template/Platforme
ng serve
```
**Vérifier**: http://localhost:4200

---

## 🔐 Authentification

### Se connecter en tant qu'Admin
1. Aller sur http://localhost:4200/login
2. Email: `admin@example.com`
3. Password: `admin123`

### Se connecter en tant que RH
1. Aller sur http://localhost:4200/login
2. Email: `rh@techcorp.com`
3. Password: `rh123`

---

## 🔍 Vérifier les Logs

### Logs B2BModule
Chercher dans la console:
```
Started B2bModuleApplication in X seconds
```

### Erreurs communes:

#### 1. Port déjà utilisé
```
Port 8082 was already in use
```
**Solution**: Tuer le processus ou changer le port dans `application.properties`

#### 2. Connexion à PlatformeBack échouée
```
Connection refused: localhost:8081
```
**Solution**: Démarrer PlatformeBack d'abord

#### 3. Base de données non accessible
```
Unable to open JDBC Connection
```
**Solution**: Vérifier MySQL ou utiliser H2 pour les tests

---

## 🛠️ Configuration

### B2BModule - application.properties
```properties
server.port=8082
spring.application.name=B2BMODULE

# PlatformeBack URL
platformeback.url=http://localhost:8081

# JWT Secret (doit être identique à PlatformeBack)
jwt.secret=THIS_IS_A_VERY_LONG_SECRET_KEY_CHANGE_ME_1234567890_ABCDEFG
```

### Frontend - proxy.conf.json
```json
{
  "/b2b-api": {
    "target": "http://localhost:8082/api/b2b",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/b2b-api": ""
    }
  },
  "/api": {
    "target": "http://localhost:8081",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 🧪 Tester l'API

### Avec curl (après connexion)
```bash
# 1. Se connecter et récupérer le token
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. Utiliser le token pour appeler l'API
curl http://localhost:8082/api/b2b/companies \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

### Avec Postman
1. POST http://localhost:8081/api/auth/login
   - Body: `{"email":"admin@example.com","password":"admin123"}`
2. Copier le `token` de la réponse
3. GET http://localhost:8082/api/b2b/companies
   - Header: `Authorization: Bearer VOTRE_TOKEN`

---

## 🐛 Dépannage

### Erreur 500 - Internal Server Error
**Causes possibles**:
1. Backend non démarré
2. Utilisateur non authentifié
3. Token JWT expiré
4. Rôle insuffisant

**Solutions**:
1. Vérifier que les 2 backends sont démarrés
2. Se reconnecter
3. Vérifier les logs du backend

### Erreur 401 - Unauthorized
**Cause**: Token manquant ou invalide
**Solution**: Se reconnecter pour obtenir un nouveau token

### Erreur 403 - Forbidden
**Cause**: Rôle insuffisant (besoin de ADMIN ou RH_ENTREPRISE)
**Solution**: Se connecter avec un compte ayant le bon rôle

---

## 📊 Endpoints Disponibles

### Companies (Nécessite ADMIN ou RH_ENTREPRISE)
- `GET /b2b-api/companies` - Liste toutes les entreprises
- `GET /b2b-api/companies/{id}` - Détails d'une entreprise
- `POST /b2b-api/companies` - Créer (ADMIN uniquement)
- `PUT /b2b-api/companies/{id}` - Modifier (ADMIN uniquement)
- `DELETE /b2b-api/companies/{id}` - Supprimer (ADMIN uniquement)

### Missions (Nécessite ADMIN ou RH_ENTREPRISE)
- `GET /b2b-api/missions` - Liste toutes les missions
- `GET /b2b-api/missions/open` - Missions ouvertes
- `POST /b2b-api/missions` - Créer une mission
- `PUT /b2b-api/missions/{id}` - Modifier une mission
- `DELETE /b2b-api/missions/{id}` - Supprimer (ADMIN uniquement)

### Contracts (Nécessite ADMIN ou RH_ENTREPRISE)
- `GET /b2b-api/contracts` - Liste tous les contrats
- `GET /b2b-api/contracts/{id}` - Détails d'un contrat
- `POST /b2b-api/contracts` - Créer un contrat
- `PUT /b2b-api/contracts/{id}/sign` - Signer un contrat

---

## ✅ Checklist de Démarrage

- [ ] PlatformeBack démarré (port 8081)
- [ ] B2BModule démarré (port 8082)
- [ ] Frontend Angular démarré (port 4200)
- [ ] Utilisateur connecté avec le bon rôle
- [ ] Token JWT valide
- [ ] Proxy configuré correctement

---

## 📞 Support

Si le problème persiste:
1. Vérifier les logs des backends
2. Vérifier la console du navigateur (F12)
3. Vérifier que les ports ne sont pas bloqués
4. Redémarrer tous les services dans l'ordre
