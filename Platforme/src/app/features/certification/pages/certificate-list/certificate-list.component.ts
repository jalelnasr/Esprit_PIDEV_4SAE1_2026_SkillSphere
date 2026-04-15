import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateApiService, CertificateResponse } from '../../../../services/certificate-api.service';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>My Certificates</h1>
      <p *ngIf="error" style="color:#d32f2f;">{{ error }}</p>
      <div class="certificates-grid" *ngIf="certificates.length; else emptyState">
        <div class="cert-card" *ngFor="let cert of certificates">
          <div class="cert-header">🏆</div>
          <h3>{{ cert.evaluationTitle }}</h3>
          <p>Requested: {{ cert.requestedAt | date:'short' }}</p>
          <p *ngIf="cert.issuedAt">Issued: {{ cert.issuedAt | date:'short' }}</p>
          <p>Status: <strong>{{ cert.status }}</strong></p>
          <button class="cert-btn" *ngIf="cert.status === 'APPROVED'" (click)="download(cert)">Download PDF</button>
        </div>
      </div>
      <ng-template #emptyState>
        <p>No certificates or certificate requests yet.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .container { padding: 2rem; }
    h1 { font-size: 32px; color: #333; margin-bottom: 2rem; }
    .certificates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
    .cert-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center; }
    .cert-header { font-size: 48px; margin-bottom: 1rem; }
    h3 { margin: 0 0 0.5rem 0; color: #333; }
    p { margin: 0 0 1rem 0; color: #666; font-size: 12px; }
    .cert-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; }
  `]
})
export class CertificateListComponent implements OnInit {
  certificates: CertificateResponse[] = [];
  error: string | null = null;

  constructor(private certificateService: CertificateApiService) {}

  ngOnInit(): void {
    this.certificateService.getMyCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load certificates.';
      }
    });
  }

  download(cert: CertificateResponse): void {
    this.certificateService.downloadMyCertificate(cert.id).subscribe({
      next: (blob) => {
        const fileName = cert.pdfFileName || `certificate-${cert.id}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to download certificate.';
      }
    });
  }
}
