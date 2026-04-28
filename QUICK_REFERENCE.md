# SkillSphere Frontend - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install & Run
npm install
npm start
# Open http://localhost:4200
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/              # Global services & guards
│   │   └── services/      # Auth, Course, Toast services
│   ├── shared/            # Reusable components & models
│   │   ├── components/    # CourseCard, ToastContainer
│   │   ├── models/        # User, Course, Auth models
│   │   ├── pipes/         # Custom pipes
│   │   └── directives/    # Custom directives
│   ├── layout/            # Main layout components
│   │   ├── sidebar/
│   │   ├── topbar/
│   │   └── main-layout/
│   └── features/          # Feature modules (lazy-loaded)
│       ├── auth/          # Login, Register, Forgot Password
│       ├── learning/      # Courses, Learning Player
│       ├── certification/ # Exams, Certificates
│       ├── corporate/     # B2B Dashboard
│       ├── gamification/  # Labs, Leaderboard
│       ├── community/     # Feed, Q&A
│       └── events/        # Events Browsing
├── environments/          # Environment configs
├── styles.css             # Global styles & design system
├── main.ts                # Application entry point
└── index.html             # HTML root
```

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `app.routes.ts` | Route configuration & lazy loading |
| `app.config.ts` | Global providers (HTTP, Animations) |
| `styles.css` | Design system (colors, spacing, shadows) |
| `environment.ts` | Dev config (API URL, flags) |
| `environment.prod.ts` | Production config |

## 🧩 Shared Components

### Toast Notifications
```typescript
constructor(private toastService: ToastService) {}

// Usage
this.toastService.success('Course enrolled!');
this.toastService.error('Something went wrong');
this.toastService.warning('Confirm action');
this.toastService.info('New information');
```

### Course Card
```typescript
import { CourseCardComponent } from '@shared/components/course-card';

@Component({
  imports: [CourseCardComponent],
  template: `
    <app-course-card 
      [course]="course"
      (enroll)="onEnroll($event)"
    ></app-course-card>
  `
})
```

## 🔐 Authentication Flow

```
1. User visits app
   ↓
2. Router checks auth guard
   ↓
3. If not authenticated → Redirect to /auth/login
   ↓
4. User logs in with email/password
   ↓
5. AuthService stores JWT in localStorage
   ↓
6. isAuthenticated$ BehaviorSubject emits true
   ↓
7. Access granted to protected routes
```

**Auth Guards**: Add to protected routes in `app.routes.ts`
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

## 🎨 Design System Variables

### Colors
```css
--color-primary: #667eea;         /* Blue-purple */
--color-secondary: #764ba2;       /* Violet */
--color-success: #2ecc71;         /* Green */
--color-error: #e74c3c;           /* Red */
--color-warning: #f39c12;         /* Orange */
--color-info: #3498db;            /* Blue */
--color-gray-100: #f8f9fa;        /* Light background */
--color-gray-900: #1a1a1a;        /* Dark text */
```

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

### Shadows
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 12px 30px rgba(0, 0, 0, 0.2);
```

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

## 📦 Core Services

### AuthService
```typescript
import { AuthService } from '@core/services';

constructor(private authService: AuthService) {}

// Methods
this.authService.login(email, password).subscribe(...);
this.authService.logout();
this.authService.getCurrentUser();
this.authService.isAuthenticated$.subscribe(isAuth => {...});
```

### CourseService
```typescript
import { CourseService } from '@core/services';

constructor(private courseService: CourseService) {}

// Methods
this.courseService.getCourses(page, pageSize).subscribe(...);
this.courseService.getCourseById(id).subscribe(...);
this.courseService.enrollCourse(courseId).subscribe(...);
this.courseService.getCourseProgress(courseId).subscribe(...);
```

### ToastService
```typescript
import { ToastService } from '@core/services';

constructor(private toastService: ToastService) {}

// Methods
this.toastService.success(message, duration?);
this.toastService.error(message, duration?);
this.toastService.warning(message, duration?);
this.toastService.info(message, duration?);
```

## 🔄 Common Patterns

### Subscribing to Data
```typescript
ngOnInit() {
  this.courseService.getCourses().subscribe({
    next: (data) => {
      this.courses = data.courses;
    },
    error: (error) => {
      this.toastService.error('Failed to load courses');
    },
    complete: () => {
      console.log('Courses loaded');
    }
  });
}
```

### HTTP Requests (MockData → API)
```typescript
// Before (Mock)
return of(mockCourses);

// After (API)
return this.http.get<Course[]>(`${environment.apiUrl}/courses`);
```

### Lazy Loading Modules
```typescript
// Routes stay the same - lazy loading automatic
{
  path: 'learning',
  loadChildren: () => import('./features/learning/learning.module')
    .then(m => m.LearningModule)
}
```

### Form Validation
```typescript
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit() {
    if (this.loginForm.valid) {
      // Submit form
    }
  }
}
```

## 🧪 Testing

### Unit Test Template
```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

### Component Test Template
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 4200 in use | `ng serve --port 4201` |
| Module not found | Check import paths, run `npm install` |
| Styles not applying | Clear cache, restart server |
| API 404 errors | Check `environment.apiUrl`, backend running? |
| Circular dependencies | Reorganize imports, use barrel exports |
| Memory leaks | Unsubscribe in `ngOnDestroy()` |

## 📝 Component Template

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyService } from '@core/services';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
  `,
  styles: [`
    .container {
      padding: var(--spacing-lg);
      background: var(--color-gray-100);
      border-radius: var(--radius-md);
    }
  `]
})
export class MyComponent implements OnInit {
  title = 'My Component';
  description = 'This is a template component';

  constructor(private myService: MyService) {}

  ngOnInit() {
    // Initialize component
  }
}
```

## 🚀 Build & Deploy

```bash
# Development
npm start

# Production build
npm run build

# Docker
docker build -t skillsphere-frontend .
docker run -p 80:80 skillsphere-frontend

# Deployment
npm run build
# Upload dist/platforme to hosting
```

## 📚 Resources

- [Angular Docs](https://angular.io/docs)
- [Material Components](https://material.angular.io)
- [RxJS Guide](https://rxjs.dev/guide/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🔗 Key Routes

| Route | Component | Module |
|-------|-----------|--------|
| `/auth/login` | LoginComponent | auth |
| `/auth/register` | RegisterComponent | auth |
| `/dashboard` | DashboardComponent | dashboard |
| `/learning/catalog` | CourseCatalogComponent | learning |
| `/learning/detail/:id` | CourseDetailComponent | learning |
| `/learning/player/:id` | LearningPlayerComponent | learning |
| `/certification/exams` | ExamListComponent | certification |
| `/corporate` | CorporateDashboardComponent | corporate |
| `/gamification/labs` | LabsListComponent | gamification |
| `/community/feed` | FeedComponent | community |
| `/events` | EventsBrowseComponent | events |

---

**Version**: 1.0.0 | **Last Updated**: February 2026
