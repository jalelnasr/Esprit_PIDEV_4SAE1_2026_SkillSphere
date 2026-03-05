import { Routes } from '@angular/router';
import { b2bRoleGuard } from './guards/b2b-role.guard';
import { INTERVIEWS_ROUTES } from './interviews/interviews.routes';

export const B2B_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./b2b-layout/b2b-layout.component').then(m => m.B2bLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.B2bDashboardComponent) },

      // Interviews (Admin + RH)
      { path: 'interviews', children: INTERVIEWS_ROUTES },

      // Companies (Admin only)
      { path: 'companies', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN'] }, loadComponent: () => import('./companies/company-list/company-list.component').then(m => m.CompanyListComponent) },
      { path: 'companies/new', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN'] }, loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent) },
      { path: 'companies/:id/edit', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN'] }, loadComponent: () => import('./companies/company-form/company-form.component').then(m => m.CompanyFormComponent) },

      // Employees (Admin + RH + Manager)
      { path: 'employees', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE','MANAGER'] }, loadComponent: () => import('./employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent) },
      { path: 'employees/new', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent) },
      { path: 'employees/import', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./employees/employee-import/employee-import.component').then(m => m.EmployeeImportComponent) },
      { path: 'employees/:id', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE','MANAGER'] }, loadComponent: () => import('./employees/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent) },
      { path: 'employees/:id/edit', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent) },

      // Packs (Admin + RH)
      { path: 'packs', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./packs/pack-list/pack-list.component').then(m => m.PackListComponent) },

      // Assignments (Admin + RH + Manager + Apprenant)
      { path: 'assignments', loadComponent: () => import('./assignments/assignment-list/assignment-list.component').then(m => m.AssignmentListComponent) },
      { path: 'assignments/new', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE','MANAGER'] }, loadComponent: () => import('./assignments/assignment-form/assignment-form.component').then(m => m.AssignmentFormComponent) },

      // Progress (all roles)
      { path: 'progress', loadComponent: () => import('./progress/progress-tracking/progress-tracking.component').then(m => m.ProgressTrackingComponent) },

      // My Training (Employee only)
      { path: 'my-training', canActivate: [b2bRoleGuard], data: { allowedRoles: ['APPRENANT'] }, loadComponent: () => import('./my-training/my-training.component').then(m => m.MyTrainingComponent) },

      // Course Player (Employee)
      { path: 'course-player/:assignmentId', canActivate: [b2bRoleGuard], data: { allowedRoles: ['APPRENANT'] }, loadComponent: () => import('./course-player/course-player.component').then(m => m.CoursePlayerComponent) },

      // Job Offers (Admin + RH)
      { path: 'jobs', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./jobs/job-offer-list/job-offer-list.component').then(m => m.JobOfferListComponent) },
      { path: 'jobs/new', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./jobs/job-offer-form/job-offer-form.component').then(m => m.JobOfferFormComponent) },
      { path: 'jobs/:id', loadComponent: () => import('./jobs/job-offer-form/job-offer-form.component').then(m => m.JobOfferFormComponent) },
      { path: 'jobs/:id/edit', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./jobs/job-offer-form/job-offer-form.component').then(m => m.JobOfferFormComponent) },

      // Candidates (Admin + RH)
      { path: 'candidates', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./candidates/candidate-list/candidate-list.component').then(m => m.CandidateListComponent) },

      // Missions (Admin + RH + Formateur)
      { path: 'missions', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE','FORMATEUR'] }, loadComponent: () => import('./missions/mission-list/mission-list.component').then(m => m.MissionListComponent) },
      { path: 'missions/new', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./missions/mission-form/mission-form.component').then(m => m.MissionFormComponent) },

      // Contracts (Admin + RH + Formateur)
      { path: 'contracts', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE','FORMATEUR'] }, loadComponent: () => import('./contracts/contract-list/contract-list.component').then(m => m.ContractListComponent) },

      // Account Management (RH only)
      { path: 'accounts', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./accounts/account-management.component').then(m => m.AccountManagementComponent) },

      // Analytics (Admin + RH + Manager)
      { path: 'analytics', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE','MANAGER'] }, loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent) },

      // Activity Log (Admin + RH)
      { path: 'activity-log', canActivate: [b2bRoleGuard], data: { allowedRoles: ['ADMIN','RH_ENTREPRISE'] }, loadComponent: () => import('./activity-log/activity-log.component').then(m => m.ActivityLogComponent) }
    ]
  }
];
