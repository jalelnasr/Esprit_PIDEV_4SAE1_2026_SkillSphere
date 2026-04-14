import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { TranslationService } from './core/services/translation.service';
import { AuthService } from './core/services/auth.service';
import { ChatbotWidgetComponent } from './shared/components/chatbot-widget/chatbot-widget.component';
import { NotificationCenterComponent } from './shared/components/notification-center/notification-center.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ChatbotWidgetComponent, NotificationCenterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SkillSphere';
  isLoggedIn$;

  constructor(
    private router: Router, 
    private themeService: ThemeService,
    private translationService: TranslationService,
    private authService: AuthService
  ) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(
      map(user => user !== null)
    );
  }
}
