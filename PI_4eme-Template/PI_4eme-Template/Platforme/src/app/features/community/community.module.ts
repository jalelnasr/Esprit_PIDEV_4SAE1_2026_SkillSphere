import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  { path: 'feed', loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent) },
  { path: 'qa', loadComponent: () => import('./pages/qa/qa.component').then(m => m.QaComponent) }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CommunityModule { }
