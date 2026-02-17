import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'browse', pathMatch: 'full' },
  { path: 'browse', loadComponent: () => import('./pages/events-browse/events-browse.component').then(m => m.EventsBrowseComponent) },
  { path: 'my-events', loadComponent: () => import('./pages/my-events/my-events.component').then(m => m.MyEventsComponent) }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EventsModule { }
