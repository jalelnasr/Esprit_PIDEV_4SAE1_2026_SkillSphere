import { Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';

export const COMPETITION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/competition-list/competition-list.component').then(m => m.CompetitionListComponent)
  },
  {
    path: 'my-participations',
    loadComponent: () => import('./pages/competition-list/competition-list.component').then(m => m.CompetitionListComponent)
  },
  {
    path: 'manage',
    canActivate: [RoleGuard],
    data: { roles: ['FORMATEUR'] },
    loadComponent: () => import('./pages/competition-list/competition-list.component').then(m => m.CompetitionListComponent)
  },
  {
    path: 'create',
    canActivate: [RoleGuard],
    data: { roles: ['FORMATEUR'] },
    loadComponent: () => import('./pages/competition-create/competition-create.component').then(m => m.CompetitionCreateComponent)
  },
  {
    path: 'sms',
    canActivate: [RoleGuard],
    data: { roles: ['FORMATEUR'] },
    loadComponent: () => import('./pages/sms-management/sms-management.component').then(m => m.SmsManagementComponent)
  },
  // ✅ IMPORTANT: Route 'map' AVANT ':id' pour éviter confusion
  {
    path: 'map',
    loadComponent: () => import('./pages/competition-map/competition-map.component').then(m => m.CompetitionMapComponent)
  },
  {
    path: 'diagnostic/:id',
    loadComponent: () => import('../../diagnostic-detail.component').then(m => m.DiagnosticDetailComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/competition-detail/competition-detail.component').then(m => m.CompetitionDetailComponent)
  },
  {
    path: ':id/manage',
    canActivate: [RoleGuard],
    data: { roles: ['FORMATEUR'] },
    loadComponent: () => import('./pages/competition-manage/competition-manage.component').then(m => m.CompetitionManageComponent)
  },
  {
    path: ':id/leaderboard',
    loadComponent: () => import('./pages/competition-leaderboard/competition-leaderboard.component').then(m => m.CompetitionLeaderboardComponent)
  }
];
