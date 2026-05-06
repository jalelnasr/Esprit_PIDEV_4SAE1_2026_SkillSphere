import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CertificationRedirectComponent } from './pages/certification-redirect/certification-redirect.component';

const routes: Routes = [
  { path: '', component: CertificationRedirectComponent },
  { path: 'exams', loadComponent: () => import('./pages/exam-list/exam-list.component').then(m => m.ExamListComponent) },
  { path: 'certificates', loadComponent: () => import('./pages/certificate-list/certificate-list.component').then(m => m.CertificateListComponent) },
  { path: 'requests', loadComponent: () => import('./pages/certificate-requests/certificate-requests.component').then(m => m.CertificateRequestsComponent) }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CertificationModule { }
