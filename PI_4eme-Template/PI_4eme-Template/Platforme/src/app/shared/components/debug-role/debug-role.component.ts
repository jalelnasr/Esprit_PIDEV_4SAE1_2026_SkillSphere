import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-debug-role',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-panel" *ngIf="showDebug">
      <div class="debug-header">
        <h3>🔍 Debug Info</h3>
        <button (click)="toggleDebug()" class="close-btn">✕</button>
      </div>
      
      <div class="debug-content">
        <div class="debug-item">
          <span class="label">Rôle actuel:</span>
          <span class="value" [class.success]="currentRole === 'APPRENANT'">
            {{ currentRole || 'Non connecté' }}
          </span>
        </div>

        <div class="debug-item">
          <span class="label">Email:</span>
          <span class="value">{{ currentUser?.email || 'N/A' }}</span>
        </div>

        <div class="debug-item">
          <span class="label">ID Utilisateur:</span>
          <span class="value">{{ currentUser?.idUser || 'N/A' }}</span>
        </div>

        <div class="debug-item">
          <span class="label">Bouton visible:</span>
          <span class="value" [class.success]="shouldShowButton" [class.error]="!shouldShowButton">
            {{ shouldShowButton ? '✅ OUI' : '❌ NON' }}
          </span>
        </div>

        <div class="debug-actions">
          <button (click)="testAccess()" class="test-btn">
            🧪 Tester l'accès
          </button>
          <button (click)="refreshRole()" class="refresh-btn">
            🔄 Rafraîchir
          </button>
        </div>

        <div class="debug-info">
          <p><strong>Pour voir le bouton freelancer:</strong></p>
          <ul>
            <li>Rôle doit être "APPRENANT"</li>
            <li>Regarde en bas à droite de l'écran</li>
            <li>Le bouton est violet avec l'icône 💼</li>
          </ul>
        </div>
      </div>
    </div>

    <button class="debug-toggle" (click)="toggleDebug()" title="Debug Info">
      🔍
    </button>
  `,
  styles: [`
    .debug-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      transition: all 0.3s ease;
    }

    .debug-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .debug-panel {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 350px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .debug-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .debug-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .debug-content {
      padding: 20px;
    }

    .debug-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .label {
      font-weight: 600;
      color: #495057;
      font-size: 14px;
    }

    .value {
      font-weight: 700;
      color: #212529;
      font-size: 14px;
      padding: 4px 12px;
      background: white;
      border-radius: 6px;
    }

    .value.success {
      color: #28a745;
      background: #d4edda;
    }

    .value.error {
      color: #dc3545;
      background: #f8d7da;
    }

    .debug-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .test-btn, .refresh-btn {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
    }

    .test-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .test-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .refresh-btn {
      background: #6c757d;
      color: white;
    }

    .refresh-btn:hover {
      background: #5a6268;
    }

    .debug-info {
      margin-top: 16px;
      padding: 12px;
      background: #e7f3ff;
      border-left: 4px solid #0066cc;
      border-radius: 4px;
    }

    .debug-info p {
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #0066cc;
      font-size: 14px;
    }

    .debug-info ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #495057;
    }

    .debug-info li {
      margin-bottom: 4px;
    }

    @media (max-width: 768px) {
      .debug-panel {
        width: calc(100% - 40px);
        right: 20px;
      }
    }
  `]
})
export class DebugRoleComponent implements OnInit {
  showDebug = false;
  currentRole: string | null = null;
  currentUser: any = null;
  shouldShowButton = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadDebugInfo();
    
    // Subscribe to role changes
    this.authService.userRole$.subscribe(role => {
      this.currentRole = role;
      this.shouldShowButton = role === 'APPRENANT';
    });

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadDebugInfo() {
    this.currentRole = this.authService.getUserRole();
    this.shouldShowButton = this.currentRole === 'APPRENANT';
    
    // Also check localStorage directly
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Debug Info:');
    console.log('  - Role from service:', this.currentRole);
    console.log('  - Role from localStorage:', storedRole);
    console.log('  - User from localStorage:', storedUser);
    console.log('  - Should show button:', this.shouldShowButton);
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
    if (this.showDebug) {
      this.loadDebugInfo();
    }
  }

  testAccess() {
    console.log('🧪 Testing access to /freelance...');
    window.location.href = '/freelance';
  }

  refreshRole() {
    console.log('🔄 Refreshing role...');
    this.loadDebugInfo();
    
    // Force reload from localStorage
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');
    
    alert(`Rôle actuel: ${role}\nUtilisateur: ${user ? JSON.parse(user).email : 'Non connecté'}`);
  }
}
