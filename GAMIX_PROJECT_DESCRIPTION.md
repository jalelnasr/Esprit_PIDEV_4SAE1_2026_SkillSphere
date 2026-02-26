# GAMIX - Gamified Cybersecurity Labs Platform

## Project Overview

**Gamix** is a full-stack gamified cybersecurity training platform where users (learners) complete hands-on CTF-style (Capture The Flag) labs inside real Docker containers. The platform turns cybersecurity education into a competitive game with points, levels, ranks, badges, leaderboards, and reviews.

**Backend:** Spring Boot 3.2.3 (Java 17) + MySQL + Docker Engine API + JWT Authentication
**Base URL:** `http://localhost:8080`
**Swagger UI:** `http://localhost:8080/swagger-ui.html`

---

## Core Concepts

| Concept | Description |
|---------|------------|
| **User** | A registered learner or admin. Has totalPoints, level, rank, and earned badges. |
| **Lab** | A cybersecurity challenge (e.g., "SQL Injection Basics", "Linux Privilege Escalation"). Belongs to a category, has difficulty, points, and multiple steps. |
| **Lab Category** | Groups labs by topic (e.g., Web Security, Network Security, Cryptography, Forensics). |
| **Lab Step** | A single task inside a lab. Each step has a hidden **flag** (secret string) the user must find and submit. Each step awards points. |
| **Lab Instance** | A running Docker container for a user working on a lab. Has a unique access URL and port. |
| **Docker Template** | Configuration for how to spin up a lab's container (image, ports, CPU/memory limits, env vars). |
| **Badge** | An achievement unlocked when the user reaches certain point/level thresholds. |
| **User Progress** | Tracks which steps a user has attempted/completed, how many attempts, and the submitted flag. |
| **Lab Review** | A 1-5 star rating + comment that users can leave on labs they've completed. |

---

## User Roles

| Role | Description |
|------|------------|
| `APPRENANT` | Default role for learners. Can do labs, submit flags, earn points, write reviews. |
| `ADMIN` | Full CRUD access on all resources. Can create labs, manage users, see platform stats. |

---

## Gamification Engine

When a user submits a flag via `POST /api/progress/submit-flag/{userId}/{stepId}`:

1. **Flag Validation** - The submitted flag is compared to the step's stored flag
2. **Points Award** - If correct, the step's points are added to the user's `totalPoints`
3. **Level Calculation** - `level = 1 + (totalPoints / 100)`
4. **Rank Update** - Based on total points:
   - `BEGINNER` = 0-99 pts
   - `INTERMEDIATE` = 100-499 pts
   - `ADVANCED` = 500-999 pts
   - `EXPERT` = 1000-2499 pts
   - `MASTER` = 2500+ pts
5. **Badge Award** - All qualifying badges (where user meets requiredPoints AND requiredLevel) are auto-granted
6. **Double-counting prevention** - Already-completed steps cannot award points again

---

## Authentication

All endpoints except `/api/auth/**` require a JWT token in the `Authorization: Bearer <token>` header.

---

## Complete API Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/auth/register` | `RegisterRequest` | Register a new user account. Returns JWT token + user info. | No |
| `POST` | `/api/auth/login` | `LoginRequest` | Login with email/password. Returns JWT token + user info. | No |
| `POST` | `/api/auth/forgot-password` | `ForgotPasswordRequest` | Request a password reset token (logged to server console). | No |
| `POST` | `/api/auth/reset-password` | `ResetPasswordRequest` | Reset password using the token. | No |

**Request/Response DTOs:**

```
RegisterRequest {
  nom: string (required)          // Last name
  prenom: string (required)       // First name
  email: string (required, valid email)
  password: string (required, min 8 chars)
  phone: string (optional)
  adresse: string (optional)
}

LoginRequest {
  email: string (required, valid email)
  password: string (required)
}

ForgotPasswordRequest {
  email: string (required, valid email)
}

ResetPasswordRequest {
  token: string (required)
  newPassword: string (required, min 8 chars)
}

AuthResponse {
  token: string          // JWT token
  idUser: number
  nom: string
  prenom: string
  email: string
  role: "APPRENANT" | "ADMIN"
}
```

---

### 2. User Management (`/api/users`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `GET` | `/api/users/me` | - | Get current logged-in user's profile | User |
| `PUT` | `/api/users/me` | `UserUpdateRequest` | Update current user's profile (nom, prenom, phone, adresse) | User |
| `PUT` | `/api/users/me/password` | `ChangePasswordRequest` | Change current user's password | User |
| `POST` | `/api/users/admin` | `AdminCreateUserRequest` | Admin: Create a new user with any role | Admin |
| `GET` | `/api/users/admin` | - | Admin: List all users | Admin |
| `GET` | `/api/users/admin/{id}` | - | Admin: Get user by ID | Admin |
| `PUT` | `/api/users/admin/{id}` | `AdminUpdateUserRequest` | Admin: Update any user's profile | Admin |
| `PUT` | `/api/users/admin/{id}/role?role=ADMIN` | - | Admin: Change a user's role | Admin |
| `PUT` | `/api/users/admin/{id}/active?active=false` | - | Admin: Activate/deactivate a user | Admin |
| `PUT` | `/api/users/admin/{id}/password` | `AdminResetPasswordRequest` | Admin: Force-reset a user's password | Admin |
| `DELETE` | `/api/users/admin/{id}` | - | Admin: Delete a user | Admin |

**Request/Response DTOs:**

```
UserUpdateRequest {
  nom: string (optional)
  prenom: string (optional)
  phone: string (optional)
  adresse: string (optional)
}

ChangePasswordRequest {
  oldPassword: string (required)
  newPassword: string (required, min 8 chars)
}

AdminCreateUserRequest {
  nom: string (required)
  prenom: string (required)
  email: string (required, valid email)
  password: string (required, min 8 chars)
  role: "APPRENANT" | "ADMIN" (optional, defaults to APPRENANT)
  phone: string (optional)
  adresse: string (optional)
  isActive: boolean (optional, defaults to true)
}

AdminUpdateUserRequest {
  nom: string (optional)
  prenom: string (optional)
  email: string (optional, valid email if provided)
  phone: string (optional)
  adresse: string (optional)
}

AdminResetPasswordRequest {
  newPassword: string (required, min 8 chars)
}

UserResponse {
  idUser: number
  nom: string
  prenom: string
  email: string
  role: "APPRENANT" | "ADMIN"
  phone: string
  adresse: string
  isActive: boolean
  createdAt: string (ISO timestamp)
  totalPoints: number
  level: number
  rank: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | "MASTER"
}
```

---

### 3. Lab Categories (`/api/lab-categories`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/lab-categories` | `LabCategory` | Create a new category | User |
| `GET` | `/api/lab-categories` | - | Get all categories | User |
| `GET` | `/api/lab-categories/{id}` | - | Get category by ID | User |
| `PUT` | `/api/lab-categories/{id}` | `LabCategory` | Update a category | User |
| `DELETE` | `/api/lab-categories/{id}` | - | Delete a category | User |

**Entity:**

```
LabCategory {
  categoryId: number (auto)
  name: string
  description: string
  iconUrl: string
}
```

---

### 4. Labs (`/api/labs`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/labs/{categoryId}` | `Lab` | Create a new lab in a category | User |
| `GET` | `/api/labs` | - | Get all labs | User |
| `GET` | `/api/labs/{id}` | - | Get lab by ID | User |
| `GET` | `/api/labs/category/{categoryId}` | - | Get labs by category | User |
| `GET` | `/api/labs/difficulty/{difficulty}` | - | Get labs by difficulty (EASY, MEDIUM, HARD) | User |
| `GET` | `/api/labs/active` | - | Get all active labs | User |
| `GET` | `/api/labs/level/{level}` | - | Get labs accessible for a given user level | User |
| `PUT` | `/api/labs/{id}` | `Lab` | Update a lab | User |
| `DELETE` | `/api/labs/{id}` | - | Delete a lab | User |

**Entity:**

```
Lab {
  labId: number (auto)
  title: string
  description: string (long text)
  difficulty: string             // "EASY", "MEDIUM", "HARD"
  points: number
  estimatedDurationMinutes: number
  maxRuntimeMinutes: number      // default 120
  instructions: string (long text)
  requiredLevel: number          // default 1
  active: boolean                // default true
  category: LabCategory
  dockerTemplate: DockerTemplate
}
```

---

### 5. Lab Steps (`/api/lab-steps`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/lab-steps/{labId}` | `LabStep` | Create a step for a lab | User |
| `GET` | `/api/lab-steps/{id}` | - | Get step by ID | User |
| `GET` | `/api/lab-steps/lab/{labId}` | - | Get all steps for a lab (ordered by stepNumber) | User |
| `PUT` | `/api/lab-steps/{id}` | `LabStep` | Update a step | User |
| `DELETE` | `/api/lab-steps/{id}` | - | Delete a step | User |

**Entity:**

```
LabStep {
  stepId: number (auto)
  stepNumber: number         // Order of the step in the lab (1, 2, 3...)
  title: string
  description: string (long text)
  hint: string               // Optional hint for the user
  flag: string               // The secret flag the user must submit (e.g., "FLAG{sql_injection_101}")
  points: number             // Points awarded for completing this step
  lab: Lab
}
```

---

### 6. Docker Templates (`/api/docker-templates`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/docker-templates/{labId}` | `DockerTemplate` | Create a Docker template for a lab | User |
| `GET` | `/api/docker-templates` | - | Get all Docker templates | User |
| `GET` | `/api/docker-templates/{id}` | - | Get template by ID | User |
| `GET` | `/api/docker-templates/lab/{labId}` | - | Get template by lab ID | User |
| `PUT` | `/api/docker-templates/{id}` | `DockerTemplate` | Update a template | User |
| `DELETE` | `/api/docker-templates/{id}` | - | Delete a template | User |

**Entity:**

```
DockerTemplate {
  templateId: number (auto)
  imageName: string              // e.g., "gamix/sql-injection-lab"
  imageVersion: string           // e.g., "latest", "1.0"
  exposedPorts: string           // e.g., "80" or "80/tcp"
  environmentVariables: string   // comma-separated, e.g., "FLAG=secret,DB_HOST=localhost"
  cpuLimit: double               // CPU cores limit (e.g., 0.5)
  memoryLimitMb: number          // Memory limit in MB (e.g., 256)
  networkMode: string            // Docker network mode
  volumeMounts: string           // Volume mount configuration
  startupCommand: string         // Override container CMD
  lab: Lab
}
```

---

### 7. Lab Instances (`/api/lab-instances`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/lab-instances/start/{userId}/{labId}` | - | **Start a lab** - pulls Docker image, creates & starts container, returns access URL | User |
| `POST` | `/api/lab-instances/stop/{instanceId}` | - | **Stop a lab** - kills and removes the Docker container | User |
| `GET` | `/api/lab-instances/check-status/{instanceId}` | - | **Get live container status** - queries Docker engine for real-time status | User |
| `POST` | `/api/lab-instances/{userId}/{labId}` | `LabInstance` | Create a lab instance record manually | User |
| `GET` | `/api/lab-instances` | - | Get all lab instances | User |
| `GET` | `/api/lab-instances/{id}` | - | Get instance by ID | User |
| `GET` | `/api/lab-instances/user/{userId}` | - | Get all instances for a user | User |
| `GET` | `/api/lab-instances/lab/{labId}` | - | Get all instances for a lab | User |
| `GET` | `/api/lab-instances/status/{status}` | - | Get instances by status (RUNNING, STOPPED, PENDING) | User |
| `PUT` | `/api/lab-instances/{id}` | `LabInstance` | Update an instance | User |
| `DELETE` | `/api/lab-instances/{id}` | - | Delete an instance | User |

**Entity:**

```
LabInstance {
  instanceId: number (auto)
  containerId: string            // Docker container ID
  containerName: string          // e.g., "gamix-lab1-user5-1708901234567"
  status: string                 // "PENDING", "RUNNING", "STOPPED", "EXITED", "PAUSED"
  accessUrl: string              // e.g., "http://localhost:9101"
  assignedPort: number           // Host port mapped to container
  startedAt: string (datetime)
  stoppedAt: string (datetime)
  completedAt: string (datetime)
  errorMessage: string
  score: number
  user: User
  lab: Lab
}
```

---

### 8. Badges (`/api/badges`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/badges` | `Badge` | Create a new badge | User |
| `GET` | `/api/badges` | - | Get all badges | User |
| `GET` | `/api/badges/{id}` | - | Get badge by ID | User |
| `GET` | `/api/badges/points/{points}` | - | Get badges achievable with given points | User |
| `GET` | `/api/badges/level/{level}` | - | Get badges achievable at given level | User |
| `PUT` | `/api/badges/{id}` | `Badge` | Update a badge | User |
| `DELETE` | `/api/badges/{id}` | - | Delete a badge | User |
| `POST` | `/api/badges/{badgeId}/assign/{userId}` | - | Manually assign a badge to a user | User |
| `DELETE` | `/api/badges/{badgeId}/remove/{userId}` | - | Remove a badge from a user | User |

**Entity:**

```
Badge {
  badgeId: number (auto)
  name: string                   // e.g., "First Blood", "SQL Master", "Level 10"
  description: string
  iconUrl: string                // URL to badge icon image
  requiredPoints: number         // Minimum points to auto-earn this badge
  requiredLevel: number          // Minimum level to auto-earn this badge
}
```

---

### 9. User Progress & Flag Submission (`/api/progress`)

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/progress/submit-flag/{userId}/{stepId}` | `SubmitFlagRequest` | **CORE ENDPOINT** - Submit a flag, validate it, award points/level/rank/badges | User |
| `POST` | `/api/progress/{userId}/{stepId}` | `UserProgress` | Create a progress record manually | User |
| `GET` | `/api/progress/{id}` | - | Get progress by ID | User |
| `GET` | `/api/progress/user/{userId}` | - | Get all progress for a user | User |
| `GET` | `/api/progress/user/{userId}/lab/{labId}` | - | Get user's progress on a specific lab | User |
| `PUT` | `/api/progress/{id}` | `UserProgress` | Update progress | User |
| `DELETE` | `/api/progress/{id}` | - | Delete progress | User |

**Request DTO:**

```
SubmitFlagRequest {
  submittedFlag: string (required)   // The flag the user is submitting (e.g., "FLAG{found_it}")
}
```

**Response (UserProgress):**

```
UserProgress {
  progressId: number (auto)
  completed: boolean             // true if flag was correct
  submittedFlag: string          // What the user submitted
  completedAt: string (datetime) // When it was completed (null if not yet)
  attempts: number               // Total number of attempts
  user: User
  labStep: LabStep
}
```

---

### 10. Leaderboard (`/api/leaderboard`) - ADVANCED FEATURE

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `GET` | `/api/leaderboard` | - | Get full global leaderboard sorted by points (descending) | User |
| `GET` | `/api/leaderboard/top/{n}` | - | Get top N users (e.g., `/top/10` for top 10) | User |
| `GET` | `/api/leaderboard/rank/{rank}` | - | Get leaderboard filtered by rank (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, MASTER) | User |
| `GET` | `/api/leaderboard/user/{userId}` | - | Get a specific user's position, stats, and ranking | User |

**Response DTO:**

```
LeaderboardEntry {
  position: number           // 1st, 2nd, 3rd...
  idUser: number
  nom: string
  prenom: string
  totalPoints: number
  level: number
  rank: string
  completedSteps: number     // Total steps completed
  badgesCount: number        // Total badges earned
}
```

---

### 11. Lab Reviews & Ratings (`/api/reviews`) - ADVANCED FEATURE

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `POST` | `/api/reviews/{userId}/{labId}` | `CreateReviewRequest` | Submit a review (1-5 stars + optional comment). One review per user per lab. | User |
| `GET` | `/api/reviews/lab/{labId}` | - | Get all reviews for a specific lab (newest first) | User |
| `GET` | `/api/reviews/user/{userId}` | - | Get all reviews written by a specific user | User |
| `GET` | `/api/reviews/lab/{labId}/summary` | - | Get average rating and total review count for a lab | User |
| `PUT` | `/api/reviews/{reviewId}` | `CreateReviewRequest` | Update an existing review | User |
| `DELETE` | `/api/reviews/{reviewId}` | - | Delete a review | User |

**Request/Response DTOs:**

```
CreateReviewRequest {
  rating: number (required, 1-5)     // Star rating
  comment: string (optional)         // Review text
}

LabReviewResponse {
  reviewId: number
  userId: number
  userNom: string
  userPrenom: string
  labId: number
  labTitle: string
  rating: number
  comment: string
  createdAt: string (datetime)
  updatedAt: string (datetime)
}

LabRatingSummary {
  labId: number
  labTitle: string
  averageRating: number          // e.g., 4.25
  totalReviews: number
}
```

---

### 12. Statistics Dashboard (`/api/statistics`) - ADVANCED FEATURE

| Method | Endpoint | Body | Description | Auth |
|--------|----------|------|-------------|------|
| `GET` | `/api/statistics/user/{userId}` | - | Get comprehensive statistics for a specific user | User |
| `GET` | `/api/statistics/platform` | - | Get platform-wide statistics | User |

**Response DTOs:**

```
UserStatsResponse {
  idUser: number
  nom: string
  prenom: string
  totalPoints: number
  level: number
  rank: string
  completedSteps: number             // Total steps completed
  totalAttempts: number              // Total flag submission attempts
  completedLabs: number              // Labs where ALL steps are completed
  activeLabs: number                 // Currently running lab instances
  badgesEarned: number
  reviewsWritten: number
  averageRatingGiven: number         // Average of ratings this user gave
  categoryBreakdown: [               // Progress per category
    {
      categoryId: number
      categoryName: string
      totalSteps: number             // Total steps in this category
      completedSteps: number         // Steps completed by the user
      completionPercentage: number   // e.g., 75.50
    }
  ]
}

PlatformStatsResponse {
  totalUsers: number
  totalLabs: number
  totalLabCategories: number
  totalBadges: number
  totalReviews: number
  totalStepsCompleted: number        // Across all users
  totalLabInstances: number          // All-time container launches
  usersByRank: {                     // Distribution
    "BEGINNER": number,
    "INTERMEDIATE": number,
    "ADVANCED": number,
    "EXPERT": number,
    "MASTER": number
  }
  labsByDifficulty: {                // Distribution
    "EASY": number,
    "MEDIUM": number,
    "HARD": number
  }
  platformAveragePoints: number      // Average points across all users
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "timestamp": "2026-02-26T00:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "User not found: 99"
}
```

| Status | When |
|--------|------|
| `400 Bad Request` | Invalid business logic (wrong password, expired token, no Docker template, etc.) |
| `404 Not Found` | Resource doesn't exist (user, lab, step, badge, review, instance) |
| `409 Conflict` | Duplicate resource (email already exists, user already reviewed this lab) |
| `422 Unprocessable Entity` | DTO validation failed (missing required fields, invalid email format, password too short) |

**Validation error format (422):**

```json
{
  "timestamp": "2026-02-26T00:00:00Z",
  "status": 422,
  "error": "Validation Failed",
  "fieldErrors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Typical User Flow (Frontend)

```
1. Register          POST /api/auth/register
2. Login             POST /api/auth/login -> save JWT token
3. Browse Labs       GET /api/labs/active
4. View Lab Details  GET /api/labs/{labId}
5. Check Lab Rating  GET /api/reviews/lab/{labId}/summary
6. Start Lab         POST /api/lab-instances/start/{userId}/{labId} -> get accessUrl
7. Open Lab          User opens accessUrl in browser/iframe (the Docker container)
8. Submit Flag       POST /api/progress/submit-flag/{userId}/{stepId}
9. Check Progress    GET /api/progress/user/{userId}/lab/{labId}
10. View Profile     GET /api/users/me + GET /api/statistics/user/{userId}
11. Check Ranking    GET /api/leaderboard/user/{userId}
12. Stop Lab         POST /api/lab-instances/stop/{instanceId}
13. Leave Review     POST /api/reviews/{userId}/{labId}
14. View Leaderboard GET /api/leaderboard/top/10
```

---

## Frontend Pages Suggested

| Page | Key APIs Used |
|------|--------------|
| **Login / Register** | `POST /auth/login`, `POST /auth/register` |
| **Dashboard (Home)** | `GET /statistics/user/{id}`, `GET /leaderboard/user/{id}`, `GET /labs/active` |
| **Lab Catalog** | `GET /labs`, `GET /labs/category/{id}`, `GET /lab-categories`, `GET /reviews/lab/{id}/summary` |
| **Lab Detail** | `GET /labs/{id}`, `GET /lab-steps/lab/{id}`, `GET /reviews/lab/{id}`, `GET /reviews/lab/{id}/summary` |
| **Lab Workspace** | `POST /lab-instances/start/{userId}/{labId}`, `GET /check-status/{id}`, `POST /progress/submit-flag/{userId}/{stepId}`, `GET /progress/user/{userId}/lab/{labId}` |
| **Profile** | `GET /users/me`, `PUT /users/me`, `PUT /users/me/password`, `GET /statistics/user/{id}` |
| **Leaderboard** | `GET /leaderboard`, `GET /leaderboard/top/10`, `GET /leaderboard/rank/{rank}` |
| **Badges** | `GET /badges`, user's badges from `GET /users/me` (badges array) |
| **Admin - Users** | `GET /users/admin`, `POST /users/admin`, `PUT /users/admin/{id}`, `DELETE /users/admin/{id}` |
| **Admin - Labs** | CRUD on `/labs`, `/lab-steps`, `/lab-categories`, `/docker-templates` |
| **Admin - Platform Stats** | `GET /statistics/platform` |
| **Forgot/Reset Password** | `POST /auth/forgot-password`, `POST /auth/reset-password` |

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.2.3 |
| Language | Java 17 |
| Database | MySQL |
| ORM | Spring Data JPA / Hibernate |
| Auth | JWT (JSON Web Tokens) |
| Containers | Docker Engine API (docker-java) |
| API Docs | SpringDoc OpenAPI 3 (Swagger) |
| Validation | Jakarta Bean Validation |
| Security | Spring Security 6 |
| Build | Maven |
