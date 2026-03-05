import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();
  public isDarkMode$ = this.darkModeSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const initialTheme = this.getInitialTheme();
      this.darkModeSubject.next(initialTheme);
      this.applyTheme(initialTheme);
      console.log('Dark Mode Service initialized:', initialTheme);
    }
  }

  getInitialTheme(): boolean {
    if (!this.isBrowser) return false;
    
    // Check localStorage first
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }

    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark;
  }

  toggleDarkMode(): void {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    
    if (this.isBrowser) {
      localStorage.setItem('darkMode', newValue.toString());
      this.applyTheme(newValue);
      console.log('Dark Mode toggled to:', newValue);
    }
  }

  setDarkMode(isDark: boolean): void {
    this.darkModeSubject.next(isDark);
    
    if (this.isBrowser) {
      localStorage.setItem('darkMode', isDark.toString());
      this.applyTheme(isDark);
    }
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private applyTheme(isDark: boolean): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark-mode');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark-mode');
        root.style.colorScheme = 'light';
      }
      console.log('Theme applied. Dark mode:', isDark);
    }, 0);
  }
}
