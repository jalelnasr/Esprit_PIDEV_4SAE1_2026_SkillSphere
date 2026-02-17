import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      {
        path: 'learning',
        canActivate: [RoleGuard],
        data: { roles: ['learner', 'instructor'] },
        loadChildren: () => import('./features/learning/learning.module').then(m => m.LearningModule)
      },
      {
        path: 'certification',
        canActivate: [RoleGuard],
        data: { roles: ['learner', 'instructor'] },
        loadChildren: () => import('./features/certification/certification.module').then(m => m.CertificationModule)
      },
      {
        path: 'corporate',
        canActivate: [RoleGuard],
        data: { roles: ['enterprise'] },
        loadChildren: () => import('./features/corporate/corporate.module').then(m => m.CorporateModule)
      },
      {
        path: 'gamification',
        canActivate: [RoleGuard],
        data: { roles: ['learner', 'instructor'] },
        loadChildren: () => import('./features/gamification/gamification.module').then(m => m.GamificationModule)
      },
      {
        path: 'community',
        canActivate: [RoleGuard],
        data: { roles: ['learner', 'instructor', 'enterprise'] },
        loadChildren: () => import('./features/community/community.module').then(m => m.CommunityModule)
      },
      {
        path: 'events',
        canActivate: [RoleGuard],
        data: { roles: ['learner', 'instructor', 'enterprise'] },
        loadChildren: () => import('./features/events/events.module').then(m => m.EventsModule)
      },
      {
        path: 'user',
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
      },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
