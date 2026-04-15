import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { RoleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminRedirectGuard } from './core/guards/admin-redirect.guard';
import {EvaluationListComponent} from '@features/formateur/evaluation-list/evaluation-list.component';
import {EvaluationCreateComponent} from '@features/formateur/evaluation-create/evaluation-create.component';
import {EvaluationManageComponent} from '@features/formateur/evaluation-manage/evaluation-manage.component';
import {QuizComponent} from '@features/formateur/quiz/quiz.component';
import {QuizPlayComponent} from '@features/formateur/quiz-play/quiz-play.component';
import {EvaluationQuizDetailComponent} from '@features/formateur/evaluation-quiz-detail/evaluation-quiz-detail.component';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },

  {
  path: 'auth',
  children: [
    { path: 'login', loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent) },
    { path: 'forgot-password', loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },

    // ✅ NEW
    { path: 'reset-password', loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) }
  ]
},

  // ✅ ADMIN area (role must match backend: 'ADMIN')
  {
    path: 'admin',
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // ✅ dashboard: logged users only, BUT redirect ADMIN to /admin/dashboard
      {
        path: 'dashboard',
        canActivate: [authGuard, AdminRedirectGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

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

      {
        path: 'events',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT', 'FORMATEUR', 'RH_ENTREPRISE'] },
        loadChildren: () => import('./features/events/events.module').then(m => m.EventsModule)
      },

      {
        path: 'user',
        canActivate: [authGuard],
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
      },
      {
        path: 'formateur/evaluations/create',
        component: EvaluationCreateComponent
      },
      {
        path: 'formateur/evaluations/quizzes',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['FORMATEUR'] },
        component: EvaluationQuizDetailComponent
      },
      {
        path: 'apprenant/evaluations/quizzes',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT'] },
        component: EvaluationQuizDetailComponent
      },
      {
        path: 'formateur/evaluations',
        component: EvaluationListComponent,
        pathMatch: 'full'
      },
      {
        path: 'formateur/evaluations/:id/quiz',
        component: QuizComponent
      },
      {
        path: 'formateur/evaluations/:id/quiz-play/:quizId',
        component: QuizPlayComponent
      },
      {
        path: 'formateur/evaluations/:id/manage',
        component: EvaluationManageComponent
      },
      {
        path: 'apprenant/evaluations/:id/quiz-play/:quizId',
        canActivate: [authGuard, RoleGuard],
        data: { roles: ['APPRENANT'] },
        component: QuizPlayComponent
      }
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
