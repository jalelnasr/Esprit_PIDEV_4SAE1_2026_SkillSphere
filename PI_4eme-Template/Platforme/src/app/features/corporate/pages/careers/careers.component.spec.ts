import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CareersComponent } from './careers.component';
import { B2bJobOfferService } from '../../../../admin/b2b/services/job-offer.service';
import { JobOffer } from '../../../../admin/b2b/models/b2b.models';

describe('CareersComponent', () => {
  let component: CareersComponent;
  let fixture: ComponentFixture<CareersComponent>;
  let jobOfferService: jasmine.SpyObj<B2bJobOfferService>;

  const mockJobOffers: JobOffer[] = [
    {
      id: 1,
      title: 'Frontend Developer',
      description: 'Build React apps',
      companyId: 100,
      companyName: 'Tech Corp',
      contractType: 'CDI',
      location: 'Paris',
      requiredSkills: ['React', 'TypeScript'],
      status: 'OPEN',
      postedAt: '2024-01-15',
      applicationCount: 5
    },
    {
      id: 2,
      title: 'Backend Developer',
      description: 'Build APIs',
      companyId: 100,
      companyName: 'Tech Corp',
      contractType: 'CDD',
      location: 'Lyon',
      requiredSkills: ['Java', 'Spring'],
      status: 'OPEN',
      postedAt: '2024-01-16',
      applicationCount: 3
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      description: 'Manage infrastructure',
      companyId: 101,
      companyName: 'Cloud Inc',
      contractType: 'Freelance',
      location: 'Remote',
      requiredSkills: ['Docker', 'Kubernetes'],
      status: 'OPEN',
      postedAt: '2024-01-17',
      applicationCount: 2
    }
  ];

  beforeEach(async () => {
    const jobOfferServiceSpy = jasmine.createSpyObj('B2bJobOfferService', ['getOpen']);

    await TestBed.configureTestingModule({
      imports: [CareersComponent, HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [{ provide: B2bJobOfferService, useValue: jobOfferServiceSpy }]
    }).compileComponents();

    jobOfferService = TestBed.inject(B2bJobOfferService) as jasmine.SpyObj<B2bJobOfferService>;
    fixture = TestBed.createComponent(CareersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load job offers on init', () => {
      jobOfferService.getOpen.and.returnValue(of(mockJobOffers));
      fixture.detectChanges();
      expect(component.jobs).toEqual(mockJobOffers);
      expect(component.loading).toBe(false);
    });

    it('should handle error loading jobs', () => {
      jobOfferService.getOpen.and.returnValue(throwError(() => new Error('Server error')));
      fixture.detectChanges();
      expect(component.loading).toBe(false);
    });
  });

  describe('filter', () => {
    beforeEach(() => {
      jobOfferService.getOpen.and.returnValue(of(mockJobOffers));
      fixture.detectChanges();
    });

    it('should filter by search text', () => {
      component.search = 'frontend';
      component.filter();
      expect(component.filtered.length).toBe(1);
    });

    it('should filter by contract type', () => {
      component.contractFilter = 'CDI';
      component.filter();
      expect(component.filtered.length).toBe(1);
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      jobOfferService.getOpen.and.returnValue(of(mockJobOffers));
      fixture.detectChanges();
    });

    it('should calculate total pages correctly', () => {
      component.pageSize = 2;
      expect(component.totalPages).toBe(2);
    });

    it('should navigate to next page', () => {
      component.pageSize = 2;
      component.goToPage(2);
      expect(component.currentPage).toBe(2);
    });
  });

  describe('parseSkills', () => {
    it('should parse comma-separated skills', () => {
      const skills = component.parseSkills('React,TypeScript,Redux');
      expect(skills).toEqual(['React', 'TypeScript', 'Redux']);
    });

    it('should handle array input', () => {
      const skills = component.parseSkills(['React', 'TypeScript']);
      expect(skills).toEqual(['React', 'TypeScript']);
    });
  });
});
