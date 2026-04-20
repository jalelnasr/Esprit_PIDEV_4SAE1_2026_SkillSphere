import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService, DashboardStats, CompetitionFilter } from '../../../../core/services/dashboard.service';
import { RouterModule } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-formateur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './formateur-dashboard.component.html',
  styleUrls: ['./formateur-dashboard.component.css']
})
export class FormateurDashboardComponent implements OnInit {
  @ViewChild('typeChart') typeChartRef!: ElementRef;
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef;

  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;

  // Filtres
  filter: CompetitionFilter = {
    searchTerm: '',
    type: '',
    status: '',
    participationType: '',
    sortBy: 'startDate',
    sortDirection: 'DESC'
  };

  filteredCompetitions: any[] = [];
  showFilters = false;

  // Charts
  typeChart: Chart | null = null;
  statusChart: Chart | null = null;
  monthlyChart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.initializeCharts(), 100);
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  initializeCharts(): void {
    if (!this.stats) return;

    this.createTypeChart();
    this.createStatusChart();
    this.createMonthlyChart();
  }

  createTypeChart(): void {
    if (this.typeChart) {
      this.typeChart.destroy();
    }

    const ctx = this.typeChartRef.nativeElement.getContext('2d');
    const data = this.stats!.competitionsByType;

    this.typeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Compétitions par Type'
          }
        }
      }
    });
  }

  createStatusChart(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    const data = this.stats!.competitionsByStatus;

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: [
            '#28a745',
            '#ffc107',
            '#17a2b8',
            '#6c757d',
            '#dc3545'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Compétitions par Statut'
          }
        }
      }
    });
  }

  createMonthlyChart(): void {
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');
    const monthlyStats = this.stats!.monthlyStats;

    this.monthlyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyStats.map(m => m.month),
        datasets: [
          {
            label: 'Compétitions',
            data: monthlyStats.map(m => m.competitions),
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4
          },
          {
            label: 'Participants',
            data: monthlyStats.map(m => m.participants),
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.4
          },
          {
            label: 'Messages',
            data: monthlyStats.map(m => m.messages),
            borderColor: '#FFCE56',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Évolution Mensuelle (6 derniers mois)'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.dashboardService.filterCompetitions(this.filter).subscribe({
      next: (data) => {
        this.filteredCompetitions = data;
      },
      error: (err) => {
        console.error('Error filtering competitions:', err);
      }
    });
  }

  resetFilters(): void {
    this.filter = {
      searchTerm: '',
      type: '',
      status: '',
      participationType: '',
      sortBy: 'startDate',
      sortDirection: 'DESC'
    };
    this.filteredCompetitions = [];
  }

  quickSearch(): void {
    if (this.filter.searchTerm && this.filter.searchTerm.trim()) {
      this.dashboardService.searchCompetitions(this.filter.searchTerm).subscribe({
        next: (data) => {
          this.filteredCompetitions = data;
        },
        error: (err) => {
          console.error('Error searching competitions:', err);
        }
      });
    } else {
      this.filteredCompetitions = [];
    }
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'OPEN': 'badge-success',
      'IN_PROGRESS': 'badge-info',
      'COMPLETED': 'badge-secondary',
      'CANCELLED': 'badge-danger',
      'DRAFT': 'badge-warning'
    };
    return statusMap[status] || 'badge-secondary';
  }

  getTypeBadgeClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'ONLINE': 'badge-primary',
      'PHYSICAL': 'badge-success',
      'HYBRID': 'badge-info'
    };
    return typeMap[type] || 'badge-secondary';
  }
}
