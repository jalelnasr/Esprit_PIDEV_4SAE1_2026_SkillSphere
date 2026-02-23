# SkillSphere - Frontend Template & Architecture

Modern, professional frontend for SkillSphere - a comprehensive platform for professional training, certification, and skill development.

## 🎯 Project Overview

SkillSphere is a complete business solution combining:
- **Learning Management** (B2C): Course catalog, enrollment, learning player, progress tracking
- **Certification & Exams**: Online assessments, certificate generation, verification
- **Corporate Training** (B2B): Employee management, team dashboards, analytics
- **Gamification**: Virtual labs, leaderboards, badges, XP system
- **Community & Social**: Posts, Q&A, groups, reputation system
- **Events & Workshops**: Event management, ticketing, attendee tracking

## 📁 Project Structure

```
src/app/
├── core/                    # Core services, guards, interceptors
│   ├── services/           # Auth, Course, Toast services
│   ├── guards/             # Route guards
│   └── interceptors/       # HTTP interceptors (future)
│
├── shared/                 # Shared across features
│   ├── components/         # Reusable: Cards, Toast, Modals, etc
│   ├── models/            # TypeScript interfaces & models
│   ├── pipes/             # Custom pipes
│   ├── directives/        # Custom directives
│   └── constants/         # App constants
│
├── layout/                 # Global layout components
│   ├── sidebar/           # Main navigation sidebar
│   ├── topbar/            # Header with search, notifications
│   └── main-layout/       # Main layout wrapper
│
├── features/               # Feature modules (lazy-loaded)
│   ├── auth/              # Login, Register, Password Reset
│   ├── dashboard/         # Main dashboard with stats
│   ├── learning/          # Courses, lessons, progress
│   ├── certification/     # Exams, certificates
│   ├── corporate/         # Company management
│   ├── gamification/      # Labs, leaderboards, badges
│   ├── community/         # Posts, Q&A, groups
│   └── events/            # Event management
│
├── assets/                # Images, icons, etc
└── styles/               # Global stylesheets
```

## 🎨 Design System

### Colors
- **Primary**: `#667eea` (Blue/Purple)
- **Primary Dark**: `#764ba2` (Violet)
- **Success**: `#2ecc71` (Green)
- **Error**: `#e74c3c` (Red)
- **Warning**: `#f39c12` (Orange)
- **Info**: `#3498db` (Blue)

### Typography
- **Font**: System fonts (San Francisco, Segoe UI, etc)
- **Headings**: 700 font-weight
- **Body**: 14px base font size

### Spacing
Uses 8px base unit: 4px, 8px, 12px, 16px, 24px, 32px, 48px

### Border Radius
- **Small**: 4px
- **Medium**: 8px
- **Large**: 12px
- **Full**: 9999px (circles/pills)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Angular 18.2
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will be available at `http://localhost:4200`

## 🔐 Authentication

### Current Authentication Flow (Mock)
1. User visits `/auth/login`
2. Enters credentials (mock validation)
3. Token saved to localStorage
4. Redirected to dashboard
5. Protected routes check authentication via guards (to be implemented)

### Mock Credentials (for testing)
```
Email: any@email.com
Password: any password
```

### Future: Spring Boot Integration
- Replace mock services with HTTP calls to Spring Boot API
- Implement JWT token refresh
- Add OAuth2/SSO integration
- CORS configuration

## 📱 Main Screens

### ✅ Implemented MVP Screens
- **Login**: Beautiful auth page with form validation
- **Register**: Role-based signup with email verification flow
- **Dashboard**: Stats, active courses, recommendations
- **Browse Courses**: Filtered catalog with search
- **Course Detail**: Demographics, curriculum, reviews, enrollment
- **My Courses**: Progress tracking, continue learning
- **Learning Player**: Video player with lesson navigation
- **Certification**: Exam list, certificates, badging
- **Corporate Dashboard**: Team overview, KPIs
- **Gamification**: Virtual labs, global leaderboard
- **Community**: Feed, Q&A forum
- **Events**: Event listing, my events

## 🔌 Service Integration (Mock → Real)

### Services to Replace with Spring Boot

**AuthService** (`src/app/core/services/auth.service.ts`)
```typescript
// Current: Mock login with localStorage
// Future: POST /api/auth/login → JWT tokens

login(credentials): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/api/auth/login', credentials);
}
```

**CourseService** (`src/app/core/services/course.service.ts`)
```typescript
// Current: Mock course array
// Future: GET /api/courses, /api/courses/:id, POST /api/enrollments

getCourses(page, pageSize): Observable<PaginatedResponse<Course>> {
  return this.http.get<PaginatedResponse<Course>>(
    `/api/courses?page=${page}&size=${pageSize}`
  );
}
```

**ToastService**: Ready to use - no changes needed

## 🎯 Feature Module Routes

| Module | Base Path | Routes |
|--------|-----------|--------|
| Auth | `/auth` | login, register, forgot-password |
| Learning | `/learning` | browse, course/:id, my-courses, learning/:courseId |
| Certification | `/certification` | exams, certificates |
| Corporate | `/corporate` | dashboard, teams, analytics |
| Gamification | `/gamification` | labs, leaderboard |
| Community | `/community` | feed, qa, groups |
| Events | `/events` | browse, my-events, event/:id |

## 🔄 Lazy Loading

All feature modules are lazy-loaded for optimal performance:
```typescript
{
  path: 'learning',
  loadChildren: () => import('./features/learning/learning.module')
    .then(m => m.LearningModule)
}
```

## 🎭 Reusable Components

### Already Implemented
- `CourseCard`: Display single course with thumbnail, rating, price
- `ToastContainer`: Global toast notifications (success, error, warning, info)
- `MainLayout`: Sidebar + Topbar + Content area wrapper
- `Sidebar`: Navigation with collapsed state and submenus
- `Topbar`: Search, notifications, user menu

### To Be Added
- `Modal`: Generic modal dialog
- `Table`: Data table with sorting, pagination
- `Pagination`: Reusable pagination component
- `ProgressBar`: Progress tracking
- `Badge`: Status badges
- `Tabs`: Tab navigation
- `Dropdown`: Reusable dropdown menu
- `LoadingSkeleton`: Loading placeholder
- `EmptyState`: Empty content placeholder

## 📊 Data Models

### Core Models (in `src/app/shared/models/`)
- `User`: User profile and authentication
- `Course`: Course information and metadata
- `CourseDetail`: Extended course with curriculum and reviews
- `Enrollment`: User course enrollment
- `CourseProgress`: Lesson completion tracking
- `Badge`: Achievement badges
- `CertifyTemplate`: Certificate layout

## 🔐 Security Considerations

- [ ] Implement Auth Guards on protected routes
- [ ] Add JWT token refresh logic
- [ ] Validate form inputs on client & server
- [ ] Sanitize user-generated content (XSS prevention)
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Secure against SQL injection (server-side)

## 🚀 Next Steps

1. **Connect to Spring Boot Backend**
   - Replace mock services with real API calls
   - Implement interceptors for auth headers
   - Add error handling

2. **Implement Missing Components**
   - Generic Modal dialog
   - Data tables with sorting
   - Advanced filters
   - File uploads

3. **Add Features**
   - Real-time notifications (WebSocket)
   - Chat functionality
   - Video streaming
   - File management

4. **Optimization**
   - Implement virtual scrolling for large lists
   - Add image lazy loading
   - Bundle size optimization
   - Performance monitoring

5. **Testing**
   - Unit tests for services
   - Component tests
   - E2E tests
   - Visual regression testing

6. **Deployment**
   - Docker containerization
   - CI/CD pipeline
   - Environment configurations
   - Analytics & monitoring

## 📚 Documentation

- [Component Development Guide](./COMPONENT_GUIDE.md)
- [API Integration Guide](./API_INTEGRATION.md)
- [Styling Guide](./STYLING_GUIDE.md)

## 📄 License

Proprietary - SkillSphere Platform

## 👥 Team

- Frontend Development: Angular Team
- Design: UI/UX Team
- Backend: Spring Boot Team

---

**Last Updated**: February 2026
**Angular Version**: 18.2.0
**Node Version**: 18+
