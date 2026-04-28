import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { B2bContractService } from '../services/contract.service';
import { B2bMissionService } from '../services/mission.service';
import { Contract, Mission } from '../models/b2b.models';

@Component({
  selector: 'app-contract-signature',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="contract-page">
      <!-- Header -->
      <div class="page-header-custom">
        <button class="back-btn" (click)="goBack()">
          <span class="back-icon">←</span> Back
        </button>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading contract...</p>
      </div>

      <!-- Contract Document -->
      <div class="contract-document" *ngIf="!loading && contract">
        <div class="contract-header">
          <h1>📄 SERVICE PROVISION CONTRACT</h1>
          <div class="contract-number">N° {{ contract.contractNumber }}</div>
        </div>

        <div class="contract-section">
          <h2>BETWEEN THE UNDERSIGNED:</h2>
          <div class="party-info">
            <p><strong>THE COMPANY:</strong> {{ contract.companyName }}</p>
            <p>Hereinafter referred to as "the Client"</p>
          </div>
          <div class="party-info">
            <p><strong>THE FREELANCER:</strong> {{ getFreelancerName() }}</p>
            <p>Hereinafter referred to as "the Service Provider"</p>
          </div>
        </div>

        <div class="contract-section" *ngIf="mission">
          <h2>ARTICLE 1 - CONTRACT PURPOSE</h2>
          <p>This contract aims to carry out the following mission:</p>
          <div class="mission-details">
            <p><strong>Mission title:</strong> {{ mission.title }}</p>
            <p><strong>Description:</strong></p>
            <p class="mission-description">{{ mission.description }}</p>
            <p><strong>Required skills:</strong></p>
            <div class="skills-list">
              <span class="skill-badge" *ngFor="let skill of parseSkills(mission.requiredSkills)">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 2 - MISSION DURATION</h2>
          <div class="duration-info">
            <p><strong>Start date:</strong> {{ contract.startDate | date:'dd/MM/yyyy' }}</p>
            <p><strong>End date:</strong> {{ contract.endDate | date:'dd/MM/yyyy' }}</p>
            <p><strong>Total duration:</strong> {{ calculateDuration() }} working days</p>
          </div>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 3 - COMPENSATION</h2>
          <div class="payment-info">
            <p><strong>Total contract amount:</strong> 
              <span class="amount-highlight">{{ contract.amount | number:'1.2-2' }} €</span>
            </p>
            <p *ngIf="mission"><strong>Daily rate:</strong> {{ mission.dailyRate | number:'1.2-2' }} €/day</p>
            <p><strong>Payment terms:</strong> Monthly payment at the end of the term, upon presentation of invoice.</p>
          </div>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 4 - SERVICE PROVIDER OBLIGATIONS</h2>
          <ul>
            <li>Perform the mission professionally and within agreed deadlines</li>
            <li>Respect the confidentiality of company information</li>
            <li>Provide deliverables defined in the specifications</li>
            <li>Inform the Client of any problems or potential delays</li>
            <li>Ensure availability and regular communication</li>
          </ul>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 5 - CLIENT OBLIGATIONS</h2>
          <ul>
            <li>Provide necessary means for mission completion</li>
            <li>Make payments according to agreed terms</li>
            <li>Ensure regular monitoring of mission progress</li>
            <li>Provide necessary information and access to the Service Provider</li>
          </ul>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 6 - CONFIDENTIALITY</h2>
          <p>The Service Provider undertakes not to disclose confidential company information, 
          during the contract duration and after its end, except with written authorization from the Client.</p>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 7 - INTELLECTUAL PROPERTY</h2>
          <p>All deliverables and creations made within this mission are the exclusive property 
          of the Client from their creation and full payment.</p>
        </div>

        <div class="contract-section">
          <h2>ARTICLE 8 - TERMINATION</h2>
          <p>The contract may be terminated by either party with 15 days notice, 
          by registered letter with acknowledgment of receipt.</p>
        </div>

        <!-- Signature Section -->
        <div class="signature-section" *ngIf="contract.status !== 'SIGNED'">
          <h2>HR / COMPANY SIGNATURE</h2>
          <p class="signature-instruction">
            ✍️ As a company representative, sign this contract below
          </p>
          
          <div class="signature-container">
            <canvas 
              #signatureCanvas 
              class="signature-canvas"
              (mousedown)="startDrawing($event)"
              (mousemove)="draw($event)"
              (mouseup)="stopDrawing()"
              (mouseleave)="stopDrawing()"
              (touchstart)="startDrawing($event)"
              (touchmove)="draw($event)"
              (touchend)="stopDrawing()">
            </canvas>
            <div class="signature-label">Company Representative Signature</div>
          </div>

          <div class="signature-actions">
            <button class="btn-clear" (click)="clearSignature()">
              🗑️ Clear
            </button>
            <button class="btn-sign" (click)="signContract()" [disabled]="!hasSignature || signing">
              {{ signing ? 'Signing...' : '✓ Sign on behalf of the company' }}
            </button>
          </div>
        </div>

        <!-- Signed Contract -->
        <div class="signed-section" *ngIf="contract.status === 'SIGNED'">
          <div class="signed-badge">
            <span class="badge-icon">✓</span>
            <div class="badge-content">
              <h3>Contract signed by the company</h3>
              <p>Signed on {{ contract.signedAt | date:'dd/MM/yyyy at HH:mm' }}</p>
              <p class="next-step">The candidate has been notified of the acceptance.</p>
            </div>
          </div>
          
          <!-- Display HR Signature -->
          <div class="signature-display" *ngIf="contract.signatureData">
            <h3>HR Representative Signature</h3>
            <div class="signature-container-display">
              <img [src]="contract.signatureData" alt="HR Signature" class="signature-image" />
              <div class="signature-info">
                <p><strong>Signed by:</strong> HR Representative</p>
                <p><strong>Date:</strong> {{ contract.signedAt | date:'dd/MM/yyyy at HH:mm' }}</p>
                <p><strong>Status:</strong> <span class="status-active">Contract Active</span></p>
              </div>
            </div>
          </div>
        </div>

        <div class="contract-footer">
          <p>Made in two original copies</p>
          <p>Establishment date: {{ today | date:'dd/MM/yyyy' }}</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./contract-signature.component.css', './contract-signature-display.css']
})
export class ContractSignatureComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  contract: Contract | null = null;
  mission: Mission | null = null;
  loading = true;
  signing = false;
  today = new Date();
  
  // Signature canvas
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  hasSignature = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractSvc: B2bContractService,
    private missionSvc: B2bMissionService
  ) {}

  ngOnInit() {
    console.log('ContractSignatureComponent ngOnInit called');
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Contract ID from route:', id);
    if (id) {
      this.loadContract(+id);
    } else {
      console.error('No contract ID found in route!');
      alert('Erreur: ID du contrat manquant dans l\'URL');
    }
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  loadContract(id: number) {
    console.log('Loading contract with ID:', id);
    this.loading = true;
    this.contractSvc.getById(id).subscribe({
      next: (contract) => {
        console.log('Contract loaded successfully:', contract);
        this.contract = contract;
        
        // Charger la mission associée
        if (contract.missionId) {
          console.log('Loading mission with ID:', contract.missionId);
          this.missionSvc.getById(contract.missionId).subscribe({
            next: (mission) => {
              console.log('Mission loaded successfully:', mission);
              this.mission = mission;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading mission:', err);
              this.loading = false;
            }
          });
        } else {
          console.warn('No mission ID in contract');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading contract:', err);
        this.loading = false;
        alert('Error loading contract: ' + (err?.error?.message || err?.message || 'Unknown error'));
      }
    });
  }

  initCanvas() {
    console.log('initCanvas called');
    if (!this.canvasRef) {
      console.error('Canvas ref not found!');
      return;
    }
    
    const canvas = this.canvasRef.nativeElement;
    console.log('Canvas element:', canvas);
    this.ctx = canvas.getContext('2d');
    
    // Set canvas size - use a default if offsetWidth is 0
    const width = canvas.offsetWidth || 600;
    canvas.width = width;
    canvas.height = 200;
    
    console.log('Canvas size:', canvas.width, 'x', canvas.height);
    
    if (this.ctx) {
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      // Draw border to show canvas is ready
      this.ctx.strokeStyle = '#ddd';
      this.ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
      this.ctx.strokeStyle = '#000';
      
      console.log('Canvas initialized successfully');
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const pos = this.getPosition(event);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing || !this.ctx) return;
    
    event.preventDefault();
    const pos = this.getPosition(event);
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.hasSignature = true;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  getPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }

  clearSignature() {
    if (!this.ctx || !this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasSignature = false;
  }

  signContract() {
    if (!this.contract || !this.hasSignature) return;
    
    if (!confirm('Are you sure you want to sign this contract on behalf of the company? This action is irreversible.')) {
      return;
    }
    
    this.signing = true;
    
    // Get signature as base64
    const canvas = this.canvasRef.nativeElement;
    const signatureData = canvas.toDataURL('image/png');
    
    // Sign the contract with signature data
    this.contractSvc.signWithSignature(this.contract.id!, signatureData).subscribe({
      next: (updatedContract) => {
        this.contract = updatedContract;
        this.signing = false;
        alert('✓ Contract signed successfully! The candidate will be notified of the acceptance.');
      },
      error: (e) => {
        this.signing = false;
        alert('Error during signature: ' + (e?.error?.message || 'Unknown error'));
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

  getFreelancerName(): string {
    try {
      // Récupérer l'objet utilisateur complet depuis localStorage
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const nom = user.nom;
        const prenom = user.prenom;
        
        if (nom && prenom) {
          return `${prenom} ${nom}`;
        } else if (nom) {
          return nom;
        } else if (prenom) {
          return prenom;
        }
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
    
    // Fallback vers l'ID du candidat si pas de nom disponible
    return this.contract ? `Candidate ID: ${this.contract.candidateId}` : 'Unknown Candidate';
  }

  goBack() {
    this.router.navigate(['/admin/corporate/contracts']);
  }
}
