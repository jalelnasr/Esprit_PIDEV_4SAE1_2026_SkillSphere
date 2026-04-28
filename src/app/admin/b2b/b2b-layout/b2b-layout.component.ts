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
    <div class="b2b-container">
      <app-b2b-header (toggleSidebar)="sidebarCollapsed=!sidebarCollapsed"></app-b2b-header>
      <div class="b2b-main">
        <app-b2b-sidebar [collapsed]="sidebarCollapsed" (toggle)="sidebarCollapsed=!sidebarCollapsed"></app-b2b-sidebar>
        <main class="b2b-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .b2b-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, var(--b2b-page-bg-start, #f8fafc) 0%, var(--b2b-page-bg-end, #eef2ff) 100%);
      position: relative;
      overflow-x: hidden;
    }
    :root.dark-mode .b2b-container {
      --b2b-page-bg-start: #0f172a;
      --b2b-page-bg-end: #1e293b;
    }

    .b2b-container::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(circle at 20% 50%, rgba(8, 145, 178, 0.1) 0%, transparent 52%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.09) 0%, transparent 55%);
      pointer-events: none;
      z-index: 0;
    }

    .b2b-main {
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .b2b-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: transparent;
    }

    @media (max-width: 768px) {
      .b2b-content { padding: 1rem; }
    }
  `]
})
export class B2bLayoutComponent {
  sidebarCollapsed = false;
}
