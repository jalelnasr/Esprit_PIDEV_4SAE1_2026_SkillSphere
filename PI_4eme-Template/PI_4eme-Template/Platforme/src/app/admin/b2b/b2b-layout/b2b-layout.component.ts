import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { B2bSidebarComponent } from '../b2b-sidebar/b2b-sidebar.component';
import { B2bHeaderComponent } from '../b2b-header/b2b-header.component';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-b2b-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, B2bSidebarComponent, B2bHeaderComponent, ToastContainerComponent],
  template: `
    <div class="b2b-shell">
      <app-b2b-sidebar [collapsed]="sidebarCollapsed" (toggle)="sidebarCollapsed=!sidebarCollapsed"></app-b2b-sidebar>
      <div class="b2b-main">
        <app-b2b-header (toggleSidebar)="sidebarCollapsed=!sidebarCollapsed"></app-b2b-header>
        <main class="b2b-page">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .b2b-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--b2b-bg, #f1f5f9);
    }
    :root.dark-mode .b2b-shell { --b2b-bg: #0f172a; }

    .b2b-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .b2b-page {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    @media (max-width: 768px) {
      .b2b-page { padding: 16px; }
    }
  `]
})
export class B2bLayoutComponent {
  sidebarCollapsed = false;
}
