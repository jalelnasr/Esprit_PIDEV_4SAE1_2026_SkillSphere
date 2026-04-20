import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormationService, InstructorStatistics } from '../../../../core/services/formation.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.css']
})
export class InstructorDashboardComponent implements OnInit {
  loading = true;
  
  // Statistics
  statistics: InstructorStatistics | null = null;
  totalFormations = 0;
  totalSessions = 0;
  totalStudents = 0;
  averageCompletionRate = 0;
  enrollmentTrends: any[] = [];
  topFormations: any[] = [];
  recentActivity: any[] = [];

  constructor(
    private router: Router,
    private formationService: FormationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStatistics();
  }

  loadDashboardStatistics(): void {
    this.loading = true;
    
    this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser) {
        this.loading = false;
        return;
      }

      this.formationService.getInstructorStatistics(currentUser.idUser).subscribe({
        next: (stats: InstructorStatistics) => {
          this.statistics = stats;
          this.totalFormations = stats.totalFormations;
          this.totalSessions = stats.totalSessions;
          this.totalStudents = stats.totalStudents;
          this.averageCompletionRate = stats.averageCompletionRate;
          this.enrollmentTrends = stats.enrollmentTrends || [];
          this.topFormations = stats.topFormations || [];
          this.recentActivity = stats.recentActivities || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard statistics:', error);
          // Show empty state on error
          this.totalFormations = 0;
          this.totalSessions = 0;
          this.totalStudents = 0;
          this.averageCompletionRate = 0;
          this.enrollmentTrends = [];
          this.topFormations = [];
          this.recentActivity = [];
          this.loading = false;
        }
      });
    });
  }

  navigateToFormations(): void {
    this.router.navigate(['/learning/instructor/formations']);
  }

  navigateToSessions(): void {
    this.router.navigate(['/learning/instructor/sessions']);
  }

  navigateToStudents(): void {
    this.router.navigate(['/learning/instructor/students']);
  }
}
