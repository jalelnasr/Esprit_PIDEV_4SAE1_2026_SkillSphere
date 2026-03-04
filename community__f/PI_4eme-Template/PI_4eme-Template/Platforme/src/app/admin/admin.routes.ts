import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminUsersComponent } from './admin-users.component';
import { AdminCommunityComponent } from './community/admin-community.component';
import { AdminPostsComponent } from './community/admin-posts.component';
import { AdminQuestionsComponent } from './community/admin-questions.component';
import { AdminGroupsComponent } from './community/admin-groups.component';
import { AdminFollowsComponent } from './community/admin-follows.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'community', component: AdminCommunityComponent },
      { path: 'community/posts', component: AdminPostsComponent },
      { path: 'community/questions', component: AdminQuestionsComponent },
      { path: 'community/groups', component: AdminGroupsComponent },
      { path: 'community/follows', component: AdminFollowsComponent },
      // Placeholder routes for other admin modules
      { path: 'courses', component: AdminDashboardComponent },
      { path: 'analytics', component: AdminDashboardComponent },
      { path: 'corporate', component: AdminDashboardComponent },
      { path: 'certifications', component: AdminDashboardComponent },
      { path: 'settings', component: AdminDashboardComponent }
    ]
  }
];
