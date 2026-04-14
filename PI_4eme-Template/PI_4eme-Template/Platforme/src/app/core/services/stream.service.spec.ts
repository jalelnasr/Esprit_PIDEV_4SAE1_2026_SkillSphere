import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StreamService, StreamData } from './stream.service';
import { environment } from '../../../environments/environment';

describe('StreamService', () => {
  let service: StreamService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.competitionsApiUrl}/stream`;

  const mockStream: StreamData = {
    id: 1,
    competitionId: 39,
    streamUrl: 'https://www.youtube.com/watch?v=abc123',
    embedUrl: 'https://www.youtube.com/embed/abc123?autoplay=1',
    platform: 'YOUTUBE',
    title: 'Live Hackathon',
    status: 'LIVE',
    startedAt: '2026-04-13T10:00:00',
    stoppedAt: null!,
    autoExpireHours: 2,
    isLive: true,
    canWatch: true,
    isParticipant: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StreamService]
    });
    service = TestBed.inject(StreamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===== Tests HTTP =====

  it('getStream() should call GET and return stream data', () => {
    service.getStream(39).subscribe(stream => {
      expect(stream).toEqual(mockStream);
      expect(stream.status).toBe('LIVE');
      expect(stream.platform).toBe('YOUTUBE');
    });

    const req = httpMock.expectOne(`${apiUrl}/competition/39`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStream);
  });

  it('startStream() should call PUT to start stream', () => {
    const startedStream = { ...mockStream, status: 'LIVE' as const };

    service.startStream(39).subscribe(stream => {
      expect(stream.status).toBe('LIVE');
    });

    const req = httpMock.expectOne(`${apiUrl}/competition/39/start`);
    expect(req.request.method).toBe('PUT');
    req.flush(startedStream);
  });

  it('stopStream() should call PUT to stop stream', () => {
    const stoppedStream = { ...mockStream, status: 'OFFLINE' as const, isLive: false };

    service.stopStream(39).subscribe(stream => {
      expect(stream.status).toBe('OFFLINE');
    });

    const req = httpMock.expectOne(`${apiUrl}/competition/39/stop`);
    expect(req.request.method).toBe('PUT');
    req.flush(stoppedStream);
  });

  it('createStream() should call POST with stream data', () => {
    const newStreamData = { streamUrl: 'https://youtu.be/xyz', title: 'Test', autoExpireHours: 3 };

    service.createStream(39, newStreamData).subscribe(stream => {
      expect(stream.competitionId).toBe(39);
    });

    const req = httpMock.expectOne(`${apiUrl}/competition/39`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStreamData);
    req.flush(mockStream);
  });

  it('deleteStream() should call DELETE', () => {
    service.deleteStream(39).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/competition/39`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ===== Tests logique métier: getPlatformIcon =====

  it('getPlatformIcon() should return correct icon for YOUTUBE', () => {
    expect(service.getPlatformIcon('YOUTUBE')).toBe('▶️');
  });

  it('getPlatformIcon() should return correct icon for TWITCH', () => {
    expect(service.getPlatformIcon('TWITCH')).toBe('🎮');
  });

  it('getPlatformIcon() should return correct icon for ZOOM', () => {
    expect(service.getPlatformIcon('ZOOM')).toBe('📹');
  });

  it('getPlatformIcon() should return default icon for unknown platform', () => {
    expect(service.getPlatformIcon('UNKNOWN')).toBe('🔴');
  });

  it('getPlatformIcon() should return correct icon for DISCORD', () => {
    expect(service.getPlatformIcon('DISCORD')).toBe('💬');
  });
});
