import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewService, Interview } from '../services/interview.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-interview-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-calendar.component.html',
  styleUrls: ['./interview-calendar.component.css']
})
export class InterviewCalendarComponent implements OnInit {
  interviews: Interview[] = [];
  currentDate = new Date();
  daysInMonth: (number | null)[] = [];
  monthName = '';
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  selectedInterview: Interview | null = null;
  showDetails = false;

  constructor(
    private interviewService: InterviewService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadInterviews();
    this.generateCalendar();
  }

  loadInterviews(): void {
    const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    this.interviewService.getInterviewsBetweenDates(
      startDate.toISOString(),
      endDate.toISOString()
    ).subscribe({
      next: (data) => {
        this.interviews = data;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des entretiens');
        console.error(error);
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    this.monthName = new Date(year, month).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    this.daysInMonth = [];

    // Jours du mois précédent
    for (let i = firstDay === 0 ? 6 : firstDay - 1; i > 0; i--) {
      this.daysInMonth.push(null);
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      this.daysInMonth.push(i);
    }

    // Jours du mois suivant
    const remainingDays = 42 - this.daysInMonth.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.daysInMonth.push(null);
    }
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.currentDate = new Date(this.currentDate);
    this.generateCalendar();
    this.loadInterviews();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentDate = new Date(this.currentDate);
    this.generateCalendar();
    this.loadInterviews();
  }

  getInterviewsForDay(day: number | null): Interview[] {
    if (!day) return [];

    const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];

    return this.interviews.filter(interview => {
      const interviewDate = interview.interviewDateTime.split('T')[0];
      return interviewDate === dateStr;
    });
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      this.currentDate.getMonth() === today.getMonth() &&
      this.currentDate.getFullYear() === today.getFullYear()
    );
  }

  selectInterview(interview: Interview): void {
    this.selectedInterview = interview;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedInterview = null;
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'RESCHEDULED':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('fr-FR');
  }
}
