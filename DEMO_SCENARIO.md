# 🎓 B2B Corporate Training Platform — Complete Demo Scenario

## 📋 Project Overview

**Module:** B2B Corporate — Training Management, Recruitment & Freelance  
**Tech Stack:** Angular 18 (Frontend) + Spring Boot (Backend) + MySQL  
**Architecture:** Microservices — User Module (port 8086) + B2B Module (port 8083)

### What does this module do?

This module allows **companies** to manage their entire corporate training lifecycle:

1. **Company Management** — Create and manage partner companies
2. **Employee Management** — Add employees individually or via bulk CSV import (auto-creates user accounts)
3. **Training Packs & Assignments** — Buy training credit packs and assign courses to employees
4. **Progress Tracking** — Monitor employee training progress with real-time dashboards
5. **Recruitment** — Post job offers, receive applications from candidates
6. **Freelance** — Publish missions for freelancers and manage contracts

### Roles & Permissions

| Role | Access Level |
|------|-------------|
| **ADMIN** | Full access — manages all companies, users, and platform settings |
| **RH_ENTREPRISE** (HR Manager) | Manages their own company: employees, assignments, recruitment, packs |
| **MANAGER** | Views their team, tracks progress, manages assignments for their team |
| **APPRENANT** (Learner) | Views their assigned trainings and personal progress |

---

## 🚀 How to Start the Platform

### Step 1 — Start the Backends

```bash
# Terminal 1: User Module (port 8086)
cd C:\...\PlatformeBack\PlatformeBack
mvn spring-boot:run

# Terminal 2: B2B Module (port 8083)
cd C:\...\B2BModule
mvn spring-boot:run
```

### Step 2 — Start the Frontend

```bash
cd C:\...\Platforme
npm start
# Opens on http://localhost:4200
```

### Step 3 — Verify Everything is Running

- Frontend: http://localhost:4200
- User API: http://localhost:8086/api/users/admin (should return JSON)
- B2B API: http://localhost:8083/api/b2b/companies (should return JSON)

---

## 🎬 DEMO SCENARIO — Step by Step

### SCENE 1: Admin Creates a Company + HR Account

**Login as:** ADMIN  
**URL:** http://localhost:4200/login

1. Navigate to **Corporate** → `/corporate`
2. Go to **Companies** from the sidebar
3. Click **"+ New company"**
4. Fill the **3-step form**:
   - **Step 1 — Company Info:** Name, sector, address, phone, size, website
   - **Step 2 — HR Account:** First name, last name, email, password (auto-creates an RH_ENTREPRISE user)
   - **Step 3 — Confirmation:** Review summary → Click **"Create company"**
5. ✅ Company created with its HR Manager account automatically

**What happens behind the scenes:**
- A `Company` record is created in the B2B database
- A `User` with role `RH_ENTREPRISE` is created in the User database with the company's `companyId`

---

### SCENE 2: HR Manager Logs In and Sets Up Employees

**Login as:** The RH account just created  
**URL:** http://localhost:4200/login

1. After login → redirected to `/corporate/dashboard`
2. Dashboard shows **6 KPIs**: Employees, Active Trainings, Credits, Completion Rate, Job Offers, Applications
3. Go to **Employees** in the sidebar

#### Option A — Add Employee Manually
1. Click **"+ Add employee"**
2. Select a user from the **dropdown** (searches existing user accounts)
3. Fill: Department, Position, Hire date, Manager (dropdown)
4. Click **"Create"** → ✅ Employee linked to the company

#### Option B — Bulk Import via CSV
1. Click **"Excel Import"** in the sidebar
2. Download the **CSV template** (click the button)
3. Fill the CSV with employee data:
   ```
   nom,prenom,email,password,role,department,position
   Dupont,Jean,jean@company.com,Pass123!,APPRENANT,Engineering,Developer
   Martin,Claire,claire@company.com,Pass123!,MANAGER,HR,HR Lead
   ```
4. Drag & drop the CSV file
5. Preview the data → Click **"Start import"**
6. ✅ For each row: User account is **auto-created** + Employee record is created
7. Progress bar shows step-by-step: Account creation → Employee creation → Done

---

### SCENE 3: HR Buys Training Packs

1. Go to **Packs** in the sidebar
2. View available training packs with prices and included courses
3. Click **"Buy"** on a pack → Credits added to the company
4. Credits are now available for assigning trainings

---

### SCENE 4: HR Assigns Training to Employees

1. Go to **Assignments** in the sidebar
2. Click **"+ New assignment"**
3. Select: Company → Employee → Training pack → Training name → Deadline
4. Click **"Assign"** → ✅ Training assigned to the employee
5. Back on the list: see all assignments with status (Not started / In progress / Completed)

---

### SCENE 5: HR Tracks Employee Progress

1. Go to **Progress** in the sidebar
2. See **global stats**: Total assignments, Completed, In progress, Average progress
3. Filter by status or search by employee name
4. Sort by progress percentage or deadline
5. **Color-coded alerts:**
   - 🔴 Red = Overdue (past deadline)
   - 🟠 Orange = Deadline approaching (< 7 days)
   - 🟢 Green = On track

---

### SCENE 6: HR Posts a Job Offer

1. Go to **Job Offers** in the sidebar
2. Click **"+ Publish an offer"**
3. Fill: Job title, contract type (Permanent/Fixed-term/Internship), location, description, required skills
4. Click **"Publish"** → ✅ Job offer is live

#### Public View (no login required):
5. Open http://localhost:4200/careers
6. See all published job offers → Search & filter
7. Click on an offer → See full details
8. Click **"Apply"** → Fill form (name, email, CV, cover letter) → Submit

#### HR Reviews Applications:
9. Go to **Candidates** in the sidebar
10. See all applications with status, skills, experience

---

### SCENE 7: HR Creates a Freelance Mission

1. Go to **Missions** in the sidebar
2. Click **"+ New mission"**
3. Fill: Title, description, budget, duration, required skills
4. Click **"Create mission"** → ✅ Mission published

#### Public View:
5. Open http://localhost:4200/freelance
6. Browse all missions → Click one → Apply

#### HR Manages Contracts:
7. Go to **Contracts** in the sidebar
8. See all contracts: Draft → Pending → Signed → Active → Completed
9. Sign or terminate contracts directly from the interface

---

### SCENE 8: HR Manages User Accounts

1. Go to **Accounts** in the sidebar
2. See all company accounts (HR, Manager, Learner)
3. **Create new accounts** directly from the interface
4. Edit roles, activate/deactivate accounts

---

### SCENE 9: Manager Views Their Team

**Login as:** A user with MANAGER role  

1. Dashboard shows **4 KPIs**: My team, Trainings, Completed, In progress
2. See **team member table** with progress bars
3. **Alert section**: Shows employees who are behind on their training
4. Go to **Assignments** → View/manage assignments for their team
5. Go to **Progress** → Track team members' progression

---

### SCENE 10: Learner Views Their Trainings

**Login as:** A user with APPRENANT role  

1. Dashboard shows **3 KPIs**: Assigned trainings, Completed, In progress
2. See **"My Trainings"** table with progress bars
3. If no trainings assigned → Shows "No training assigned" message

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│              Angular 18 (Port 4200)              │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Main Layout  │  │   B2B Corporate Layout   │  │
│  │  (Public +    │  │   (Back Office)           │  │
│  │   User pages) │  │   - Sidebar (role-based)  │  │
│  │              │  │   - Header (greeting)      │  │
│  │  /home       │  │   /corporate/dashboard     │  │
│  │  /catalog    │  │   /corporate/employees     │  │
│  │  /careers    │  │   /corporate/companies     │  │
│  │  /freelance  │  │   /corporate/assignments   │  │
│  └──────────────┘  │   /corporate/jobs          │  │
│                    │   /corporate/missions       │  │
│                    │   /corporate/contracts      │  │
│                    │   /corporate/packs          │  │
│                    │   /corporate/progress       │  │
│                    │   /corporate/accounts       │  │
│                    │   /corporate/candidates     │  │
│                    └──────────────────────────┘  │
└────────────┬──────────────────┬──────────────────┘
             │ /api             │ /b2b-api
             ▼                  ▼
┌────────────────────┐  ┌────────────────────────┐
│  USER MODULE       │  │  B2B MODULE            │
│  Spring Boot       │  │  Spring Boot           │
│  Port 8086         │  │  Port 8083             │
│                    │  │                        │
│  - Authentication  │  │  - Companies           │
│  - JWT Tokens      │  │  - Employees           │
│  - User CRUD       │  │  - Assignments         │
│  - Role Management │  │  - Job Offers          │
│  - Company Scoping │  │  - Applications        │
│                    │  │  - Missions            │
│                    │  │  - Contracts           │
│                    │  │  - Training Packs      │
└────────┬───────────┘  └───────────┬────────────┘
         │                          │
         ▼                          ▼
┌──────────────────────────────────────────────┐
│              MySQL Database                   │
│              "platforme"                      │
│              Port 3306                        │
│                                              │
│  Users Table ──┐    Companies Table           │
│  (idUser,      │    Employees Table           │
│   email,       │    Assignments Table         │
│   role,        │    JobOffers Table            │
│   companyId)   │    Applications Table         │
│                │    Missions Table             │
│                │    Contracts Table            │
│                │    TrainingPacks Table         │
└──────────────────────────────────────────────┘
```

---

## 🔐 Security Model

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT (HS256) — stored in localStorage |
| Route Guards | `AuthGuard` (logged in?) + `RoleGuard` (correct role?) |
| API Security | `@PreAuthorize` annotations on Spring Boot controllers |
| Data Isolation | Company-scoped queries — `companyId` filtering on all requests |
| CORS | Configured for `localhost:4200` |

### Data Isolation Example:
When an HR Manager logs in with `companyId = 5`:
- They can ONLY see employees from company 5
- They can ONLY manage assignments for company 5
- They can ONLY see job offers from company 5
- The Admin can see ALL companies

---

## 📊 Module Statistics

| Metric | Count |
|--------|-------|
| Total Angular components | **25+** |
| Back-office pages | **17** |
| Front-office pages | **5** |
| API services | **3** (B2B, Auth, AdminUsers) |
| Supported roles | **4** (Admin, HR, Manager, Learner) |
| Navigation items | **12** (role-filtered) |
| CRUD operations | Companies, Employees, Assignments, Jobs, Missions, Contracts, Packs, Accounts |

---

## 🌟 Key Features to Highlight

1. **Auto-account creation** — Creating a company auto-creates the HR account
2. **Bulk CSV import** — Import employees via CSV, user accounts are auto-created
3. **Role-based dashboards** — Each role sees different KPIs and navigation
4. **Data isolation** — Each company can only see their own data
5. **Progress tracking** — Real-time progress bars with color-coded deadline alerts
6. **Public pages** — Job offers and freelance missions are visible without login
7. **3-step company creation** — Guided stepper form with validation
8. **Dark/Light mode** — Theme toggle in the header
9. **Responsive design** — Works on desktop and mobile
10. **Full English UI** — Entire platform internationalized in English

---

## 🧪 Test Accounts (to create for the demo)

| Role | Email | Password | Company |
|------|-------|----------|---------|
| Admin | admin@platform.com | Admin123! | — (sees all) |
| HR Manager | hr@santéplus.com | Hr123456! | SantéPlus |
| Manager | manager@santéplus.com | Manager123! | SantéPlus |
| Learner | learner@santéplus.com | Learner123! | SantéPlus |

---

## 📝 Summary for Professor

> **This B2B Corporate module** is a complete enterprise training management platform. It allows companies to register on the platform, manage their employees, purchase training packs, assign trainings to employees, track their progress, post job offers to recruit new talent, and manage freelance missions with contracts.
>
> The architecture uses **Angular 18** for the frontend with **standalone components**, **lazy loading**, and **role-based routing**. The backend consists of **two Spring Boot microservices** communicating through REST APIs, with **JWT authentication** and **company-scoped data isolation**.
>
> The module implements a **complete role hierarchy**: Admin → HR Manager → Manager → Learner, where each role has specific permissions and sees a personalized dashboard. The platform supports both **manual and bulk operations** (CSV import with auto-account creation), and includes **public-facing pages** for job seekers and freelancers.
