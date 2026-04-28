# Guide d'Intégration - Système d'Entretiens

## 📋 Étapes d'Intégration

### Étape 1 : Ajouter les routes B2B

Ouvrez `src/app/admin/b2b/b2b.routes.ts` et modifiez-le :

```typescript
import { Routes } from '@angular/router';
import { B2bLayoutComponent } from './b2b-layout/b2b-layout.component';
import { INTERVIEWS_ROUTES } from './interviews/interviews.routes';

export const B2B_ROUTES: Routes = [
  {
    path: '',
    component: B2bLayoutComponent,
    children: [
      // ... autres routes existantes ...
      
      {
        path: 'interviews',
        children: INTERVIEWS_ROUTES
      }
    ]
  }
];
```

### Étape 2 : Ajouter les liens dans la sidebar

Ouvrez `src/app/admin/b2b/b2b-sidebar/b2b-sidebar.component.html` et ajoutez :

```html
<!-- Section Entretiens -->
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

### Étape 3 : Vérifier les imports

Assurez-vous que les modules suivants sont importés dans votre application :

```typescript
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
```

### Étape 4 : Configurer l'URL de l'API

Ouvrez `src/app/admin/b2b/services/interview.service.ts` et vérifiez l'URL :

```typescript
private apiUrl = 'http://localhost:8083/api/interviews';
```

Modifiez si nécessaire selon votre configuration.

### Étape 5 : Installer les dépendances (si nécessaire)

```bash
npm install ngx-toastr
```

### Étape 6 : Importer ngx-toastr dans app.config.ts

```typescript
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... autres providers ...
    provideToastr({
      timeOut: 4000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    })
  ]
};
```

---

## 🧪 Vérification de l'Intégration

### Test 1 : Vérifier que les routes sont accessibles

```
http://localhost:4200/admin/b2b/interviews/list
http://localhost:4200/admin/b2b/interviews/calendar
```

### Test 2 : Vérifier que les liens de la sidebar fonctionnent

1. Ouvrir l'application
2. Cliquer sur "Entretiens" dans la sidebar
3. Vérifier que la page se charge

### Test 3 : Vérifier la connexion à l'API

1. Ouvrir la console du navigateur (F12)
2. Aller à l'onglet "Network"
3. Créer un nouvel entretien
4. Vérifier que la requête POST est envoyée à `http://localhost:8083/api/interviews`

---

## 📁 Structure des Fichiers

```
src/app/admin/b2b/
├── interviews/
│   ├── interview-list.component.ts
│   ├── interview-list.component.html
│   ├── interview-list.component.css
│   ├── interview-calendar.component.ts
│   ├── interview-calendar.component.html
│   ├── interview-calendar.component.css
│   ├── interviews.routes.ts
│   ├── index.ts
│   └── INTEGRATION_GUIDE.md (ce fichier)
├── services/
│   └── interview.service.ts
└── b2b.routes.ts
```

---

## 🔧 Configuration Avancée

### Personnaliser les couleurs

Ouvrez `interview-list.component.css` ou `interview-calendar.component.css` et modifiez les couleurs :

```css
.badge-primary {
  background-color: #0d6efd; /* Modifier cette couleur */
}
```

### Personnaliser les messages

Ouvrez `interview-list.component.ts` et modifiez les messages :

```typescript
this.toastr.success('Entretien créé avec succès'); // Modifier ce message
```

### Personnaliser les formats de date

Ouvrez `interview-list.component.ts` et modifiez la fonction `formatDateTime` :

```typescript
formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('fr-FR'); // Modifier le format
}
```

---

## 🚀 Déploiement

### Production

1. Compiler le frontend :
```bash
ng build --configuration production
```

2. Compiler le backend :
```bash
mvn clean package
```

3. Déployer les fichiers générés

---

## 📊 Monitoring

### Vérifier les logs du backend

```bash
# Voir les logs en temps réel
tail -f logs/application.log

# Chercher les erreurs
grep ERROR logs/application.log
```

### Vérifier les logs du frontend

1. Ouvrir la console du navigateur (F12)
2. Aller à l'onglet "Console"
3. Vérifier les erreurs

---

## 🐛 Problèmes Courants

### Problème : "Cannot GET /api/interviews"

**Cause** : Le backend n'est pas démarré

**Solution** :
```bash
cd B2BModule
mvn spring-boot:run
```

### Problème : "CORS error"

**Cause** : CORS n'est pas configuré correctement

**Solution** : Vérifier `CorsConfig.java` dans le backend

### Problème : "Module not found"

**Cause** : Les dépendances ne sont pas installées

**Solution** :
```bash
npm install
```

### Problème : "Cannot find module 'ngx-toastr'"

**Cause** : ngx-toastr n'est pas installé

**Solution** :
```bash
npm install ngx-toastr
```

---

## ✅ Checklist d'Intégration

- [ ] Routes ajoutées dans `b2b.routes.ts`
- [ ] Liens ajoutés dans la sidebar
- [ ] Service créé et configuré
- [ ] Composants créés
- [ ] Dépendances installées
- [ ] URL de l'API configurée
- [ ] Backend démarré sur le port 8083
- [ ] Frontend démarré sur le port 4200
- [ ] Routes accessibles
- [ ] API fonctionnelle
- [ ] Tests passés

---

## 📞 Support

Pour toute question, consultez :
- [INTERVIEW_SYSTEM_README.md](../../../B2BModule/INTERVIEW_SYSTEM_README.md)
- [INTERVIEW_SYSTEM_FRONTEND_GUIDE.md](../INTERVIEW_SYSTEM_FRONTEND_GUIDE.md)
- [INTERVIEW_SYSTEM_TEST_GUIDE.md](../../../B2BModule/INTERVIEW_SYSTEM_TEST_GUIDE.md)

---

**Créé le** : 5 Mars 2026
