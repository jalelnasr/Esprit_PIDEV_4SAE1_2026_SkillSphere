import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from './services/theme.service';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SkillSphere';

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private translationService: TranslationService,
    private translate: TranslateService
  ) {
    // ✅ Forcer le chargement de la langue au démarrage
    this.translate.use(this.translationService.getCurrentLanguage() || 'fr');
  }
}