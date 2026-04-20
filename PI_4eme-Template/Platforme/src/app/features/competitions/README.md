# Module Compétitions & Événements

## 📋 Vue d'ensemble

Ce module permet la gestion complète des compétitions et événements professionnels avec participation individuelle ou en équipe.

## 🎯 Fonctionnalités

### Pour les FORMATEURS
- ✅ Créer des compétitions/événements
- ✅ Gérer les compétitions (modifier, supprimer)
- ✅ Changer le statut (OPEN, CLOSED, IN_PROGRESS, COMPLETED, CANCELLED)
- ✅ Voir la liste des participants
- ✅ Attribuer des scores aux participants
- ✅ Gérer le classement

### Pour les APPRENANTS
- ✅ Voir toutes les compétitions disponibles
- ✅ S'inscrire individuellement
- ✅ Créer une équipe
- ✅ Rejoindre une équipe existante
- ✅ Quitter une équipe
- ✅ Voir le classement en temps réel
- ✅ Voir ses récompenses

## 📁 Structure

```
competitions/
├── models/
│   └── competition.model.ts          # Interfaces TypeScript
├── services/
│   └── competition-api.service.ts    # Service API
├── pages/
│   ├── competition-list/             # Liste des compétitions
│   ├── competition-create/           # Création (FORMATEUR)
│   ├── competition-detail/           # Détails + participation
│   ├── competition-manage/           # Gestion (FORMATEUR)
│   └── competition-leaderboard/      # Classement
├── competitions.routes.ts            # Routes du module
└── README.md                         # Documentation
```

## 🔗 Routes

| Route | Rôle | Description |
|-------|------|-------------|
| `/competitions` | Tous | Liste des compétitions |
| `/competitions/create` | FORMATEUR | Créer une compétition |
| `/competitions/:id` | Tous | Détails et participation |
| `/competitions/:id/manage` | FORMATEUR | Gérer la compétition |
| `/competitions/:id/leaderboard` | Tous | Voir le classement |

## 🔌 API Backend

Le service utilise les endpoints suivants :

### Compétitions
- `GET /api/competitions` - Liste toutes les compétitions
- `GET /api/competitions/:id` - Détails d'une compétition
- `POST /api/competitions` - Créer une compétition (FORMATEUR)
- `PUT /api/competitions/:id` - Modifier une compétition (FORMATEUR)
- `DELETE /api/competitions/:id` - Supprimer une compétition (FORMATEUR)
- `PATCH /api/competitions/:id/status` - Changer le statut (FORMATEUR)

### Participation individuelle
- `POST /api/competitions/:id/register` - S'inscrire
- `DELETE /api/competitions/:id/register` - Annuler l'inscription
- `GET /api/competitions/my-participations` - Mes participations

### Équipes
- `POST /api/competitions/teams` - Créer une équipe
- `GET /api/competitions/:id/teams` - Équipes d'une compétition
- `POST /api/competitions/teams/:teamId/join` - Rejoindre une équipe
- `DELETE /api/competitions/teams/:teamId/leave` - Quitter une équipe
- `GET /api/competitions/teams/my-teams` - Mes équipes

### Classement
- `GET /api/competitions/:id/leaderboard` - Classement d'une compétition

### Gestion (FORMATEUR)
- `GET /api/competitions/:id/participants` - Liste des participants
- `PATCH /api/competitions/:id/participants/:userId/score` - Mettre à jour le score

## 🎨 Types de compétition

### Type (CompetitionType)
- `ONLINE` - En ligne
- `PHYSICAL` - Présentiel
- `HYBRID` - Hybride

### Mode de participation (ParticipationType)
- `INDIVIDUAL` - Individuel uniquement
- `TEAM` - Équipe uniquement
- `BOTH` - Les deux modes possibles

### Statut (CompetitionStatus)
- `OPEN` - Inscriptions ouvertes
- `CLOSED` - Inscriptions fermées
- `IN_PROGRESS` - En cours
- `COMPLETED` - Terminée
- `CANCELLED` - Annulée

## 🚀 Utilisation

### Ajouter au routing principal

Le module est déjà ajouté dans `app.routes.ts` :

```typescript
{
  path: 'competitions',
  canActivate: [authGuard, RoleGuard],
  data: { roles: ['APPRENANT', 'FORMATEUR'] },
  loadChildren: () => import('./features/competitions/competitions.routes').then(m => m.COMPETITION_ROUTES)
}
```

### Navigation

Le lien est ajouté dans la sidebar pour les rôles APPRENANT et FORMATEUR.

## 🔐 Sécurité

- Les routes sont protégées par `authGuard` et `RoleGuard`
- Seuls les FORMATEURS peuvent créer et gérer les compétitions
- Les APPRENANTS peuvent uniquement participer et voir les classements

## 📊 Base de données

Le module utilise les tables suivantes :
- `competitions` - Compétitions
- `participants` - Participants individuels
- `teams` - Équipes
- `leaderboards` - Classement
- `awards` - Récompenses
- `sessions` - Sessions/rounds
- `jury` - Jury/évaluateurs
- `tickets` - Tickets (si applicable)

## 🎯 Prochaines étapes

Pour étendre le module :
1. Ajouter la gestion des sessions/rounds
2. Implémenter le système de jury
3. Ajouter les tickets pour les événements payants
4. Créer un système de notifications
5. Ajouter des statistiques détaillées
6. Implémenter le système de récompenses/badges

## 🐛 Dépannage

### Erreur 404 sur les routes
Vérifiez que le module est bien importé dans `app.routes.ts`

### Erreur d'autorisation
Vérifiez que l'utilisateur a le bon rôle (FORMATEUR ou APPRENANT)

### Erreur API
Vérifiez que le backend est démarré et que l'URL de l'API est correcte dans `environment.ts`
