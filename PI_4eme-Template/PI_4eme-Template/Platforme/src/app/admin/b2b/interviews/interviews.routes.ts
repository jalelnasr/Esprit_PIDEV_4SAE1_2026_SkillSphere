import { Routes } from '@angular/router';
import { InterviewListComponent } from './interview-list.component';
import { InterviewCalendarComponent } from './interview-calendar.component';

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: InterviewListComponent,
        data: { title: 'Liste des Entretiens' }
      },
      {
        path: 'calendar',
        component: InterviewCalendarComponent,
        data: { title: 'Calendrier des Entretiens' }
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      }
    ]
  }
];
