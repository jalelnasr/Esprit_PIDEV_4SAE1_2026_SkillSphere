import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// ⭐ THIS RUNS BEFORE ANGULAR STARTS
export function initAuth(auth: AuthService) {
  return () => firstValueFrom(auth.restoreSession());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),

    // ✅ add withFetch() to remove NG02801 warning
    provideHttpClient(withInterceptorsFromDi(), withFetch()),

    // JWT interceptor
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },

    // Translation service (ngx-translate)
    provideTranslateService({
      defaultLanguage: 'fr',
      fallbackLang: 'fr',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),

    // ⭐ AUTO LOGIN ON REFRESH
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};