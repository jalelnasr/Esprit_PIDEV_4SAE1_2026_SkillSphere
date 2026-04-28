import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminUsersComponent } from './admin-users.component';

export const ADMIN_ROUTES: Routes = [
  // B2B Corporate — uses its own B2B layout (sidebar + header), NOT nested in AdminLayout
  { path: 'corporate', loadChildren: () => import('./b2b/b2b.routes').then(m => m.B2B_ROUTES) },

  // Everything else wrapped in AdminLayout
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      // Placeholder routes for other admin modules
      { path: 'courses', component: AdminDashboardComponent },
      { path: 'analytics', component: AdminDashboardComponent },
      { path: 'certifications', component: AdminDashboardComponent },
      { path: 'settings', component: AdminDashboardComponent }
    ]
  }
];
