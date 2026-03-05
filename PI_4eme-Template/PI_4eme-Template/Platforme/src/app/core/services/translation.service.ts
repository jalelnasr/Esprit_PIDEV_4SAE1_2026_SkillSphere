import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initLanguage();
  }

  private initLanguage(): void {
    // Set available languages
    this.translate.addLangs(['fr', 'en', 'ar']);
    
    // Set default language
    this.translate.setDefaultLang('fr');
    
    // Only access localStorage in browser
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('selectedLanguage');
      const browserLang = this.translate.getBrowserLang();
      const langToUse = savedLang || (browserLang?.match(/fr|en|ar/) ? browserLang : 'fr');
      
      this.translate.use(langToUse);
      this.updateDirection(langToUse);
    } else {
      this.translate.use('fr');
    }
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedLanguage', lang);
      this.updateDirection(lang);
    }
  }

  private updateDirection(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', lang);
      }
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
