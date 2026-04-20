import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastContainerComponent } from '@shared/components';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '@core/services/auth.service';
import { LofiPlayerComponent } from '@shared/components/lofi-player/lofi-player.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent, ToastContainerComponent, LofiPlayerComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  constructor(public themeService: ThemeService, private authService: AuthService) {}

  get isApprenant(): boolean {
    return this.authService.getUserRole() === 'APPRENANT';
  }

  ngOnInit(): void {}
}
