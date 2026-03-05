import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService, Interview } from '../services/interview.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.css']
})
export class InterviewListComponent implements OnInit {
  interviews: Interview[] = [];
  filteredInterviews: Interview[] = [];
  loading = false;
  searchTerm = '';
  filterStatus = 'ALL';
  showModal = false;
  editingInterview: Interview | null = null;

  constructor(
    private interviewService: InterviewService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    this.interviewService.getInterviewsBetweenDates(
      startDate.toISOString(),
      endDate.toISOString()
    ).subscribe({
      next: (data) => {
        this.interviews = data;
        this.filterInterviews();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des entretiens');
        console.error(error);
        this.loading = false;
      }
    });
  }

  filterInterviews(): void {
    this.filteredInterviews = this.interviews.filter(interview => {
      const matchesSearch = interview.id?.toString().includes(this.searchTerm) ||
        interview.candidateId.toString().includes(this.searchTerm);
      const matchesStatus = this.filterStatus === 'ALL' || interview.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.filterInterviews();
  }

  onStatusChange(): void {
    this.filterInterviews();
  }

  openModal(interview?: Interview): void {
    if (interview) {
      this.editingInterview = { ...interview };
    } else {
      this.editingInterview = {
        candidateId: 0,
        recruiterId: 0,
        jobOfferId: 0,
        interviewDateTime: '',
        location: '',
        meetingLink: '',
        notes: ''
      };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingInterview = null;
  }

  saveInterview(): void {
    if (!this.editingInterview) return;

    if (this.editingInterview.id) {
      this.interviewService.updateInterview(this.editingInterview.id, this.editingInterview)
        .subscribe({
          next: () => {
            this.toastr.success('Entretien mis à jour avec succès');
            this.closeModal();
            this.loadInterviews();
          },
          error: (error) => {
            this.toastr.error('Erreur lors de la mise à jour');
            console.error(error);
          }
        });
    } else {
      this.interviewService.createInterview(this.editingInterview)
        .subscribe({
          next: () => {
            this.toastr.success('Entretien créé avec succès');
            this.closeModal();
            this.loadInterviews();
          },
          error: (error) => {
            this.toastr.error('Erreur lors de la création');
            console.error(error);
          }
        });
    }
  }

  cancelInterview(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cet entretien ?')) {
      this.interviewService.cancelInterview(id)
        .subscribe({
          next: () => {
            this.toastr.success('Entretien annulé');
            this.loadInterviews();
          },
          error: (error) => {
            this.toastr.error('Erreur lors de l\'annulation');
            console.error(error);
          }
        });
    }
  }

  deleteInterview(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) {
      this.interviewService.deleteInterview(id)
        .subscribe({
          next: () => {
            this.toastr.success('Entretien supprimé');
            this.loadInterviews();
          },
          error: (error) => {
            this.toastr.error('Erreur lors de la suppression');
            console.error(error);
          }
        });
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'badge-primary';
      case 'COMPLETED':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-danger';
      case 'RESCHEDULED':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('fr-FR');
  }
}
