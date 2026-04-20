# Formation & Learning Path Module - Requirements

## Vue d'ensemble

Le module Formation & Learning Path permet aux apprenants de découvrir, s'inscrire et suivre des formations, tout en gérant leur progression dans des parcours d'apprentissage structurés. Les formateurs et administrateurs gèrent le contenu, les sessions et suivent les statistiques.

## Architecture

- **Frontend**: Angular (port 4200)
- **Backend**: Spring Boot microservice `formation-service` via Gateway (port 8087)
- **Authentification**: JWT du module User (idUser extrait du token, jamais du front)
- **Rôles**: APPRENANT, FORMATEUR, ADMIN

---

## Modèle de données (Backend)

### 1. Formation (Table: `formation`)
Représente une formation disponible dans le catalogue.

**Colonnes**:
- `id` (Long, PK, auto)
- `titre` (String, required)
- `description` (Text)
- `niveau` (Enum: DEBUTANT, INTERMEDIAIRE, AVANCE)
- `categorie` (String: "Développement", "Design", "Management", etc.)
- `duree_heures` (Integer: durée totale en heures)
- `prerequis` (Text: prérequis textuels)
- `statut` (Enum: BROUILLON, PUBLIEE, ARCHIVEE)
- `image_url` (String)
- `created_at`, `updated_at` (Timestamp)

**Relations**:
- OneToMany → `SessionFormation`
- OneToMany → `ModuleContenu`
- ManyToMany → `LearningPath` (via `LearningPathItem`)

---

### 2. SessionFormation (Table: `session_formation`)
Une session planifiée d'une formation (dates, capacité, formateur).

**Colonnes**:
- `id` (Long, PK, auto)
- `id_formation` (Long, FK → Formation)
- `date_debut` (Date, required)
- `date_fin` (Date, required)
- `capacite_max` (Integer, required)
- `mode` (Enum: PRESENTIEL, ONLINE, HYBRIDE)
- `lieu` (String, nullable si online)
- `id_formateur` (Long, FK → User du module User)
- `statut` (Enum: A_VENIR, EN_COURS, TERMINEE, ANNULEE)
- `date_limite_inscription` (Date)
- `created_at`, `updated_at`

**Relations**:
- ManyToOne → `Formation`
- OneToMany → `Inscription`

**Règles métier**:
- `date_limite_inscription` < `date_debut`
- Nombre d'inscriptions confirmées ≤ `capacite_max`

---

### 3. Inscription / Enrollment (Table: `inscription`)
Inscription d'un apprenant à une session.

**Colonnes**:
- `id` (Long, PK, auto)
- `id_user` (Long, FK → User, extrait du JWT)
- `id_session` (Long, FK → SessionFormation)
- `statut` (Enum: EN_ATTENTE, CONFIRMEE, ANNULEE, TERMINEE)
- `date_inscription` (Timestamp, auto)
- `date_annulation` (Timestamp, nullable)
- `position_liste_attente` (Integer, nullable)

**Relations**:
- ManyToOne → `SessionFormation`

**Règles métier**:
- Un user ne peut s'inscrire qu'une fois par session
- Si session pleine → statut = EN_ATTENTE + position calculée
- Annulation libère une place → promouvoir le 1er en liste d'attente

---

### 4. ModuleContenu / Lesson (Table: `module_contenu`)
Chapitres/modules d'une formation (contenu pédagogique).

**Colonnes**:
- `id` (Long, PK, auto)
- `id_formation` (Long, FK → Formation)
- `titre` (String, required)
- `description` (Text)
- `ordre` (Integer: ordre d'affichage)
- `duree_minutes` (Integer)
- `type_contenu` (Enum: VIDEO, DOCUMENT, QUIZ, EXERCICE)
- `url_contenu` (String, nullable)
- `obligatoire` (Boolean, default true)

**Relations**:
- ManyToOne → `Formation`
- OneToMany → `Progression`

---

### 5. Progression (Table: `progression`)
Suivi de l'avancement d'un apprenant dans un module.

**Colonnes**:
- `id` (Long, PK, auto)
- `id_user` (Long, FK → User)
- `id_module` (Long, FK → ModuleContenu)
- `pourcentage_complete` (Integer, 0-100)
- `statut` (Enum: NON_COMMENCE, EN_COURS, TERMINE)
- `temps_passe_minutes` (Integer)
- `derniere_activite` (Timestamp)
- `date_completion` (Timestamp, nullable)

**Relations**:
- ManyToOne → `ModuleContenu`

**Règles métier**:
- `pourcentage_complete` = 100 → `statut` = TERMINE + `date_completion` renseignée
- Calcul automatique du % global de la formation

---

### 6. LearningPath (Table: `learning_path`)
Parcours d'apprentissage (séquence de formations).

**Colonnes**:
- `id` (Long, PK, auto)
- `titre` (String, required)
- `description` (Text)
- `niveau_requis` (Enum: DEBUTANT, INTERMEDIAIRE, AVANCE)
- `duree_totale_heures` (Integer, calculé)
- `statut` (Enum: ACTIF, INACTIF)
- `created_at`, `updated_at`

**Relations**:
- OneToMany → `LearningPathItem`
- OneToMany → `LearningPathProgress`

---

### 7. LearningPathItem (Table: `learning_path_item`)
Formations composant un parcours (ordre + règles).

**Colonnes**:
- `id` (Long, PK, auto)
- `id_learning_path` (Long, FK → LearningPath)
- `id_formation` (Long, FK → Formation)
- `ordre` (Integer, required)
- `obligatoire` (Boolean, default true)
- `id_prerequis` (Long, FK → Formation, nullable)

**Relations**:
- ManyToOne → `LearningPath`
- ManyToOne → `Formation`

**Règles métier**:
- Si `id_prerequis` renseigné → formation prérequise doit être terminée avant
- Ordre séquentiel respecté si `obligatoire` = true

---

### 8. LearningPathProgress (Table: `learning_path_progress`)
Progression d'un apprenant dans un parcours.

**Colonnes**:
- `id` (Long, PK, auto)
- `id_user` (Long, FK → User)
- `id_learning_path` (Long, FK → LearningPath)
- `statut` (Enum: NON_COMMENCE, EN_COURS, TERMINE)
- `pourcentage_global` (Integer, 0-100)
- `date_debut` (Timestamp)
- `date_completion` (Timestamp, nullable)
- `formations_completees` (Integer)
- `formations_totales` (Integer)

**Relations**:
- ManyToOne → `LearningPath`

**Règles métier**:
- `pourcentage_global` = (formations_completees / formations_totales) * 100
- Statut TERMINE si toutes les formations obligatoires sont complétées

---

## Fonctionnalités Frontend (Angular)

### A. Front-Office (APPRENANT)

#### 1. Catalogue de formations (`/learning/browse`)
- Liste des formations publiées (statut = PUBLIEE)
- Filtres: catégorie, niveau, durée, recherche texte
- Affichage: carte avec image, titre, niveau, durée, catégorie
- Clic → redirection vers détail formation

#### 2. Détail formation (`/learning/course/:id`)
- Infos complètes: titre, description, niveau, durée, prérequis, modules
- Liste des sessions planifiées (dates, capacité restante, mode, lieu)
- Bouton "S'inscrire" par session:
  - Si places disponibles → inscription confirmée
  - Si session pleine → inscription en liste d'attente
  - Si date limite dépassée → bouton désactivé
- Affichage du statut d'inscription si déjà inscrit

#### 3. Mes Formations (`/learning/my-courses`)
- Onglets: "En cours", "À venir", "Terminées"
- Affichage: formation + session + progression %
- Bouton "Continuer" → player de formation
- Bouton "Annuler inscription" (si session pas encore commencée)

#### 4. Player de formation (`/learning/learning/:courseId`)
- Navigation par modules/chapitres (sidebar)
- Affichage du contenu (vidéo, document, quiz)
- Barre de progression globale
- Bouton "Marquer comme terminé" par module
- Mise à jour automatique de la progression

#### 5. Mes Parcours (`/learning/paths`)
- Liste des parcours disponibles
- Bouton "Rejoindre un parcours"
- Affichage de la progression globale du parcours
- Liste des formations du parcours (ordre, statut, prérequis)
- Validation automatique des prérequis

---

### B. Back-Office (ADMIN / FORMATEUR)

#### 6. Gestion des formations (`/admin/formations`)
- CRUD formations (créer, modifier, archiver)
- Changement de statut (brouillon → publié → archivé)
- Upload d'image
- Gestion des modules/chapitres

#### 7. Gestion des sessions (`/admin/sessions`)
- CRUD sessions (planifier, modifier, annuler)
- Affectation formateur
- Gestion capacité et dates limites
- Vue des inscriptions par session

#### 8. Gestion des inscriptions (`/admin/inscriptions`)
- Liste des inscriptions (filtre par session, statut)
- Confirmation/annulation manuelle
- Gestion liste d'attente
- Export CSV

#### 9. Gestion des parcours (`/admin/learning-paths`)
- CRUD parcours
- Ajout/suppression de formations dans un parcours
- Définition de l'ordre et des prérequis
- Activation/désactivation

#### 10. Tableaux de bord (`/admin/dashboard`)
- Statistiques:
  - Taux d'inscription par formation
  - Taux de complétion
  - Sessions pleines / places restantes
  - Top formations (plus inscrites, mieux notées)
  - Progression moyenne par parcours
- Graphiques: inscriptions dans le temps, complétion par catégorie

---

## API Backend (Endpoints)

### Formations
- `GET /api/formations` - Liste formations (filtre: statut, catégorie, niveau)
- `GET /api/formations/{id}` - Détail formation
- `POST /api/formations` - Créer formation (ADMIN)
- `PUT /api/formations/{id}` - Modifier formation (ADMIN)
- `DELETE /api/formations/{id}` - Archiver formation (ADMIN)

### Sessions
- `GET /api/sessions` - Liste sessions (filtre: formation, statut)
- `GET /api/sessions/{id}` - Détail session
- `POST /api/sessions` - Créer session (ADMIN/FORMATEUR)
- `PUT /api/sessions/{id}` - Modifier session (ADMIN/FORMATEUR)
- `DELETE /api/sessions/{id}` - Annuler session (ADMIN)

### Inscriptions
- `POST /api/inscriptions` - S'inscrire à une session (APPRENANT)
- `GET /api/inscriptions/my` - Mes inscriptions (APPRENANT)
- `DELETE /api/inscriptions/{id}` - Annuler inscription (APPRENANT)
- `GET /api/inscriptions/session/{sessionId}` - Inscriptions d'une session (ADMIN)
- `PUT /api/inscriptions/{id}/confirm` - Confirmer inscription (ADMIN)

### Progression
- `GET /api/progression/formation/{formationId}` - Ma progression dans une formation
- `PUT /api/progression/module/{moduleId}` - Mettre à jour progression module
- `POST /api/progression/module/{moduleId}/complete` - Marquer module terminé

### Learning Paths
- `GET /api/learning-paths` - Liste parcours actifs
- `GET /api/learning-paths/{id}` - Détail parcours
- `POST /api/learning-paths/{id}/join` - Rejoindre parcours (APPRENANT)
- `GET /api/learning-paths/my-progress` - Ma progression dans mes parcours
- `POST /api/learning-paths` - Créer parcours (ADMIN)
- `PUT /api/learning-paths/{id}` - Modifier parcours (ADMIN)

### Statistiques (ADMIN)
- `GET /api/stats/formations` - Stats formations
- `GET /api/stats/sessions` - Stats sessions
- `GET /api/stats/inscriptions` - Stats inscriptions
- `GET /api/stats/progression` - Stats progression globale

---

## Règles métier clés

1. **Capacité session**: Inscription automatique en liste d'attente si pleine
2. **Prérequis**: Validation automatique avant inscription/accès
3. **Dates limites**: Blocage inscription après date limite
4. **Annulation**: Libération place + promotion liste d'attente
5. **Progression**: Calcul automatique % global formation
6. **Parcours**: Validation ordre + prérequis entre formations
7. **Sécurité**: idUser toujours extrait du JWT (backend)

---

## Prochaines étapes

1. ✅ Définir requirements (ce document)
2. ⏳ Créer modèles backend (entities JPA)
3. ⏳ Implémenter repositories + services
4. ⏳ Créer controllers REST
5. ⏳ Configurer CORS dans Gateway
6. ⏳ Créer services Angular
7. ⏳ Implémenter composants front-office
8. ⏳ Implémenter composants back-office
9. ⏳ Tests + validation
