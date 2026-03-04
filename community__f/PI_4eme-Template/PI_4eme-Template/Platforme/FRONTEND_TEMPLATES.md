# SkillSphere Frontend - Templates & Pages Guide

## 📋 Table of Contents
1. [Project Structure](#project-structure)
2. [Available Templates](#available-templates)
3. [How to Access Pages](#how-to-access-pages)
4. [Authentication Flow](#authentication-flow)
5. [Main Features Pages](#main-features-pages)
6. [Responsive Design](#responsive-design)
7. [Component Architecture](#component-architecture)

---

## 📁 Project Structure

```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts          # Authentication management
│   │   ├── course.service.ts        # Course management
│   │   ├── toast.service.ts         # Notifications
│   │   └── index.ts                 # Barrel export
│   └── guards/                      # (To be added)
│
├── shared/
│   ├── models/
│   │   ├── user.model.ts            # User interfaces
│   │   ├── course.model.ts          # Course interfaces
│   │   ├── auth.model.ts            # Auth interfaces
│   │   └── pagination.model.ts      # Pagination
│   └── components/
│       ├── toast-container/         # Global notifications
│       └── course-card/             # Reusable course card
│
├── layout/
│   ├── sidebar/                     # Navigation menu
│   ├── topbar/                      # Header with search
│   └── main-layout/                 # Main wrapper
│
└── features/
    ├── home/                        # Landing page
    ├── auth/                        # Login, Register, Forgot Password
    ├── dashboard/                   # User dashboard
    ├── learning/                    # Course catalog & player
    ├── certification/               # Exams & Certificates
    ├── corporate/                   # B2B solutions
    ├── gamification/                # Labs & Leaderboard
    ├── community/                   # Feed & QA Forum
    ├── events/                      # Events management
    └── user/                        # User profile & settings
```

---

## 🎨 Available Templates

### 1. **HOME PAGE** (Public)
**URL:** `http://localhost:4200/home`

**Features:**
- Modern landing page
- Hero section with CTA
- 6 key features showcase
- Statistics section
- Customer testimonials
- Footer with links
- Fully responsive design

**Access:**
- Automatic redirect from `/`
- Click SkillSphere logo from anywhere
- Direct URL access

---

### 2. **AUTHENTICATION PAGES** (Public)

#### Login Page
**URL:** `http://localhost:4200/auth/login`

**Template Elements:**
- Email input field
- Password input field
- "Remember me" checkbox
- "Forgot Password" link
- Sign up link
- Social login buttons (Google, GitHub)
- Form validation with error messages

**Test Credentials:**
```
Email: test@example.com
Password: password123
```

---

#### Register Page
**URL:** `http://localhost:4200/auth/register`

**Template Elements:**
- First name input
- Last name input
- Email input
- Password input
- Confirm password input
- Role selector dropdown:
  - Student
  - Instructor
  - Corporate HR
  - Recruiter
- Terms & conditions checkbox
- Form validation

---

#### Forgot Password Page
**URL:** `http://localhost:4200/auth/forgot-password`

**Template Elements:**
- Email input
- Submit button
- Back to login link
- Success confirmation message

---

### 3. **PROTECTED PAGES** (Requires Login)

#### Dashboard
**URL:** `http://localhost:4200/dashboard`

**Template Sections:**
- Welcome banner with user name
- 4 stat cards:
  - Enrolled courses
  - In-progress courses
  - Completed courses
  - Total XP points
- Recent courses section (3 items with progress bars)
- Recommended courses section (3 items)
- Course cards showing:
  - Course thumbnail
  - Course title
  - Progress percentage
  - Instructor info

---

#### Learning Module
**URL Base:** `http://localhost:4200/learning`

**Sub-Pages:**

**a) Course Catalog**
`http://localhost:4200/learning/catalog`
- Filter by category
- Filter by level (Beginner, Intermediate, Advanced)
- Search functionality
- Sort options
- Pagination
- Course grid display

**b) Course Detail**
`http://localhost:4200/learning/detail/:id`
- Course hero section with thumbnail
- Tabs: Overview, Curriculum, Reviews
- Course description
- Instructor profile
- Enrollment button
- Course metadata (level, duration, rating)

**c) My Courses**
`http://localhost:4200/learning/my-courses`
- In-progress section with progress bars
- Completed section with certificates
- Course cards with progress tracking

**d) Learning Player**
`http://localhost:4200/learning/player/:id/:lessonId`
- Video player
- Lesson navigation sidebar
- Progress tracking
- Next/Previous buttons
- Lesson notes area

---

#### Certification Module
**URL Base:** `http://localhost:4200/certification`

**Sub-Pages:**

**a) Exam List**
`http://localhost:4200/certification/exams`
- Upcoming exams section
- Past exams section
- Exam details:
  - Exam name
  - Date & time
  - Duration
  - Passing score
  - Status badge

**b) Certificate List**
`http://localhost:4200/certification/certificates`
- Earned certificates display
- Certificate details:
  - Course name
  - Date earned
  - Credential ID
  - Download button

---

#### Gamification Module
**URL Base:** `http://localhost:4200/gamification`

**Sub-Pages:**

**a) Labs List**
`http://localhost:4200/gamification/labs`
- Virtual labs/challenges grid
- Lab cards showing:
  - Lab name
  - Difficulty level
  - Time to complete
  - Points available
  - Start button

**b) Leaderboard**
`http://localhost:4200/gamification/leaderboard`
- Top 10 ranking table
- User rank with:
  - Username
  - Avatar
  - Total points
  - Courses completed
  - Current rank position

---

#### Community Module
**URL Base:** `http://localhost:4200/community`

**Sub-Pages:**

**a) Feed**
`http://localhost:4200/community/feed`
- Social posts/discussions
- Post cards with:
  - Author info
  - Post content
  - Like count
  - Comment count
  - Share buttons

**b) QA Forum**
`http://localhost:4200/community/qa`
- Question listing
- Tags filter
- Search functionality
- Question cards showing:
  - Question title
  - Category/Tags
  - Author
  - Answer count
  - Views

---

#### Events Module
**URL Base:** `http://localhost:4200/events`

**Sub-Pages:**

**a) Events Browse**
`http://localhost:4200/events/browse`
- Upcoming events grid
- Event filter by date/category
- Event cards with:
  - Event title
  - Date & time
  - Location
  - Attendees count
  - Register button

**b) My Events**
`http://localhost:4200/events/my-events`
- Registered events list
- Event details:
  - Confirmation status
  - Calendar link
  - Reminder option

---

#### Corporate Module
**URL Base:** `http://localhost:4200/corporate`

**Pages:**

**a) Corporate Dashboard**
- Company metrics
- Team member list
- Employee learning stats
- Team performance charts

---

#### User Module
**URL Base:** `http://localhost:4200/user`

**Sub-Pages:**

**a) Profile Page**
`http://localhost:4200/user/profile`
- User profile header:
  - Cover image
  - Avatar with upload button
  - User name
  - Email
  - Location
  - Join date
- Stats section:
  - Courses enrolled
  - Certificates earned
  - Total XP points
- Tab navigation:
  - About (with bio)
  - Achievements
  - Activity
- Edit profile form:
  - Name field
  - Email field
  - Phone field
  - Location field
  - Bio textarea (500 char limit)
  - Form validation
  - Save button

---

## 🔐 Authentication Flow

### Login Flow
1. User arrives at home page → `/home`
2. Click "Login" button → `/auth/login`
3. Enter credentials → Navigate to `/dashboard`
4. User session stored in localStorage

### Register Flow
1. Click "Sign Up" button → `/auth/register`
2. Fill in registration form
3. Select user role
4. Submit → Automatic login → `/dashboard`

### Protected Routes
- All dashboard/feature pages require authentication
- Unauthenticated users redirected to `/auth/login`
- Session persists across page refreshes

---

## 🎯 Main Features Pages

### By User Role

| Role | Access | Key Features |
|------|--------|--------------|
| **Student** | Learning, Community, Events, Gamification | Browse courses, join events, compete on leaderboard |
| **Instructor** | Learning (create), Community | Create courses, answer questions, track student progress |
| **Corporate HR** | Corporate, Certification | Manage team learning, assign courses, view analytics |
| **Recruiter** | Dashboard, Community | Search talent, view profiles, connect with users |

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### All Templates Include:
- ✅ Responsive navigation
- ✅ Mobile-optimized forms
- ✅ Touch-friendly buttons
- ✅ Flexible grid layouts
- ✅ Adaptive padding/margins
- ✅ Optimized images

---

## 🏗️ Component Architecture

### Layout Components
```typescript
MainLayoutComponent
├── SidebarComponent (7 menu items)
├── TopbarComponent (search, notifications, profile)
└── router-outlet (page content)
```

### Shared Components
```typescript
ToastContainerComponent      // Global notifications
└── Shows success, error, warning, info messages

CourseCardComponent          // Reusable course display
├── Course thumbnail
├── Course metadata
├── Rating
└── Enroll button
```

### Feature Modules
Each feature module is:
- ✅ Lazy-loaded for performance
- ✅ Standalone components
- ✅ Reactive forms with validation
- ✅ RxJS observables for state management
- ✅ Service-based data handling

---

## 🔗 Quick Navigation Links

| Page | URL | Status |
|------|-----|--------|
| Home | `/home` | ✅ Public |
| Login | `/auth/login` | ✅ Public |
| Register | `/auth/register` | ✅ Public |
| Dashboard | `/dashboard` | 🔒 Protected |
| Courses | `/learning/catalog` | 🔒 Protected |
| My Courses | `/learning/my-courses` | 🔒 Protected |
| Certifications | `/certification/exams` | 🔒 Protected |
| Leaderboard | `/gamification/leaderboard` | 🔒 Protected |
| Community | `/community/feed` | 🔒 Protected |
| Events | `/events/browse` | 🔒 Protected |
| User Profile | `/user/profile` | 🔒 Protected |

---

## 📝 Form Examples

### Login Form
```
Email: test@example.com
Password: password123
[Remember me checkbox]
[Forgot Password link]
[Sign In Button]
```

### Profile Form
```
Name: [text input - required, min 3 chars]
Email: [email input - required, valid email]
Phone: [tel input - optional]
Location: [text input - optional]
Bio: [textarea - optional, max 500 chars]
[Save Changes Button]
```

### Course Filter
```
Category: [All, Web Dev, Data Science, Mobile, AI]
Level: [All, Beginner, Intermediate, Advanced, Expert]
Price: [free, paid]
[Apply Filters Button]
```

---

## 🎨 Design System

### Colors
- **Primary:** #667eea (Blue-Purple)
- **Accent:** #764ba2 (Violet)
- **Success:** #2ecc71 (Green)
- **Error:** #e74c3c (Red)
- **Warning:** #f39c12 (Orange)
- **Info:** #3498db (Blue)

### Typography
- **Base Font Size:** 14px
- **Headings:** System fonts, bold
- **Body:** Regular weight, line-height: 1.6

### Spacing
- **Unit:** 8px
- **Variants:** 4px, 8px, 12px, 16px, 24px, 32px

### Border Radius
- **Small:** 4px
- **Medium:** 8px
- **Large:** 12px
- **Full:** 9999px

---

## 🚀 Getting Started

### Start Development Server
```bash
npm start
# Application opens at http://localhost:4200
```

### Access Homepage
```
https://localhost:4200/home
or
https://localhost:4200/  (auto-redirects to /home)
```

### Test Login
```
Email: test@example.com
Password: password123
```

---

## 📊 Performance Metrics

- **Initial Bundle:** 156.68 kB
- **Lazy-loaded Chunks:** 24 feature modules
- **Home Chunk:** 26.72 kB
- **Build Time:** ~2.8 seconds
- **Watch Mode:** Enabled for live reload

---

## ✨ Key Features Overview

| Feature | Status | Details |
|---------|--------|---------|
| Responsive Design | ✅ Complete | Mobile, tablet, desktop optimized |
| Authentication | ✅ Complete | Login, register, forgot password |
| Dashboard | ✅ Complete | User stats and quick access |
| Learning Path | ✅ Complete | Catalog, detail, player, progress |
| Certification | ✅ Complete | Exams and certificates |
| Gamification | ✅ Complete | Labs and leaderboard |
| Community | ✅ Complete | Feed and QA forum |
| Events | ✅ Complete | Browse and manage events |
| User Profile | ✅ Complete | Profile edit and stats |
| Corporate | ✅ Complete | B2B dashboard |
| Notifications | ✅ Complete | Toast system |
| Forms Validation | ✅ Complete | Reactive forms with validators |

---

## 📞 Support

For questions or issues:
1. Check the form validation rules
2. Verify authentication status in localStorage
3. Check browser console for errors
4. Verify API endpoints in environment files

---

**Last Updated:** February 15, 2026  
**Version:** 1.0  
**All templates are in English** ✅
