import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { B2bContractService } from '../../../../admin/b2b/services/contract.service';
import { B2bMissionService } from '../../../../admin/b2b/services/mission.service';
import { Contract, Mission } from '../../../../admin/b2b/models/b2b.models';

@Component({
  selector: 'app-contract-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="contract-page">
      <!-- Header -->
      <div class="page-header-custom">
        <button class="back-btn" (click)="goBack()">
          <span class="back-icon">←</span> Retour à mes contrats
        </button>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement du contrat...</p>
      </div>

      <!-- Contract Document (Read-only) -->
      <div class="contract-document" *ngIf="!loading && contract">
        <div class="contract-header">
          <h1>📄 CONTRAT DE PRESTATION DE SERVICES</h1>
          <div class="contract-number">N° {{ contract.contractNumber }}</div>
          <div class="contract-status">
            <span class="status-badge" [ngClass]="'status-' + contract.status.toLowerCase()">
              {{ getStatusLabel(contract.status) }}
            </span>
          </div>
        </div>

        <div class="contract-section">
          <h2>ENTRE LES SOUSSIGNÉS :</h2>
          <div class="party-info">
            <p><strong>L'ENTREPRISE :</strong> {{ contract.companyName }}</p>
            <p>Ci-après dénommée "le Client"</p>
          </div>
          <div class="party-info">
            <p><strong>LE FREELANCE :</strong> {{ contract.freelancerName || 'Vous' }}</p>
            <p>Ci-après dénommé "le Prestataire"</p>
          </div>
        </div>

        <div class="contract-section" *ngIf="mission">
          <h2>ARTICLE 1 - OBJET DU CONTRAT</h2>
          <p>Le présent contrat a pour objet la réalisation de la mission suivante :</p>
          <div class="mission-details">
            <p><strong>Titre de la mission :</strong> {{ mission.title }}</p>
            <p><strong>Description :</strong></p>
            <p class="mission-description">{{ mission.description }}</p>
            <p><strong>Compétences requises :</strong></p>
            <div class="skills-list">
              <span class="skill-badge" *ngFor="let skill of parseSkills(mission.requiredSkills)">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 2 - DURÉE DE LA MISSION</h2>
          <div class="duration-info">
            <p><strong>Date de début :</strong> {{ contract.startDate | date:'dd/MM/yyyy' }}</p>
            <p><strong>Date de fin :</strong> {{ contract.endDate | date:'dd/MM/yyyy' }}</p>
            <p><strong>Durée totale :</strong> {{ calculateDuration() }} jours ouvrés</p>
          </div>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 3 - RÉMUNÉRATION</h2>
          <div class="payment-info">
            <p><strong>Montant total du contrat :</strong> 
              <span class="amount-highlight">{{ contract.amount | number:'1.2-2' }} €</span>
            </p>
            <p *ngIf="mission"><strong>Taux journalier :</strong> {{ mission.dailyRate | number:'1.2-2' }} €/jour</p>
            <p><strong>Modalités de paiement :</strong> Paiement mensuel à terme échu, sur présentation de facture.</p>
          </div>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 4 - VOS OBLIGATIONS EN TANT QUE PRESTATAIRE</h2>
          <ul>
            <li>Réaliser la mission avec professionnalisme et dans les délais convenus</li>
            <li>Respecter la confidentialité des informations de l'entreprise</li>
            <li>Fournir les livrables définis dans le cahier des charges</li>
            <li>Informer le Client de tout problème ou retard éventuel</li>
            <li>Assurer une disponibilité et une communication régulière</li>
          </ul>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 5 - OBLIGATIONS DE L'ENTREPRISE</h2>
          <ul>
            <li>Fournir les moyens nécessaires à la réalisation de la mission</li>
            <li>Effectuer les paiements selon les modalités convenues</li>
            <li>Assurer un suivi régulier de l'avancement de la mission</li>
            <li>Fournir les informations et accès nécessaires au Prestataire</li>
          </ul>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 6 - CONFIDENTIALITÉ</h2>
          <p>Vous vous engagez à ne pas divulguer les informations confidentielles de l'entreprise, 
          pendant la durée du contrat et après sa fin, sauf autorisation écrite du Client.</p>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 7 - PROPRIÉTÉ INTELLECTUELLE</h2>
          <p>Tous les livrables et créations réalisés dans le cadre de cette mission sont la propriété 
          exclusive du Client dès leur création et leur paiement intégral.</p>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 8 - RÉSILIATION</h2>
          <p>Le contrat peut être résilié par l'une ou l'autre des parties avec un préavis de 15 jours, 
          par lettre recommandée avec accusé de réception.</p>
        </div>

        <!-- Contract Status -->
        <div class="contract-status-section">
          <div class="status-card" *ngIf="contract.status === 'SIGNED'">
            <div class="status-icon">✅</div>
            <div class="status-content">
              <h3>Contrat Validé</h3>
              <p>Ce contrat a été signé par l'entreprise le {{ contract.signedAt | date:'dd/MM/yyyy à HH:mm' }}</p>
              <p class="status-note">Félicitations ! Votre candidature a été acceptée. Vous pouvez commencer la mission aux dates convenues.</p>
            </div>
          </div>

          <div class="status-card draft" *ngIf="contract.status === 'DRAFT'">
            <div class="status-icon">⏳</div>
            <div class="status-content">
              <h3>Contrat en Préparation</h3>
              <p>Ce contrat est en cours de préparation par l'entreprise.</p>
              <p class="status-note">Vous serez notifié dès que le contrat sera finalisé et signé.</p>
            </div>
          </div>
        </div>

        <div class="contract-footer">
          <p>Document généré automatiquement</p>
          <p>Date d'établissement : {{ today | date:'dd/MM/yyyy' }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="contract-actions" *ngIf="contract.status === 'SIGNED'">
          <button class="btn-print" (click)="printContract()">
            🖨️ Imprimer le contrat
          </button>
          <button class="btn-download" (click)="downloadContract()">
            📥 Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contract-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* Header */
    .page-header-custom {
      margin-bottom: 24px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 12px;
      color: #6366f1;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .back-btn:hover {
      background: rgba(99, 102, 241, 0.15);
      transform: translateX(-2px);
    }

    .back-icon {
      font-size: 18px;
    }

    /* Loading */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(99, 102, 241, 0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Contract Document */
    .contract-document {
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .contract-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 3px solid #6366f1;
    }

    .contract-header h1 {
      margin: 0 0 12px 0;
      font-size: 28px;
      color: #0f172a;
      font-weight: 800;
    }

    .contract-number {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .status-badge.status-draft {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    .status-badge.status-signed {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    /* Contract Sections */
    .contract-section {
      margin-bottom: 32px;
    }

    .contract-section h2 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #0f172a;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .contract-section p {
      margin: 0 0 12px 0;
      line-height: 1.8;
      color: #475569;
      font-size: 14px;
    }

    .contract-section ul {
      margin: 12px 0;
      padding-left: 24px;
    }

    .contract-section li {
      margin-bottom: 8px;
      line-height: 1.6;
      color: #475569;
      font-size: 14px;
    }

    /* Party Info */
    .party-info {
      background: rgba(99, 102, 241, 0.05);
      border-left: 4px solid #6366f1;
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 8px;
    }

    .party-info p {
      margin: 4px 0;
    }

    /* Mission Details */
    .mission-details {
      background: rgba(245, 158, 11, 0.05);
      border: 1px solid rgba(245, 158, 11, 0.2);
      padding: 20px;
      border-radius: 12px;
      margin-top: 12px;
    }

    .mission-description {
      white-space: pre-line;
      background: white;
      padding: 12px;
      border-radius: 8px;
      margin: 8px 0;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .skill-badge {
      padding: 6px 12px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      color: #6366f1;
    }

    /* Duration & Payment Info */
    .duration-info,
    .payment-info {
      background: rgba(34, 197, 94, 0.05);
      border: 1px solid rgba(34, 197, 94, 0.2);
      padding: 16px;
      border-radius: 12px;
      margin-top: 12px;
    }

    .amount-highlight {
      font-size: 20px;
      font-weight: 800;
      color: #16a34a;
    }

    /* Contract Status Section */
    .contract-status-section {
      margin: 48px 0;
      padding: 32px 0;
      border-top: 3px solid #e2e8f0;
      border-bottom: 3px solid #e2e8f0;
    }

    .status-card {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
      border: 2px solid rgba(34, 197, 94, 0.3);
      border-radius: 16px;
    }

    .status-card.draft {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
      border-color: rgba(245, 158, 11, 0.3);
    }

    .status-icon {
      font-size: 48px;
      flex-shrink: 0;
    }

    .status-content h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #0f172a;
      font-weight: 800;
    }

    .status-content p {
      margin: 4px 0;
      color: #64748b;
      font-size: 14px;
    }

    .status-note {
      margin-top: 8px !important;
      color: #6366f1 !important;
      font-weight: 600 !important;
    }

    /* Contract Footer */
    .contract-footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 13px;
    }

    .contract-footer p {
      margin: 4px 0;
    }

    /* Action Buttons */
    .contract-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }

    .btn-print,
    .btn-download {
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-print {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      border: 2px solid rgba(99, 102, 241, 0.2);
    }

    .btn-print:hover {
      background: rgba(99, 102, 241, 0.15);
      transform: translateY(-2px);
    }

    .btn-download {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    }

    .btn-download:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .contract-page {
        padding: 16px;
      }

      .contract-document {
        padding: 24px 20px;
      }

      .contract-header h1 {
        font-size: 22px;
      }

      .status-card {
        flex-direction: column;
        text-align: center;
      }

      .contract-actions {
        flex-direction: column;
      }

      .btn-print,
      .btn-download {
        width: 100%;
      }
    }

    /* Print Styles */
    @media print {
      .back-btn,
      .contract-actions {
        display: none !important;
      }

      .contract-page {
        background: white;
      }

      .contract-document {
        box-shadow: none;
      }
    }
  `]
})
export class ContractViewComponent implements OnInit {
  contract: Contract | null = null;
  mission: Mission | null = null;
  loading = true;
  today = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractSvc: B2bContractService,
    private missionSvc: B2bMissionService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContract(+id);
    }
  }

  loadContract(id: number) {
    this.loading = true;
    this.contractSvc.getById(id).subscribe({
      next: (contract) => {
        this.contract = contract;
        
        // Charger la mission associée
        if (contract.missionId) {
          this.missionSvc.getById(contract.missionId).subscribe({
            next: (mission) => {
              this.mission = mission;
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement du contrat');
      }
    });
  }

  calculateDuration(): number {
    if (!this.contract) return 0;
    
    const start = new Date(this.contract.startDate);
    const end = new Date(this.contract.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculer les jours ouvrés (approximation: 5 jours par semaine)
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    return (weeks * 5) + Math.min(remainingDays, 5);
  }

  parseSkills(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(s => s);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'En préparation',
      'SIGNED': 'Signé',
      'ACTIVE': 'Actif',
      'COMPLETED': 'Terminé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  printContract() {
    window.print();
  }

  downloadContract() {
    // TODO: Implémenter le téléchargement PDF
    alert('Fonctionnalité de téléchargement PDF à venir');
  }

  goBack() {
    this.router.navigate(['/corporate/freelance/contracts']);
  }
}