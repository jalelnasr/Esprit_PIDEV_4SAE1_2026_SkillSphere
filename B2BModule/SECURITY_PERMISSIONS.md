# 🔒 Spring Security - Permissions par Endpoint

## ✅ Implémentation Complète

### Fichiers Créés :
1. ✅ `JwtService.java` - Validation des tokens JWT
2. ✅ `JwtAuthenticationFilter.java` - Filtre d'authentification
3. ✅ `SecurityConfig.java` - Configuration Spring Security
4. ✅ `MissionController.java` - Protégé avec @PreAuthorize

---

## 📋 Matrice des Permissions

### Rôles Disponibles :
- **ADMIN** : Accès complet à tout
- **RH_ENTREPRISE** : Gestion des missions, candidats, contrats de son entreprise
- **APPRENANT** : Consultation des missions, candidature

---

## 🎯 Permissions par Controller

### 1. **MissionController** ✅ (Implémenté)

| Endpoint | Méthode | Permission | Description |
|----------|---------|------------|-------------|
| `/api/b2b/missions` | POST | ADMIN, RH_ENTREPRISE | Créer une mission |
| `/api/b2b/missions` | GET | ADMIN, RH_ENTREPRISE, APPRENANT | Lister toutes les missions |
| `/api/b2b/missions/open` | GET | ADMIN, RH_ENTREPRISE, APPRENANT | Missions ouvertes |
| `/api/b2b/missions/{id}` | GET | ADMIN, RH_ENTREPRISE, APPRENANT | Détails d'une mission |
| `/api/b2b/missions/company/{id}` | GET | ADMIN, RH_ENTREPRISE | Missions par entreprise |
| `/api/b2b/missions/{id}` | PUT | ADMIN, RH_ENTREPRISE | Modifier une mission |
| `/api/b2b/missions/{id}/status` | PUT | ADMIN, RH_ENTREPRISE | Changer le statut |
| `/api/b2b/missions/{id}` | DELETE | ADMIN | Supprimer une mission |
| `/api/b2b/missions/apply` | POST | APPRENANT | Postuler à une mission |
| `/api/b2b/missions/{id}/applications` | GET | ADMIN, RH_ENTREPRISE | Voir les candidatures |
| `/api/b2b/missions/applications/{id}/status` | PUT | ADMIN, RH_ENTREPRISE | Changer statut candidature |
| `/api/b2b/missions/applications/{id}/analysis` | GET | ADMIN, RH_ENTREPRISE | Analyse AI matching |

---

### 2. **CompanyController** ⚠️ (À Protéger)

**Recommandations** :
```java
@PostMapping - @PreAuthorize("hasRole('ADMIN')")
@GetMapping - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
@GetMapping("/{id}") - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
@PutMapping("/{id}") - @PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}") - @PreAuthorize("hasRole('ADMIN')")
```

---

### 3. **ContractController** ⚠️ (À Protéger)

**Recommandations** :
```java
@PostMapping - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
@GetMapping - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
@GetMapping("/{id}") - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'APPRENANT')")
@GetMapping("/candidate/{id}") - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'APPRENANT')")
@PutMapping("/{id}") - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
@DeleteMapping("/{id}") - @PreAuthorize("hasRole('ADMIN')")
@PostMapping("/{id}/sign") - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
```

---

### 4. **CandidateController** ⚠️ (À Protéger)

**Recommandations** :
```java
@PostMapping - @PreAuthorize("hasAnyRole('ADMIN', 'APPRENANT')")
@GetMapping - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE')")
@GetMapping("/{id}") - @PreAuthorize("hasAnyRole('ADMIN', 'RH_ENTREPRISE', 'APPRENANT')")
@PutMapping("/{id}") - @PreAuthorize("hasAnyRole('ADMIN', 'APPRENANT')")
@DeleteMapping("/{id}") - @PreAuthorize("hasRole('ADMIN')")
```

---

### 5. **Endpoints Publics** (Pas de JWT requis)

- ✅ `/api/b2b/test/**` - Tests
- ✅ `/api/b2b/diagnostic/**` - Diagnostic
- ✅ `/swagger-ui/**` - Documentation Swagger
- ✅ `/v3/api-docs/**` - OpenAPI
- ✅ `/actuator/**` - Monitoring

---

## 🔧 Configuration JWT

### application.properties
```properties
# Secret JWT (DOIT être identique à PlatformeBack)
app.jwt.secret=THIS_IS_A_VERY_LONG_SECRET_KEY_CHANGE_ME_1234567890_ABCDEFG
app.jwt.expiration-ms=86400000
```

⚠️ **IMPORTANT** : Le secret JWT doit être **EXACTEMENT le même** que dans PlatformeBack !

---

## 🧪 Comment Tester

### 1. Obtenir un Token JWT
```bash
POST http://localhost:8086/api/auth/login
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "password": "Admin123"
}
```

### 2. Utiliser le Token
```bash
GET http://localhost:8083/api/b2b/missions
Authorization: Bearer <votre_token_jwt>
```

### 3. Test Sans Token (doit échouer)
```bash
GET http://localhost:8083/api/b2b/missions
# Résultat attendu : 403 Forbidden
```

---

## 📊 Prochaines Étapes

### À Faire :
1. ⚠️ Protéger **CompanyController** avec @PreAuthorize
2. ⚠️ Protéger **ContractController** avec @PreAuthorize
3. ⚠️ Protéger **CandidateController** avec @PreAuthorize
4. ⚠️ Protéger les autres controllers (Employee, JobOffer, Pack, etc.)

### Tests à Créer :
1. ❌ Test d'authentification JWT
2. ❌ Test des permissions par rôle
3. ❌ Test d'accès refusé (403)
4. ❌ Test d'accès non authentifié (401)

---

## ✅ Status Actuel

| Composant | Status | Complété |
|-----------|--------|----------|
| Dépendances Spring Security | ✅ | 100% |
| JwtService | ✅ | 100% |
| JwtAuthenticationFilter | ✅ | 100% |
| SecurityConfig | ✅ | 100% |
| **MissionController** | ✅ | 100% |
| **CompanyController** | ✅ | 100% |
| **ContractController** | ✅ | 100% |
| **CandidateController** | ✅ | 100% |
| Autres Controllers | ⚠️ | 0% |
| Tests Security | ❌ | 0% |

**Progression Globale** : ~80% ✅

---

## 📊 Récapitulatif des Permissions Implémentées

### CompanyController ✅
| Endpoint | Permission |
|----------|------------|
| POST /companies | ADMIN |
| GET /companies | ADMIN, RH_ENTREPRISE |
| GET /companies/{id} | ADMIN, RH_ENTREPRISE |
| PUT /companies/{id} | ADMIN |
| DELETE /companies/{id} | ADMIN |
| GET /companies/sector/{sector} | ADMIN, RH_ENTREPRISE |

### ContractController ✅
| Endpoint | Permission |
|----------|------------|
| POST /contracts | ADMIN, RH_ENTREPRISE |
| GET /contracts | ADMIN, RH_ENTREPRISE |
| GET /contracts/{id} | ADMIN, RH_ENTREPRISE, APPRENANT |
| GET /contracts/company/{id} | ADMIN, RH_ENTREPRISE |
| GET /contracts/candidate/{id} | ADMIN, RH_ENTREPRISE, APPRENANT |
| PUT /contracts/{id}/sign | ADMIN, RH_ENTREPRISE |
| PUT /contracts/{id}/sign-with-data | ADMIN, RH_ENTREPRISE |
| PUT /contracts/{id}/status | ADMIN, RH_ENTREPRISE |
| DELETE /contracts/{id} | ADMIN |

### CandidateController ✅
| Endpoint | Permission |
|----------|------------|
| POST /candidates | ADMIN, APPRENANT |
| GET /candidates | ADMIN, RH_ENTREPRISE |
| GET /candidates/active | ADMIN, RH_ENTREPRISE |
| GET /candidates/{id} | ADMIN, RH_ENTREPRISE, APPRENANT |
| GET /candidates/search | ADMIN, RH_ENTREPRISE |
| PUT /candidates/{id} | ADMIN, APPRENANT |
| DELETE /candidates/{id} | ADMIN |

---

## 🎯 Controllers Restants (Optionnels)

Les controllers suivants peuvent aussi être protégés si nécessaire :
- ⚠️ EmployeeController
- ⚠️ JobOfferController
- ⚠️ PackController
- ⚠️ PackPurchaseController
- ⚠️ ProgressController
- ⚠️ ApplicationController
- ⚠️ AssignmentController
- ⚠️ NotificationController

**Recommandation** : Protéger selon les besoins métier.
