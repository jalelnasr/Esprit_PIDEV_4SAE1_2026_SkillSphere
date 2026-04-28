# B2B Module - Plateforme de Formation Corporate

Module B2B pour la gestion des entreprises, employés, formations, missions freelance et recrutement.

## 🚀 Fonctionnalités

- **Gestion des entreprises** : CRUD complet avec secteurs d'activité
- **Gestion des employés** : Hiérarchie managériale, départements
- **Packs de formation** : Achats et assignations de formations
- **Missions freelance** : Publication et candidatures
- **Recrutement** : Offres d'emploi avec matching intelligent
- **Contrats** : Gestion des contrats freelance
- **Notifications email** : Système d'envoi d'emails HTML

## 📋 Prérequis

- Java 17+
- Maven 3.8+
- MySQL 8.0+
- SMTP credentials (Gmail recommandé)

## ⚙️ Configuration

1. Copier `.env.example` vers `.env`
2. Configurer les variables d'environnement :

```bash
# Database
DB_URL=jdbc:mysql://localhost:3306/b2bmodule
DB_USERNAME=root
DB_PASSWORD=your_password

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

3. Créer la base de données :
```sql
CREATE DATABASE b2bmodule;
```

## 🏃 Démarrage

```bash
mvn clean install
mvn spring-boot:run
```

L'application démarre sur `http://localhost:8083`

## 📚 Documentation API

Swagger UI disponible sur : `http://localhost:8083/swagger-ui.html`

## 🏗️ Architecture

```
src/main/java/org/example/b2bmodule/
├── config/          # Configuration (CORS, OpenAPI, RestTemplate)
├── controller/      # REST Controllers
├── dto/             # Data Transfer Objects
├── entity/          # JPA Entities
├── exception/       # Custom Exceptions & Global Handler
├── repository/      # Spring Data JPA Repositories
├── service/         # Business Logic
│   └── base/        # Abstract CRUD Service
└── util/            # Utility Classes
```

## 🔧 Optimisations Implémentées

### ✅ Code Quality
- **AbstractCrudService** : Classe de base éliminant 95% de duplication
- **GlobalExceptionHandler** : Gestion centralisée des erreurs
- **Custom Exceptions** : ResourceNotFoundException, BusinessException, DuplicateResourceException
- **ValidationUtils** : Utilitaires de validation réutilisables
- **Logging cohérent** : SLF4J sur tous les services
- **Transactions** : @Transactional sur toutes les opérations

### ✅ Security
- **Environment variables** : Credentials externalisés
- **Input validation** : Validation au niveau service
- **Error handling** : Messages d'erreur sécurisés

### ✅ Performance
- **Pagination** : Support de Pageable sur findAll()
- **Transaction management** : ReadOnly sur les queries
- **Logging optimisé** : Debug level pour les queries

## 📊 Endpoints Principaux

### Companies
- `POST /api/b2b/companies` - Créer une entreprise
- `GET /api/b2b/companies` - Lister toutes
- `GET /api/b2b/companies/{id}` - Obtenir par ID
- `PUT /api/b2b/companies/{id}` - Modifier
- `DELETE /api/b2b/companies/{id}` - Supprimer

### Missions
- `POST /api/b2b/missions` - Créer une mission
- `GET /api/b2b/missions/open` - Missions ouvertes
- `POST /api/b2b/missions/apply` - Postuler

### Job Offers
- `POST /api/b2b/job-offers` - Créer une offre
- `GET /api/b2b/job-offers/open` - Offres ouvertes
- `GET /api/b2b/job-offers/search?skill=java` - Recherche par compétence

### Applications
- `POST /api/b2b/applications` - Postuler (avec matching automatique)
- `GET /api/b2b/applications/job-offer/{id}/top` - Top candidats
- `POST /api/b2b/applications/notify` - Envoyer notification email

## 🧪 Tests

```bash
mvn test
```

## 📝 Licence

Propriétaire - Tous droits réservés
