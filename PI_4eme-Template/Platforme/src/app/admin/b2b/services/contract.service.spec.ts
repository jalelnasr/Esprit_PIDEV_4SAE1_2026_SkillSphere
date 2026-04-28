import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { B2bContractService } from './contract.service';
import { Contract, ContractRequest } from '../models/b2b.models';

describe('B2bContractService', () => {
  let service: B2bContractService;
  let httpMock: HttpTestingController;

  const mockContracts: Contract[] = [
    {
      id: 1,
      contractNumber: 'CTR-2024-001',
      missionId: 10,
      missionTitle: 'Frontend Developer',
      candidateId: 20,
      freelancerName: 'John Doe',
      companyId: 100,
      companyName: 'Tech Corp',
      amount: 60000,
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      contractUrl: 'http://example.com/contract1.pdf',
      status: 'SIGNED',
      signedAt: '2024-01-25'
    },
    {
      id: 2,
      contractNumber: 'CTR-2024-002',
      missionId: 11,
      missionTitle: 'Backend Developer',
      candidateId: 21,
      freelancerName: 'Jane Smith',
      companyId: 100,
      companyName: 'Tech Corp',
      amount: 55000,
      startDate: '2024-03-01',
      endDate: '2024-06-01',
      contractUrl: 'http://example.com/contract2.pdf',
      status: 'DRAFT',
      signedAt: null
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [B2bContractService]
    });

    service = TestBed.inject(B2bContractService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should retrieve all contracts', (done) => {
      service.getAll().subscribe(contracts => {
        expect(contracts).toEqual(mockContracts);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/contracts');
      req.flush(mockContracts);
    });
  });

  describe('getById', () => {
    it('should retrieve a single contract by id', (done) => {
      service.getById(1).subscribe(contract => {
        expect(contract).toEqual(mockContracts[0]);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/contracts/1');
      req.flush(mockContracts[0]);
    });
  });

  describe('create', () => {
    it('should create a new contract', (done) => {
      const newContract: ContractRequest = {
        missionId: 12,
        candidateId: 22,
        companyId: 100,
        totalAmount: 70000,
        startDate: '2024-04-01',
        endDate: '2024-07-01'
      };

      const createdContract: Contract = {
        id: 3,
        contractNumber: 'CTR-2024-003',
        missionId: 12,
        missionTitle: 'DevOps Engineer',
        candidateId: 22,
        freelancerName: 'Bob Johnson',
        companyId: 100,
        companyName: 'Tech Corp',
        amount: 70000,
        startDate: '2024-04-01',
        endDate: '2024-07-01',
        contractUrl: 'http://example.com/contract3.pdf',
        status: 'DRAFT',
        signedAt: null
      };

      service.create(newContract).subscribe(contract => {
        expect(contract.id).toBe(3);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/contracts');
      req.flush(createdContract);
    });
  });

  describe('sign', () => {
    it('should sign a contract', (done) => {
      const signedContract = { ...mockContracts[1], status: 'SIGNED' as const, signedAt: '2024-01-20' };

      service.sign(2).subscribe(contract => {
        expect(contract.status).toBe('SIGNED');
        done();
      });

      const req = httpMock.expectOne('/b2b-api/contracts/2/sign');
      req.flush(signedContract);
    });
  });

  describe('delete', () => {
    it('should delete a contract', (done) => {
      service.delete(1).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/contracts/1');
      req.flush(null);
    });
  });
});
