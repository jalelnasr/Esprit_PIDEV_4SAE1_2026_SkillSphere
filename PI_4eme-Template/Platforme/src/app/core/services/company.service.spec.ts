import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CompanyService, Company } from './company.service';
import { environment } from '../../../environments/environment';

describe('CompanyService', () => {
  let service: CompanyService;
  let httpMock: HttpTestingController;

  const mockCompanies: Company[] = [
    { id: 1, name: 'Company A', sector: 'IT', address: '123 Main St' },
    { id: 2, name: 'Company B', sector: 'Finance', address: '456 Oak Ave' },
    { id: 3, name: 'Company C', sector: 'Healthcare', address: '789 Pine Rd' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CompanyService]
    });

    service = TestBed.inject(CompanyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should retrieve all companies', (done) => {
      service.getAll().subscribe(companies => {
        expect(companies).toEqual(mockCompanies);
        expect(companies.length).toBe(3);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/companies`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCompanies);
    });

    it('should handle empty company list', (done) => {
      service.getAll().subscribe(companies => {
        expect(companies).toEqual([]);
        expect(companies.length).toBe(0);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/companies`);
      req.flush([]);
    });

    it('should handle error when retrieving companies', (done) => {
      service.getAll().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/companies`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getById', () => {
    it('should retrieve a single company by id', (done) => {
      const companyId = 1;
      const expectedCompany = mockCompanies[0];

      service.getById(companyId).subscribe(company => {
        expect(company).toEqual(expectedCompany);
        expect(company.id).toBe(companyId);
        expect(company.name).toBe('Company A');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/companies/${companyId}`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedCompany);
    });

    it('should handle 404 when company not found', (done) => {
      const companyId = 999;

      service.getById(companyId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/companies/${companyId}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle different company ids', (done) => {
      const companyId = 2;
      const expectedCompany = mockCompanies[1];

      service.getById(companyId).subscribe(company => {
        expect(company).toEqual(expectedCompany);
        expect(company.name).toBe('Company B');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/companies/${companyId}`);
      req.flush(expectedCompany);
    });
  });

  describe('API endpoint construction', () => {
    it('should use correct base URL from environment', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/companies`);
      expect(req.request.url).toContain(environment.apiUrl);
      req.flush([]);
    });

    it('should construct correct URL for getById', () => {
      const testId = 42;
      service.getById(testId).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/companies/${testId}`);
      expect(req.request.url).toBe(`${environment.apiUrl}/companies/${testId}`);
      req.flush(mockCompanies[0]);
    });
  });
});
