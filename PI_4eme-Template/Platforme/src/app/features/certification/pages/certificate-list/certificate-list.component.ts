import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>My Certificates</h1>
      <div class="certificates-grid">
        <div class="cert-card" *ngFor="let cert of certificates">
          <div class="cert-header">🏆</div>
          <h3>{{ cert.title }}</h3>
          <p>Issued: {{ cert.issuedDate | date:'short' }}</p>
          <button class="cert-btn">View Certificate</button>
        </div>
      </div>
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
export class CertificateListComponent {
  certificates = [
    { title: 'Advanced Angular Developer', issuedDate: new Date('2024-01-15') },
    { title: 'Python Expert', issuedDate: new Date('2023-12-01') }
  ];
}
