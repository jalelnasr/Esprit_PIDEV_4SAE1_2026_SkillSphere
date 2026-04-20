import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormationService, AuthService } from '@core/services';
import { BackendUser } from '../../core/models/auth.model';
import { QuoteCardComponent } from '@shared/components/quote-card/quote-card.component';

interface DashboardStat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, QuoteCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  get currentUser$() {
    return this.authService.currentUser$;
  }

  userRole: string | null = null;
  isFormateur = false;
  stats: DashboardStat[] = [];

  // Apprenant stats
  apprenantStats: DashboardStat[] = [
    { label: 'Courses Enrolled', value: 5, icon: '📚', color: '#667eea' },
    { label: 'In Progress', value: 3, icon: '🚀', color: '#764ba2' },
    { label: 'Completed', value: 8, icon: '✅', color: '#2ecc71' },
    { label: 'Total XP', value: 2450, icon: '⭐', color: '#f39c12' }
  ];

  // Formateur stats
  formateurStats: DashboardStat[] = [
    { label: 'My Formations', value: 0, icon: '📚', color: '#667eea' },
    { label: 'Total Students', value: 0, icon: '👥', color: '#764ba2' },
    { label: 'Active Sessions', value: 0, icon: '🎓', color: '#2ecc71' },
    { label: 'Total Revenue', value: 0, icon: '💰', color: '#f39c12' }
  ];

  recentCourses: any[] = [];

  myFormations: any[] = [];

  recommendations = [
    { title: 'React Advanced Patterns', category: 'Web Dev', level: 'Advanced' },
    { title: 'Machine Learning Basics', category: 'AI/ML', level: 'Beginner' },
    { title: 'Cloud Computing with AWS', category: 'Cloud', level: 'Intermediate' }
  ];

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Restore session and get user info
    this.authService.restoreSession().subscribe({
      next: (user: BackendUser | null) => {
        if (user) {
          console.log('SESSION USER:', user);
          this.loadDashboardData();
        }
      },
      error: (err: unknown) => console.error('SESSION ERROR:', err)
    });

    // Subscribe to role changes
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
      this.isFormateur = role === 'FORMATEUR' || role === 'ADMIN';
      this.updateStats();
    });
  }

  updateStats(): void {
    if (this.isFormateur) {
      this.stats = [...this.formateurStats];
    } else {
      this.stats = [...this.apprenantStats];
    }
  }

  loadDashboardData(): void {
    if (this.isFormateur) {
      this.loadFormateurData();
    } else {
      this.loadApprenantData();
    }
  }

  loadFormateurData(): void {
    // Get current user to fetch their ID
    this.authService.currentUser$.subscribe(user => {
      if (user && user.idUser) {
        console.log('🎓 Loading statistics for instructor:', user.idUser);
        
        // Load instructor statistics only (no formations list)
        this.formationService.getInstructorStatistics(user.idUser).subscribe({
          next: (stats: any) => {
            this.formateurStats[0].value = stats.totalFormations;
            this.formateurStats[1].value = stats.totalStudents;
            this.formateurStats[2].value = stats.totalSessions;
            this.updateStats();
            console.log('✅ Instructor statistics loaded:', stats);
          },
          error: (err: any) => {
            console.error('Error loading instructor stats:', err);
            // Keep default values if stats fail to load
            this.updateStats();
          }
        });
      }
    });
  }

  loadApprenantData(): void {
    // Load all available courses for apprenant
    this.formationService.getCourses().subscribe({
      next: (courses: any) => {
        // Filter only PUBLISHED courses for apprenants
        const publishedCourses = courses.filter((c: any) => c.status === 'PUBLISHED');
        this.recentCourses = publishedCourses.slice(0, 12); // Show first 12 published courses
        console.log('Loaded published courses for apprenant:', this.recentCourses);
      },
      error: (error: any) => console.error('Error loading courses:', error)
    });
  }

  goBack(): void {
    this.location.back();
  }
}