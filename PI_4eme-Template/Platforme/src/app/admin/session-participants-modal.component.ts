import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-session-participants-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>👥 Participants - Session #{{ sessionId }}</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <div class="modal-body">
          <div *ngIf="loading" class="loading">Chargement...</div>

          <div *ngIf="!loading && participants.length === 0" class="empty">
            Aucun participant inscrit
          </div>

          <div *ngIf="!loading && participants.length > 0">
            <p class="count"><strong>{{ participants.length }}</strong> participant(s)</p>
            
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of participants; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>User #{{ p.user_id }}</td>
                  <td>N/A</td>
                  <td>N/A</td>
                  <td>{{ p.enrolled_at | date:'dd/MM/yyyy HH:mm' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn" (click)="close()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 900px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #6b7280;
    }

    .close-btn:hover {
      color: #1f2937;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .loading, .empty {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .count {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f3f4f6;
      border-radius: 6px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
      font-size: 0.875rem;
    }

    tbody tr:hover {
      background: #f9fafb;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn:hover {
      background: #4b5563;
    }
  `]
})
export class SessionParticipantsModalComponent implements OnInit {
  @Input() sessionId!: number;
  @Output() closeModal = new EventEmitter<void>();

  participants: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadParticipants();
  }

  loadParticipants(): void {
    this.loading = true;
    const url = `${environment.formationApi}/sessions/${this.sessionId}/participants`;
    
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.participants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading participants:', err);
        this.loading = false;
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
