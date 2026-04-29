import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { RoleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminRedirectGuard } from './core/guards/admin-redirect.guard';

export const routes: Routes = [
  // ROOT: redirect localhost:4200/ -> /home
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // Public pages
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'pricing', loadComponent: () => import('./features/pricing/pricing.component').then(m => m.PricingComponent) },
  { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'payment/verify-otp', loadComponent: () => import('./features/payment-verify-otp/payment-verify-otp.component').then(m => m.PaymentVerifyOtpComponent) },

  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) }
    ]
  },

  // ADMIN area
  {
    path: 'admin',
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // B2B Corporate Front Office (for company roles: RH, Manager, Employee, Freelance + ADMIN)
  {
    path: 'b2b',
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN', 'RH_ENTREPRISE', 'MANAGER', 'APPRENANT', 'FORMATEUR'] },
    loadChildren: () => import('./admin/b2b/b2b.routes').then(m => m.B2B_ROUTES)
  },

  // Main layout (authenticated / app area)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        canActivate: [authGuard, AdminRedirectGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Formation features (ami)
      {
        path: 'learning',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT', 'FORMATEUR'] },
        loadChildren: () => import('./features/learning/learning.module').then(m => m.LearningModule)
      },
      {
        path: 'certification',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT', 'FORMATEUR'] },
        loadChildren: () => import('./features/certification/certification.module').then(m => m.CertificationModule)
      },
      {
        path: 'corporate',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['RH_ENTREPRISE'] },
        loadChildren: () => import('./features/corporate/corporate.module').then(m => m.CorporateModule)
      },
      {
        path: 'gamification',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT', 'FORMATEUR'] },
        loadChildren: () => import('./features/gamification/gamification.module').then(m => m.GamificationModule)
      },
      {
        path: 'community',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT', 'FORMATEUR', 'RH_ENTREPRISE'] },
        loadChildren: () => import('./features/community/community.module').then(m => m.CommunityModule)
      },

      // Competitions features (Jalel) - events redirects to competitions
      {
        path: 'events',
        redirectTo: 'competitions',
        pathMatch: 'full'
      },
      {
        path: 'competitions',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT', 'FORMATEUR'] },
        loadChildren: () => import('./features/competitions/competitions.routes').then(m => m.COMPETITION_ROUTES)
      },

      // User profile
      {
        path: 'user',
        canActivate: [authGuard],
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
      },

      // B2B Front Office pages (accessible to all authenticated users)
      {
        path: 'corporate-home',
        loadComponent: () => import('./features/corporate/pages/corporate-home/corporate-home.component').then(m => m.CorporateHomeComponent)
      },
      {
        path: 'my-company',
        canActivate: [authGuard],
        loadComponent: () => import('./features/corporate/pages/my-company/my-company.component').then(m => m.MyCompanyComponent)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./features/corporate/pages/catalog/catalog.component').then(m => m.CatalogComponent)
      },
      {
        path: 'careers',
        loadComponent: () => import('./features/corporate/pages/careers/careers.component').then(m => m.CareersComponent)
      },
      {
        path: 'careers/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./features/corporate/pages/careers/career-detail.component').then(m => m.CareerDetailComponent)
      },
      {
        path: 'freelance',
        loadComponent: () => import('./features/corporate/pages/freelance/freelance.component').then(m => m.FreelanceComponent)
      },
      {
        path: 'freelance/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./features/corporate/pages/freelance/freelance-detail.component').then(m => m.FreelanceDetailComponent)
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'home' }
];
