import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormationService, StudentProgress } from '../../../../core/services/formation.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-instructor-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructor-students.component.html',
  styleUrls: ['./instructor-students.component.css']
})
export class InstructorStudentsComponent implements OnInit {
  students: StudentProgress[] = [];
  filteredStudents: StudentProgress[] = [];
  loading = true;

  // Filters
  searchQuery = '';
  selectedProgressRange = 'All';

  progressRanges = [
    { value: 'All', label: 'Tous' },
    { value: 'not-started', label: 'Non commencé (0%)' },
    { value: 'in-progress', label: 'En cours (1-99%)' },
    { value: 'completed', label: 'Terminé (100%)' }
  ];

  // Statistics
  totalStudents = 0;
  averageProgress = 0;
  completionRate = 0;

  constructor(
    private formationService: FormationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    
    this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser) {
        this.loading = false;
        return;
      }

      this.formationService.getInstructorStudents(currentUser.idUser).subscribe({
        next: (students: StudentProgress[]) => {
          this.students = students;
          this.calculateStatistics();
          this.applyFilters();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading students:', error);
          this.students = [];
          this.filteredStudents = [];
          this.loading = false;
        }
      });
    });
  }

  calculateStatistics(): void {
    this.totalStudents = this.students.length;
    
    if (this.students.length > 0) {
      const totalProgress = this.students.reduce((sum, s) => sum + s.completionPercent, 0);
      this.averageProgress = Math.round(totalProgress / this.students.length);
      
      const completed = this.students.filter(s => s.status === 'COMPLETED' || s.completionPercent === 100).length;
      this.completionRate = Math.round((completed / this.students.length) * 100);
    } else {
      this.averageProgress = 0;
      this.completionRate = 0;
    }
  }

  applyFilters(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchSearch = !this.searchQuery || 
        student.userName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        student.userEmail.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        student.courseTitle.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      let matchProgress = true;
      if (this.selectedProgressRange === 'not-started') {
        matchProgress = student.completionPercent === 0;
      } else if (this.selectedProgressRange === 'in-progress') {
        matchProgress = student.completionPercent > 0 && student.completionPercent < 100;
      } else if (this.selectedProgressRange === 'completed') {
        matchProgress = student.completionPercent === 100 || student.status === 'COMPLETED';
      }
      
      return matchSearch && matchProgress;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onProgressRangeChange(): void {
    this.applyFilters();
  }

  getProgressClass(progress: number): string {
    if (progress === 0) return 'not-started';
    if (progress < 100) return 'in-progress';
    return 'completed';
  }

  getProgressLabel(progress: number): string {
    if (progress === 0) return 'Non commencé';
    if (progress < 100) return 'En cours';
    return 'Terminé';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  }

  viewStudentDetails(student: StudentProgress): void {
    // TODO: Open student details modal
    console.log('View details for student:', student.userId);
  }

  exportStudents(): void {
    this.authService.currentUser$.subscribe(currentUser => {
      if (!currentUser) return;

      this.formationService.exportStudentList(currentUser.idUser).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('Error exporting students:', error);
        }
      });
    });
  }
}
