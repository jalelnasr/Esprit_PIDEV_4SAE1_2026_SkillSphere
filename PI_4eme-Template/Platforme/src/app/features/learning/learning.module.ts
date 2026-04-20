import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

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
        path: 'learning/:courseId', 
        loadComponent: () => import('./pages/learning-player/learning-player.component').then(m => m.LearningPlayerComponent)
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
