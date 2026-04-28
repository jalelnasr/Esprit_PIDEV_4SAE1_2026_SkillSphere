# Guide du Système d'Entretiens - Frontend Angular

## Installation et Configuration

### 1. Importer les composants dans les routes B2B

Ouvrez le fichier `src/app/admin/b2b/b2b.routes.ts` et ajoutez :

```typescript
import { INTERVIEWS_ROUTES } from './interviews/interviews.routes';

export const B2B_ROUTES: Routes = [
  {
    path: '',
    component: B2bLayoutComponent,
    children: [
      // ... autres routes
      {
        path: 'interviews',
        children: INTERVIEWS_ROUTES
      }
    ]
  }
];
```

### 2. Ajouter les liens dans la sidebar

Ouvrez `src/app/admin/b2b/b2b-sidebar/b2b-sidebar.component.html` et ajoutez :

```html
<li class="nav-item">
  <a class="nav-link" routerLink="/admin/b2b/interviews/list" routerLinkActive="active">
    <i class="fas fa-calendar-check me-2"></i>
    <span>Entretiens</span>
  </a>
</li>

<li class="nav-item">
  <a class="nav-link" routerLink="/admin/b2b/interviews/calendar" routerLinkActive="active">
    <i class="fas fa-calendar-alt me-2"></i>
    <span>Calendrier</span>
  </a>
</li>
```

### 3. Installer les dépendances (si nécessaire)

```bash
npm install ngx-toastr
```

## Structure des Composants

### InterviewListComponent
- **Chemin** : `src/app/admin/b2b/interviews/interview-list.component.ts`
- **Fonctionnalités** :
  - Affiche une liste de tous les entretiens
  - Filtrage par statut et recherche
  - CRUD complet (Créer, Lire, Mettre à jour, Supprimer)
  - Modal pour créer/modifier les entretiens
  - Annulation d'entretiens

### InterviewCalendarComponent
- **Chemin** : `src/app/admin/b2b/interviews/interview-calendar.component.ts`
- **Fonctionnalités** :
  - Affiche un calendrier mensuel
  - Visualisation des entretiens par jour
  - Navigation entre les mois
  - Détails de l'entretien au clic
  - Code couleur par statut

## API Endpoints

### Base URL
```
http://localhost:8083/api/interviews
```

### Endpoints disponibles

#### Créer un entretien
```
POST /api/interviews
Content-Type: application/json

{
  "candidateId": 1,
  "recruiterId": 2,
  "jobOfferId": 3,
  "interviewDateTime": "2026-03-15T14:00:00",
  "location": "Office - Room 101",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Technical interview"
}
```

#### Récupérer un entretien
```
GET /api/interviews/{id}
```

#### Récupérer les entretiens d'un candidat
```
GET /api/interviews/candidate/{candidateId}
```

#### Récupérer les entretiens d'un recruteur
```
GET /api/interviews/recruiter/{recruiterId}
```

#### Récupérer les entretiens d'une offre d'emploi
```
GET /api/interviews/job-offer/{jobOfferId}
```

#### Récupérer les entretiens entre deux dates
```
GET /api/interviews/calendar?startDate=2026-03-01T00:00:00&endDate=2026-03-31T23:59:59
```

#### Modifier un entretien
```
PUT /api/interviews/{id}
Content-Type: application/json

{
  "candidateId": 1,
  "recruiterId": 2,
  "jobOfferId": 3,
  "interviewDateTime": "2026-03-15T15:00:00",
  "location": "Office - Room 102",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Updated notes"
}
```

#### Annuler un entretien
```
PUT /api/interviews/{id}/cancel
```

#### Supprimer un entretien
```
DELETE /api/interviews/{id}
```

## Test avec Postman

### 1. Créer un entretien

**URL** : `POST http://localhost:8083/api/interviews`

**Body** (JSON) :
```json
{
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-15T14:00:00",
  "location": "Bureau - Salle 101",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Entretien technique"
}
```

### 2. Récupérer les entretiens du mois

**URL** : `GET http://localhost:8083/api/interviews/calendar?startDate=2026-03-01T00:00:00&endDate=2026-03-31T23:59:59`

### 3. Modifier un entretien

**URL** : `PUT http://localhost:8083/api/interviews/1`

**Body** (JSON) :
```json
{
  "candidateId": 1,
  "recruiterId": 1,
  "jobOfferId": 1,
  "interviewDateTime": "2026-03-16T15:00:00",
  "location": "Bureau - Salle 102",
  "meetingLink": "https://zoom.us/j/123456789",
  "notes": "Entretien technique - Modifié"
}
```

### 4. Annuler un entretien

**URL** : `PUT http://localhost:8083/api/interviews/1/cancel`

### 5. Supprimer un entretien

**URL** : `DELETE http://localhost:8083/api/interviews/1`

## Utilisation dans l'Application

### Accéder à la liste des entretiens
```
http://localhost:4200/admin/b2b/interviews/list
```

### Accéder au calendrier des entretiens
```
http://localhost:4200/admin/b2b/interviews/calendar
```

## Fonctionnalités Principales

### Liste des Entretiens
1. **Affichage** : Tableau avec tous les entretiens
2. **Recherche** : Filtrer par ID ou ID candidat
3. **Filtrage** : Par statut (Planifié, Complété, Annulé, Reporté)
4. **Actions** :
   - Modifier un entretien
   - Annuler un entretien (si statut = SCHEDULED)
   - Supprimer un entretien
   - Créer un nouvel entretien

### Calendrier des Entretiens
1. **Affichage** : Calendrier mensuel avec entretiens
2. **Navigation** : Mois précédent/suivant
3. **Détails** : Clic sur un entretien pour voir les détails
4. **Code couleur** :
   - Bleu : Planifié
   - Vert : Complété
   - Rouge : Annulé
   - Orange : Reporté

## Statuts des Entretiens

- **SCHEDULED** : Entretien planifié
- **COMPLETED** : Entretien terminé
- **CANCELLED** : Entretien annulé
- **RESCHEDULED** : Entretien reporté

## Rappels Automatiques

Les rappels sont envoyés automatiquement :
- 24 heures avant l'entretien
- 1 heure avant l'entretien

Les rappels sont envoyés par email au candidat.

## Intégration Google Calendar

Les entretiens sont automatiquement ajoutés à Google Calendar :
- Création automatique d'événements
- Synchronisation des modifications
- Suppression automatique lors de l'annulation

## Troubleshooting

### Erreur : "Cannot GET /api/interviews"
- Vérifier que le backend B2BModule est démarré sur le port 8083
- Vérifier que l'URL de l'API est correcte dans `interview.service.ts`

### Erreur : "CORS error"
- Vérifier que CORS est activé dans le backend
- Vérifier la configuration dans `CorsConfig.java`

### Entretiens non affichés
- Vérifier que les données existent dans la base de données
- Vérifier les logs du backend pour les erreurs

### Rappels non envoyés
- Vérifier que le service EmailService est configuré
- Vérifier que la tâche planifiée est activée (@EnableScheduling)
- Vérifier les logs du backend

## Prochaines Étapes

1. Ajouter les notifications en temps réel (WebSocket)
2. Ajouter les statistiques et rapports
3. Ajouter l'export en PDF/Excel
4. Ajouter les notifications push
5. Ajouter la synchronisation avec Outlook
