import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MyCompanyComponent } from './my-company.component';
import { AuthService } from '../../../../core/services/auth.service';
import { B2bCompanyService } from '../../../../admin/b2b/services/company.service';
import { B2bEmployeeService } from '../../../../admin/b2b/services/employee.service';
import { B2bAssignmentService } from '../../../../admin/b2b/services/assignment.service';
import { Company, Employee, Assignment } from '../../../../admin/b2b/models/b2b.models';
import { BackendUser } from '../../../../core/models/auth.model';

describe('MyCompanyComponent', () => {
  let component: MyCompanyComponent;
  let fixture: ComponentFixture<MyCompanyComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let companyService: jasmine.SpyObj<B2bCompanyService>;
  let employeeService: jasmine.SpyObj<B2bEmployeeService>;
  let assignmentService: jasmine.SpyObj<B2bAssignmentService>;

  const mockUser: BackendUser = {
    idUser: 1,
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: 'ADMIN',
    companyId: 100
  };

  const mockCompany: Company = {
    id: 100,
    name: 'Tech Corp',
    sector: 'IT',
    address: '123 Main St',
    email: 'contact@techcorp.com',
    phone: '+33123456789',
    siret: '12345678901234',
    creditsRemaining: 500,
    createdBy: 1,
    createdAt: '2023-01-01',
    employeeCount: 2
  };

  const mockEmployees: Employee[] = [
    { id: 1, companyId: 100, companyName: 'Tech Corp', department: 'IT', position: 'Developer', managerId: null, hireDate: '2023-01-15' },
    { id: 2, companyId: 100, companyName: 'Tech Corp', department: 'HR', position: 'Manager', managerId: null, hireDate: '2023-02-01' }
  ];

  const mockAssignments: Assignment[] = [
    {
      id: 1,
      employeeId: 1,
      companyId: 100,
      packId: 10,
      packName: 'Web Development',
      courseName: 'React Basics',
      status: 'IN_PROGRESS',
      progressPercent: 60,
      deadline: '2024-06-01'
    },
    {
      id: 2,
      employeeId: 2,
      companyId: 100,
      packId: 11,
      packName: 'Management',
      courseName: 'Leadership Skills',
      status: 'COMPLETED',
      progressPercent: 100,
      deadline: '2024-05-01'
    }
  ];

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentUser$: of(mockUser) });
    const companyServiceSpy = jasmine.createSpyObj('B2bCompanyService', ['getById']);
    const employeeServiceSpy = jasmine.createSpyObj('B2bEmployeeService', ['getByCompany', 'getAll']);
    const assignmentServiceSpy = jasmine.createSpyObj('B2bAssignmentService', ['getByCompany']);

    await TestBed.configureTestingModule({
      imports: [MyCompanyComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: B2bCompanyService, useValue: companyServiceSpy },
        { provide: B2bEmployeeService, useValue: employeeServiceSpy },
        { provide: B2bAssignmentService, useValue: assignmentServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    companyService = TestBed.inject(B2bCompanyService) as jasmine.SpyObj<B2bCompanyService>;
    employeeService = TestBed.inject(B2bEmployeeService) as jasmine.SpyObj<B2bEmployeeService>;
    assignmentService = TestBed.inject(B2bAssignmentService) as jasmine.SpyObj<B2bAssignmentService>;

    fixture = TestBed.createComponent(MyCompanyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load company data when user has companyId', () => {
      companyService.getById.and.returnValue(of(mockCompany));
      employeeService.getByCompany.and.returnValue(of(mockEmployees));
      assignmentService.getByCompany.and.returnValue(of(mockAssignments));

      fixture.detectChanges();

      expect(component.company).toEqual(mockCompany);
      expect(component.loading).toBe(false);
    });

    it('should calculate completed count correctly', () => {
      companyService.getById.and.returnValue(of(mockCompany));
      employeeService.getByCompany.and.returnValue(of(mockEmployees));
      assignmentService.getByCompany.and.returnValue(of(mockAssignments));

      fixture.detectChanges();

      expect(component.completedCount).toBe(1);
    });
  });

  describe('getInitials', () => {
    it('should return employee initials', () => {
      const initials = component.getInitials(mockEmployees[0]);
      expect(initials).toBe('E1');
    });
  });

  describe('getAvatarColor', () => {
    it('should return gradient string', () => {
      const color = component.getAvatarColor(mockEmployees[0]);
      expect(color).toContain('linear-gradient');
    });
  });
});
