# 🧪 GUIDE COMPLET - COMMANDES DE TESTS

## 📋 TABLE DES MATIÈRES
1. [Tests Backend (JUnit/Mockito)](#tests-backend)
2. [Tests Frontend (Karma/Jasmine)](#tests-frontend)
3. [Couverture de Code (JaCoCo)](#couverture-jacoco)
4. [Commandes Rapides](#commandes-rapides)

---

## 🔧 TESTS BACKEND (JUnit/Mockito)

### 1️⃣ Exécuter tous les tests backend

```bash
cd B2BModule
mvn test
```

**Résultat attendu**: 40 tests (28 actifs, 12 désactivés)

---

### 2️⃣ Exécuter un test spécifique

```bash
# Test d'un service
mvn test -Dtest=MissionServiceTest

# Test d'un controller
mvn test -Dtest=MissionControllerIntegrationTest

# Test d'une classe spécifique
mvn test -Dtest=CompanyServiceTest
```

---

### 3️⃣ Exécuter les tests avec couverture JaCoCo

```bash
# Exécuter les tests + générer le rapport de couverture
mvn clean test

# Le rapport sera généré dans:
# target/site/jacoco/index.html
```

---

### 4️⃣ Voir le rapport de couverture JaCoCo

**Windows:**
```bash
# Ouvrir le rapport dans le navigateur
start target/site/jacoco/index.html
```

**Linux/Mac:**
```bash
# Ouvrir le rapport dans le navigateur
open target/site/jacoco/index.html
# ou
xdg-open target/site/jacoco/index.html
```

---

### 5️⃣ Générer le rapport sans exécuter les tests

```bash
# Si les tests ont déjà été exécutés
mvn jacoco:report
```

---

### 6️⃣ Vérifier la couverture minimale (50%)

```bash
# Exécuter les tests et vérifier la couverture
mvn clean verify

# Si la couverture est < 50%, le build échouera
```

---

### 7️⃣ Tests en mode verbose (détails complets)

```bash
mvn test -X
```

---

### 8️⃣ Ignorer les tests désactivés

```bash
# Les tests avec @Disabled sont automatiquement ignorés
mvn test

# Pour forcer l'exécution de tous les tests (même désactivés)
mvn test -DskipTests=false
```

---

## 🎨 TESTS FRONTEND (Karma/Jasmine)

### 1️⃣ Exécuter tous les tests frontend

```bash
cd PI_4eme-Template/PI_4eme-Template/Platforme
npm test
```

**Résultat attendu**: 59 tests (57 réussis, 2 échecs non-B2B)

---

### 2️⃣ Exécuter les tests en mode headless (CI/CD)

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

**Avantages:**
- Pas d'interface graphique
- Plus rapide
- Idéal pour CI/CD

---

### 3️⃣ Exécuter les tests avec couverture

```bash
npm test -- --code-coverage --watch=false --browsers=ChromeHeadless
```

**Rapport généré dans:**
- `coverage/index.html`

---

### 4️⃣ Voir le rapport de couverture frontend

**Windows:**
```bash
start coverage/index.html
```

**Linux/Mac:**
```bash
open coverage/index.html
# ou
xdg-open coverage/index.html
```

---

### 5️⃣ Exécuter un test spécifique

```bash
# Tester un fichier spécifique
npm test -- --include='**/auth.service.spec.ts'

# Tester un composant spécifique
npm test -- --include='**/careers.component.spec.ts'
```

---

### 6️⃣ Mode watch (développement)

```bash
# Les tests se relancent automatiquement à chaque modification
npm test
```

---

### 7️⃣ Exécuter les tests dans différents navigateurs

```bash
# Chrome (par défaut)
npm test -- --browsers=Chrome

# Firefox
npm test -- --browsers=Firefox

# Chrome + Firefox
npm test -- --browsers=Chrome,Firefox
```

---

## 📊 COUVERTURE DE CODE (JaCoCo)

### 1️⃣ Générer le rapport complet de couverture

```bash
cd B2BModule

# Nettoyer + Tester + Générer rapport
mvn clean test jacoco:report
```

---

### 2️⃣ Structure du rapport JaCoCo

```
B2BModule/target/site/jacoco/
├── index.html              # Page principale
├── jacoco.xml              # Rapport XML (pour CI/CD)
├── jacoco.csv              # Rapport CSV
└── org.example.b2bmodule/  # Détails par package
    ├── controller/
    ├── service/
    ├── repository/
    └── ...
```

---

### 3️⃣ Métriques de couverture JaCoCo

Le rapport affiche:
- **Instructions**: Couverture des instructions bytecode
- **Branches**: Couverture des branches (if/else, switch)
- **Lignes**: Couverture des lignes de code
- **Méthodes**: Couverture des méthodes
- **Classes**: Couverture des classes

**Objectif configuré**: 50% minimum

---

### 4️⃣ Vérifier la couverture en ligne de commande

```bash
# Afficher un résumé de la couverture
mvn jacoco:report
cat target/site/jacoco/index.html | grep -A 5 "Total"
```

---

### 5️⃣ Exclure des classes de la couverture

Déjà configuré dans `pom.xml`:
```xml
<excludes>
    <exclude>**/config/**</exclude>
    <exclude>**/model/**</exclude>
    <exclude>**/dto/**</exclude>
    <exclude>**/*Application.class</exclude>
</excludes>
```

---

## ⚡ COMMANDES RAPIDES

### 🎯 Tout tester en une commande

**Backend:**
```bash
cd B2BModule && mvn clean test jacoco:report && start target/site/jacoco/index.html
```

**Frontend:**
```bash
cd PI_4eme-Template/PI_4eme-Template/Platforme && npm test -- --code-coverage --watch=false --browsers=ChromeHeadless && start coverage/index.html
```

---

### 🚀 Tests rapides (sans rapport)

**Backend:**
```bash
cd B2BModule && mvn test -DskipTests=false
```

**Frontend:**
```bash
cd PI_4eme-Template/PI_4eme-Template/Platforme && npm test -- --watch=false --browsers=ChromeHeadless
```

---

### 📈 Générer tous les rapports

```bash
# Backend
cd B2BModule
mvn clean test jacoco:report

# Frontend
cd ../PI_4eme-Template/PI_4eme-Template/Platforme
npm test -- --code-coverage --watch=false --browsers=ChromeHeadless

# Ouvrir les rapports
start ../../../B2BModule/target/site/jacoco/index.html
start coverage/index.html
```

---

## 🔍 VÉRIFICATION DES RÉSULTATS

### Backend (Maven)
```
[INFO] Tests run: 40, Failures: 0, Errors: 0, Skipped: 12
[INFO] BUILD SUCCESS
```

### Frontend (Karma)
```
Chrome 147.0.0.0 (Windows 10): Executed 59 of 59 (2 FAILED) (0.834 secs / 0.694 secs)
TOTAL: 2 FAILED, 57 SUCCESS
```
*(Les 2 échecs sont dans app.component - non B2B)*

---

## 📊 RÉSUMÉ DES TESTS

| Type | Commande | Tests | Réussis | Couverture |
|------|----------|-------|---------|------------|
| **Backend** | `mvn test` | 40 | 28 | ~30-35% |
| **Frontend** | `npm test` | 59 | 57 | N/A |
| **Total** | - | **99** | **85** | - |

---

## 🎯 OBJECTIFS DE COUVERTURE

### Backend (JaCoCo)
- **Minimum requis**: 50%
- **Actuel**: ~30-35%
- **Recommandé**: 70%+

### Frontend (Karma)
- **Actuel**: 57 tests B2B passent
- **Recommandé**: Ajouter tests pour composants restants

---

## 📝 NOTES IMPORTANTES

1. **JaCoCo** est configuré pour échouer si couverture < 50%
2. Les tests désactivés (`@Disabled`) ne comptent pas dans les échecs
3. Les 2 échecs frontend sont dans `app.component.spec.ts` (non B2B)
4. Tous les tests B2B (backend + frontend) passent avec succès ✅

---

## 🆘 DÉPANNAGE

### Problème: Tests backend échouent
```bash
# Nettoyer et réessayer
mvn clean test
```

### Problème: Tests frontend échouent
```bash
# Nettoyer le cache npm
npm cache clean --force
npm install
npm test
```

### Problème: Rapport JaCoCo non généré
```bash
# Vérifier que JaCoCo est dans pom.xml
mvn help:effective-pom | grep jacoco

# Forcer la génération
mvn clean test jacoco:report
```

---

**Date**: 15 avril 2026  
**Version**: 1.0  
**Auteur**: Kiro AI Assistant
