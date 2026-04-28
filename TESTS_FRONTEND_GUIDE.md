# 🧪 Guide des Tests Frontend Angular

## 📋 Résumé des Tests

**Total**: 59 tests ✅
- AuthService - Tests d'authentification
- CompanyService - Tests de gestion des entreprises  
- MissionService - Tests de gestion des missions
- ContractService - Tests de gestion des contrats
- CareersComponent - Tests du composant carrières
- MyCompanyComponent - Tests du composant entreprise
- AppComponent - Tests du composant principal

**Taux de succès**: 100% 🎯

---

## 🚀 Commandes Rapides

### Option 1: Utiliser le fichier batch (Windows)
```bash
# Double-cliquer sur le fichier ou exécuter:
TESTER_FRONTEND.bat
```

### Option 2: Commandes manuelles

#### Tests rapides (recommandé)
```bash
cd PI_4eme-Template/PI_4eme-Template/Platforme
ng test --watch=false --browsers=ChromeHeadless
```

#### Tests avec navigateur
```bash
ng test
```

#### Tests avec couverture
```bash
ng test --watch=false --code-coverage --browsers=ChromeHeadless
start coverage/index.html
```

---

## 📊 Interpréter les Résultats

### ✅ Succès
```
Chrome Headless: Executed 59 of 59 SUCCESS
TOTAL: 59 SUCCESS
```
Tous les tests passent!

### ❌ Échec
```
Chrome Headless: Executed 59 of 59 (2 FAILED)
TOTAL: 2 FAILED, 57 SUCCESS
```
2 tests ont échoué, vérifier les détails dans le terminal.

---

## 🔍 Tests Disponibles

### Services Core
- **auth.service.spec.ts** - Authentification (login, logout, session)
- **company.service.spec.ts** - Gestion des entreprises

### Services B2B
- **mission.service.spec.ts** - Gestion des missions freelance
- **contract.service.spec.ts** - Gestion des contrats

### Composants
- **careers.component.spec.ts** - Page carrières
- **my-company.component.spec.ts** - Page entreprise
- **app.component.spec.ts** - Composant racine

---

## 🛠️ Ajouter de Nouveaux Tests

### 1. Créer un fichier de test
```bash
ng generate service mon-service --skip-tests=false
# Crée: mon-service.service.ts et mon-service.service.spec.ts
```

### 2. Structure d'un test
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MonService } from './mon-service.service';

describe('MonService', () => {
  let service: MonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MonService]
    });
    service = TestBed.inject(MonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data', () => {
    const mockData = { id: 1, name: 'Test' };

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

---

## 📈 Rapport de Couverture

Après avoir exécuté les tests avec `--code-coverage`:

1. Ouvrir `coverage/index.html` dans un navigateur
2. Voir le pourcentage de couverture par fichier
3. Cliquer sur un fichier pour voir les lignes non testées

**Objectif**: Viser 80%+ de couverture

---

## 🐛 Dépannage

### Erreur: "Chrome not found"
```bash
# Installer Chrome ou utiliser un autre navigateur
ng test --browsers=Firefox
```

### Erreur: "Port 9876 already in use"
```bash
# Tuer le processus Karma
taskkill /F /IM chrome.exe
```

### Tests lents
```bash
# Utiliser ChromeHeadless au lieu de Chrome
ng test --browsers=ChromeHeadless
```

---

## 📚 Ressources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)

---

## ✅ Checklist Avant Commit

- [ ] Tous les tests passent (`ng test --watch=false`)
- [ ] Couverture de code > 80% (si applicable)
- [ ] Pas de tests désactivés (`xit`, `xdescribe`)
- [ ] Pas de `console.log` dans les tests
