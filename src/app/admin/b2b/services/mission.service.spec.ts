import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { B2bMissionService } from './mission.service';
import { Mission, MissionRequest, MissionApplyRequest, MissionApplication } from '../models/b2b.models';

describe('B2bMissionService', () => {
  let service: B2bMissionService;
  let httpMock: HttpTestingController;

  const mockMissions: Mission[] = [
    {
      id: 1,
      title: 'Frontend Developer',
      description: 'Build React apps',
      companyId: 100,
      companyName: 'Tech Corp',
      status: 'OPEN',
      dailyRate: 500,
      durationWeeks: 12,
      requiredSkills: 'React,TypeScript',
      applicationCount: 5
    },
    {
      id: 2,
      title: 'Backend Developer',
      description: 'Build APIs',
      companyId: 100,
      companyName: 'Tech Corp',
      status: 'OPEN',
      dailyRate: 550,
      durationWeeks: 8,
      requiredSkills: 'Java,Spring',
      applicationCount: 3
    }
  ];

  const mockApplications: MissionApplication[] = [
    {
      id: 1,
      missionId: 1,
      missionTitle: 'Frontend Developer',
      candidateId: 10,
      candidateTitle: 'Senior Frontend Developer',
      status: 'PENDING',
      proposedRate: 480,
      appliedAt: '2024-01-15'
    },
    {
      id: 2,
      missionId: 1,
      missionTitle: 'Frontend Developer',
      candidateId: 11,
      candidateTitle: 'Full Stack Developer',
      status: 'ACCEPTED',
      proposedRate: 500,
      appliedAt: '2024-01-16'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [B2bMissionService]
    });

    service = TestBed.inject(B2bMissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should retrieve all missions', (done) => {
      service.getAll().subscribe(missions => {
        expect(missions).toEqual(mockMissions);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/missions');
      req.flush(mockMissions);
    });
  });

  describe('getOpen', () => {
    it('should retrieve only open missions', (done) => {
      service.getOpen().subscribe(missions => {
        expect(missions).toEqual(mockMissions);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/missions/open');
      req.flush(mockMissions);
    });
  });

  describe('getById', () => {
    it('should retrieve a single mission by id', (done) => {
      service.getById(1).subscribe(mission => {
        expect(mission).toEqual(mockMissions[0]);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/missions/1');
      req.flush(mockMissions[0]);
    });
  });

  describe('create', () => {
    it('should create a new mission', (done) => {
      const newMission: MissionRequest = {
        title: 'DevOps Engineer',
        description: 'Manage infrastructure',
        companyId: 100,
        dailyRate: 600,
        durationWeeks: 10,
        requiredSkills: 'Docker,Kubernetes'
      };

      const createdMission: Mission = {
        id: 3,
        ...newMission,
        companyName: 'Tech Corp',
        status: 'OPEN',
        applicationCount: 0
      };

      service.create(newMission).subscribe(mission => {
        expect(mission.id).toBe(3);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/missions');
      req.flush(createdMission);
    });
  });

  describe('apply', () => {
    it('should apply to a mission', (done) => {
      const applyRequest: MissionApplyRequest = {
        missionId: 1,
        candidateId: 12,
        proposedRate: 490
      };

      const application: MissionApplication = {
        id: 3,
        missionId: 1,
        missionTitle: 'Frontend Developer',
        candidateId: 12,
        candidateTitle: 'Junior Frontend Developer',
        status: 'PENDING',
        proposedRate: 490,
        appliedAt: '2024-01-20'
      };

      service.apply(applyRequest).subscribe(app => {
        expect(app.status).toBe('PENDING');
        done();
      });

      const req = httpMock.expectOne('/b2b-api/missions/apply');
      req.flush(application);
    });
  });

  describe('getApplications', () => {
    it('should retrieve applications for a mission', (done) => {
      service.getApplications(1).subscribe(apps => {
        expect(apps).toEqual(mockApplications);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/missions/1/applications');
      req.flush(mockApplications);
    });
  });

  describe('delete', () => {
    it('should delete a mission', (done) => {
      service.delete(1).subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const req = httpMock.expectOne('/b2b-api/missions/1');
      req.flush(null);
    });
  });
});
