# 🔧 Résoudre les Problèmes - B2BModule

## ❌ Problèmes Identifiés

1. **Les missions ne s'affichent pas** → Base de données vide
2. **Impossible d'ajouter des companies** → Problème d'authentification/autorisation
3. **Le port est 8083** au lieu de 8082 (peut causer des problèmes avec le proxy)

---

## 🎯 Solution 1: Charger les Données dans MySQL

### Étape 1: Vérifier que MySQL est démarré
```bash
# Windows
net start MySQL80

# Ou vérifier dans les services Windows
services.msc
```

### Étape 2: Se connecter à MySQL
```bash
mysql -u root -p
# Appuyer sur Entrée si pas de mot de passe
```

### Étape 3: Créer la base de données (si nécessaire)
```sql
CREATE DATABASE IF NOT EXISTS b2bmodule;
USE b2bmodule;
```

### Étape 4: Charger les données
```bash
# Depuis le dossier B2BModule
mysql -u root -p b2bmodule < sample_data.sql
```

**OU** copier-coller le contenu de `sample_data.sql` dans MySQL Workbench

### Étape 5: Vérifier les données
```sql
USE b2bmodule;
SELECT COUNT(*) FROM missions;
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM candidates;
```

**Résultat attendu:**
- 16 missions
- 6 companies
- 18 candidates

---

## 🎯 Solution 2: Corriger le Port (8083 → 8082)

### Option A: Changer dans application.properties
```properties
# B2BModule/src/main/resources/application.properties
server.port=8082
```

### Option B: Mettre à jour le proxy Angular
```json
// PI_4eme-Template/PI_4eme-Template/Platforme/proxy.conf.json
{
  "/b2b-api": {
    "target": "http://localhost:8083/api/b2b",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/b2b-api": ""
    }
  }
}
```

**Recommandation**: Utiliser le port 8082 (standard)

---

## 🎯 Solution 3: Résoudre le Problème d'Ajout de Companies

### Problème: Erreur 403 ou 500 lors de l'ajout

**Causes possibles:**

#### 1. Utilisateur n'a pas le rôle ADMIN
```java
@PreAuthorize("hasRole('ADMIN')")
public CompanyResponse create(@RequestBody CompanyRequest req)
```

**Solution**: Se connecter avec un compte ADMIN
- Email: `admin@example.com`
- Password: `admin123`

#### 2. Token JWT invalide ou expiré

**Solution**: Se reconnecter pour obtenir un nouveau token

#### 3. PlatformeBack n'est pas démarré

**Solution**: Démarrer PlatformeBack d'abord
```bash
cd PlatformeBack/PlatformeBack
mvn spring-boot:run
```

#### 4. Eureka Server n'est pas démarré

**Solution Option A**: Démarrer Eureka
```bash
cd eureka-server
mvn spring-boot:run
```

**Solution Option B**: Désactiver Eureka temporairement
```properties
# application.properties
eureka.client.enabled=false
user.module.url=http://localhost:8081
```

---

## 🚀 Procédure Complète de Démarrage

### 1. Préparer la Base de Données
```bash
# Démarrer MySQL
net start MySQL80

# Charger les données
mysql -u root -p b2bmodule < sample_data.sql
```

### 2. Démarrer les Services (dans l'ordre)

#### A. Eureka Server (Optionnel mais recommandé)
```bash
cd eureka-server
mvn spring-boot:run
```
Vérifier: http://localhost:8761

#### B. PlatformeBack
```bash
cd PlatformeBack/PlatformeBack
mvn spring-boot:run
```
Vérifier: http://localhost:8081/actuator/health

#### C. B2BModule
```bash
cd B2BModule
mvn spring-boot:run
```
Vérifier: http://localhost:8083/actuator/health (ou 8082)

#### D. Frontend Angular
```bash
cd PI_4eme-Template/PI_4eme-Template/Platforme
ng serve
```
Vérifier: http://localhost:4200

### 3. Se Connecter

#### Compte ADMIN (pour ajouter des companies)
- Email: `admin@example.com`
- Password: `admin123`

#### Compte RH (pour voir les missions)
- Email: `rh@techcorp.com`
- Password: `rh123`

---

## 🔍 Vérifier que Tout Fonctionne

### Test 1: Voir les Missions
```bash
# Dans le navigateur (après connexion)
http://localhost:4200/b2b/missions

# Ou avec curl
curl http://localhost:8083/api/b2b/missions \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Résultat attendu**: Liste de 16 missions

### Test 2: Voir les Companies
```bash
http://localhost:4200/b2b/companies
```

**Résultat attendu**: Liste de 6 entreprises

### Test 3: Ajouter une Company (ADMIN uniquement)
```bash
curl -X POST http://localhost:8083/api/b2b/companies \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "test@company.com",
    "siret": "12345678901234",
    "sector": "IT",
    "address": "123 Test Street",
    "phone": "+33123456789",
    "createdBy": 1
  }'
```

---

## 🐛 Dépannage

### Problème: "Table doesn't exist"
**Solution**: Hibernate n'a pas créé les tables
```properties
# Changer temporairement
spring.jpa.hibernate.ddl-auto=create
# Puis redémarrer et remettre à "update"
```

### Problème: "Access Denied for user 'root'"
**Solution**: Vérifier le mot de passe MySQL
```properties
spring.datasource.password=VOTRE_MOT_DE_PASSE
```

### Problème: "Connection refused: localhost:8081"
**Solution**: PlatformeBack n'est pas démarré
```bash
cd PlatformeBack/PlatformeBack
mvn spring-boot:run
```

### Problème: "403 Forbidden" lors de l'ajout
**Solution**: Utiliser un compte ADMIN, pas RH
```
RH_ENTREPRISE → Peut voir (GET)
ADMIN → Peut tout faire (GET, POST, PUT, DELETE)
```

### Problème: Les missions ne s'affichent pas
**Vérifications**:
1. Base de données contient des données?
   ```sql
   SELECT COUNT(*) FROM missions;
   ```
2. Backend démarré?
   ```bash
   curl http://localhost:8083/actuator/health
   ```
3. Token valide?
   - Se reconnecter si expiré

---

## 📊 Données de Test Disponibles

Après avoir chargé `sample_data.sql`:

### Companies (6)
- TechCorp Solutions
- InnovSoft Digital
- DataFlow Analytics
- CloudTech Systems
- MobileDev Studio
- FinTech Innovations

### Missions (16)
- Niveaux: Junior (350-400€), Confirmé (480-650€), Senior (700-900€)
- Domaines: Full Stack, DevOps, Data Science, Mobile, Cloud, Blockchain

### Candidates (18)
- Profils variés: Junior, Confirmé, Senior, Expert
- Compétences: Frontend, Backend, Mobile, Data, DevOps, Blockchain

### Applications (20)
- Différents statuts: PENDING, ACCEPTED, REJECTED
- Taux variés pour tester l'algorithme de matching

---

## ✅ Checklist Finale

- [ ] MySQL démarré
- [ ] Base de données `b2bmodule` créée
- [ ] Données chargées avec `sample_data.sql`
- [ ] Eureka Server démarré (optionnel)
- [ ] PlatformeBack démarré (port 8081)
- [ ] B2BModule démarré (port 8083 ou 8082)
- [ ] Frontend Angular démarré (port 4200)
- [ ] Connecté avec le bon compte (ADMIN pour ajouter, RH pour voir)
- [ ] Les missions s'affichent
- [ ] Peut ajouter une company (avec ADMIN)

---

## 🎯 Commande Rapide pour Tout Vérifier

```bash
# 1. Vérifier MySQL
mysql -u root -p -e "USE b2bmodule; SELECT COUNT(*) FROM missions;"

# 2. Vérifier les services
curl http://localhost:8761  # Eureka (optionnel)
curl http://localhost:8081/actuator/health  # PlatformeBack
curl http://localhost:8083/actuator/health  # B2BModule
curl http://localhost:4200  # Frontend
```

Si tous répondent → Tout est OK! ✅
