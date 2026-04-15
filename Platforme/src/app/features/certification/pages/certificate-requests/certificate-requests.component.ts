import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CertificateApiService,
  CertificateRequestDetail,
  CertificateStatus
} from '../../../../services/certificate-api.service';

@Component({
  selector: 'app-certificate-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Certificate Requests</h1>

      <div class="toolbar">
        <label>Status:</label>
        <select [(ngModel)]="statusFilter" (change)="loadRequests()">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <p *ngIf="error" style="color:#d32f2f;">{{ error }}</p>

      <div *ngIf="requests.length === 0">No certificate requests found.</div>

      <div *ngFor="let req of requests" class="request-card">
        <h3>{{ req.apprenantFirstName }} {{ req.apprenantLastName }}</h3>
        <p><strong>Evaluation:</strong> {{ req.evaluationTitle }}</p>
        <p><strong>Best Score:</strong> {{ req.bestScore }}%</p>
        <p><strong>Passed:</strong> {{ req.passed ? 'Yes' : 'No' }}</p>
        <p><strong>Status:</strong> {{ req.status }}</p>
        <p><strong>Requested:</strong> {{ req.requestedAt | date:'short' }}</p>

        <div class="history" *ngIf="req.attemptHistory.length">
          <h4>Attempt History</h4>
          <div *ngFor="let item of req.attemptHistory" class="history-item">
            {{ item.submittedAt | date:'short' }} - {{ item.score }}% ({{ item.passed ? 'Passed' : 'Failed' }})
          </div>
        </div>

        <div class="actions" *ngIf="req.status === 'PENDING'">
          <button (click)="approve(req)">Approve & Send PDF</button>
          <button class="danger" (click)="reject(req)">Reject</button>
        </div>

        <div class="actions" *ngIf="req.status === 'APPROVED'">
          <button (click)="download(req)">Download PDF</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 24px; }
    .toolbar { margin-bottom: 16px; display: flex; gap: 8px; align-items: center; }
    .request-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
    .history { margin-top: 10px; background: #f8fafc; border-radius: 8px; padding: 10px; }
    .history-item { font-size: 12px; color: #475569; margin-bottom: 4px; }
    .actions { margin-top: 12px; display: flex; gap: 8px; }
    button { border: none; background: #2563eb; color: #fff; border-radius: 6px; padding: 8px 12px; cursor: pointer; }
    button.danger { background: #dc2626; }
  `]
})
export class CertificateRequestsComponent implements OnInit {
  requests: CertificateRequestDetail[] = [];
  error: string | null = null;
  statusFilter: '' | CertificateStatus = '';

  constructor(private certificateService: CertificateApiService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.error = null;
    this.certificateService.getFormateurRequests(this.statusFilter || undefined).subscribe({
      next: (data) => {
        this.requests = data;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load certificate requests.';
      }
    });
  }

  approve(req: CertificateRequestDetail): void {
    this.certificateService.approveRequest(req.id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => {
        this.error = err?.error?.message || 'Failed to approve request.';
      }
    });
  }

  reject(req: CertificateRequestDetail): void {
    this.certificateService.rejectRequest(req.id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => {
        this.error = err?.error?.message || 'Failed to reject request.';
      }
    });
  }

  download(req: CertificateRequestDetail): void {
    this.certificateService.downloadForFormateur(req.id).subscribe({
      next: (blob) => {
        const fileName = req.pdfFileName || `certificate-${req.id}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to download PDF.';
      }
    });
  }
}
