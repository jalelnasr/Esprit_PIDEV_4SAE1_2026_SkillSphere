import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormateurGuard } from '../../core/guards/formateur.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      { 
        path: 'browse', 
        loadComponent: () => import('./pages/course-catalog/course-catalog.component').then(m => m.CourseCatalogComponent)
      },
      { 
        path: 'course/:id', 
        loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
      },
      { 
        path: 'my-courses', 
        loadComponent: () => import('./pages/my-courses/my-courses.component').then(m => m.MyCoursesComponent)
      },
      { 
        path: 'progress', 
        loadComponent: () => import('./pages/student-progress/student-progress.component').then(m => m.StudentProgressComponent)
      },
      { 
        path: 'paths', 
        loadComponent: () => import('./pages/learning-paths/learning-paths.component').then(m => m.LearningPathsComponent)
      },
      { 
        path: 'learning/:courseId', 
        loadComponent: () => import('./pages/learning-player/learning-player.component').then(m => m.LearningPlayerComponent)
      },
      { 
        path: 'courses/:id', 
        loadComponent: () => import('./pages/course-player/course-player.component').then(m => m.CoursePlayerComponent)
      },
      // Instructor routes (FORMATEUR/ADMIN only)
      {
        path: 'instructor/dashboard',
        loadComponent: () => import('./pages/instructor/instructor-dashboard.component').then(m => m.InstructorDashboardComponent),
        canActivate: [FormateurGuard]
      },
      {
        path: 'instructor/formations',
        loadComponent: () => import('./pages/instructor/instructor-formations.component').then(m => m.InstructorFormationsComponent),
        canActivate: [FormateurGuard]
      },
      {
        path: 'instructor/content/:id',
        loadComponent: () => import('./pages/instructor/content-management.component').then(m => m.ContentManagementComponent),
        canActivate: [FormateurGuard]
      },
      {
        path: 'instructor/sessions',
        loadComponent: () => import('./pages/instructor/instructor-sessions.component').then(m => m.InstructorSessionsComponent),
        canActivate: [FormateurGuard]
      },
      {
        path: 'instructor/students',
        loadComponent: () => import('./pages/instructor/instructor-students.component').then(m => m.InstructorStudentsComponent),
        canActivate: [FormateurGuard]
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'meet-room',
        loadComponent: () => import('./pages/meet-room/meet-room.component').then(m => m.MeetRoomComponent)
      },
      {
        path: '',
        redirectTo: 'browse',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LearningModule { }
