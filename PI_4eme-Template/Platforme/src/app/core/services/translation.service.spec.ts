import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        TranslationService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== CHANGE LANGUAGE =====

  it('changeLanguage() should change to French', () => {
    service.changeLanguage('fr');
    expect(translateService.currentLang).toBe('fr');
  });

  it('changeLanguage() should change to English', () => {
    service.changeLanguage('en');
    expect(translateService.currentLang).toBe('en');
  });

  it('changeLanguage() should change to Arabic', () => {
    service.changeLanguage('ar');
    expect(translateService.currentLang).toBe('ar');
  });

  it('changeLanguage() should save language to localStorage', () => {
    service.changeLanguage('en');
    expect(localStorage.getItem('selectedLanguage')).toBe('en');
  });

  it('changeLanguage() to Arabic should set RTL direction', () => {
    service.changeLanguage('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('changeLanguage() to French should set LTR direction', () => {
    service.changeLanguage('fr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('fr');
  });

  it('changeLanguage() to English should set LTR direction', () => {
    service.changeLanguage('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });

  // ===== GET CURRENT LANGUAGE =====

  it('getCurrentLanguage() should return current language', () => {
    service.changeLanguage('en');
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('getCurrentLanguage() should return fr after changing to fr', () => {
    service.changeLanguage('fr');
    expect(service.getCurrentLanguage()).toBe('fr');
  });

  // ===== AVAILABLE LANGUAGES =====

  it('should have fr, en, ar as available languages', () => {
    const langs = translateService.getLangs();
    expect(langs).toContain('fr');
    expect(langs).toContain('en');
    expect(langs).toContain('ar');
  });

  it('should have fr as default language', () => {
    expect(translateService.getDefaultLang()).toBe('fr');
  });
});
