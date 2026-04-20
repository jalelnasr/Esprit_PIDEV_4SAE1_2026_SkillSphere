import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';

export const USER_ROUTES: Routes = [
  { path: 'profile', component: ProfileComponent },
  { path: 'change-password', component: ChangePasswordComponent },

  // optional: /user redirects to /user/profile
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];