import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

type ListResponse<T> = T[] | { data?: T[]; items?: T[]; content?: T[] };

export interface CommunityPage<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export abstract class CommunityBaseService {
  protected readonly communityBaseUrl = this.buildCommunityBaseUrl();

  protected authOptions(): { headers: HttpHeaders } {
    return { headers: this.buildAuthHeaders() };
  }

  protected extractList<T>(response: ListResponse<T>): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.items)) {
      return response.items;
    }

    if (Array.isArray(response.content)) {
      return response.content;
    }

    return [];
  }

  protected extractEntity<T>(response: unknown, keys: string[]): T {
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const record = response as Record<string, unknown>;
      for (const key of keys) {
        if (record[key] !== undefined) {
          return record[key] as T;
        }
      }
    }

    return response as T;
  }

  protected extractPage<T>(response: unknown, fallbackPage: number, fallbackSize: number): CommunityPage<T> {
    const normalizedPage = Number.isFinite(fallbackPage) && fallbackPage > 0 ? Math.floor(fallbackPage) : 1;
    const normalizedSize = Number.isFinite(fallbackSize) && fallbackSize > 0 ? Math.floor(fallbackSize) : 5;

    const objectResponse = response && typeof response === 'object' && !Array.isArray(response)
      ? (response as Record<string, unknown>)
      : null;

    const list = this.extractListFromUnknown<T>(response);
    const nestedData = objectResponse?.['data'];
    const nestedRecord = nestedData && typeof nestedData === 'object' && !Array.isArray(nestedData)
      ? (nestedData as Record<string, unknown>)
      : null;

    const candidateRecords: Record<string, unknown>[] = [];
    if (objectResponse) {
      candidateRecords.push(objectResponse);
    }
    if (nestedRecord) {
      candidateRecords.push(nestedRecord);
    }

    const totalItems = this.pickNumber(candidateRecords, [
      'totalItems',
      'totalElements',
      'total',
      'count',
      'totalCount'
    ]) ?? list.length;

    const totalPages =
      this.pickNumber(candidateRecords, ['totalPages', 'pages', 'pageCount', 'lastPage']) ??
      Math.max(1, Math.ceil(totalItems / normalizedSize));

    let currentPage =
      this.pickNumber(candidateRecords, ['currentPage', 'page', 'pageNumber', 'number', 'pageIndex']) ??
      normalizedPage;

    const pageSize =
      this.pickNumber(candidateRecords, ['pageSize', 'size', 'limit', 'perPage']) ?? normalizedSize;

    if (currentPage === 0 && totalPages > 0) {
      currentPage = 1;
    }

    if (currentPage < 1) {
      currentPage = 1;
    }

    return {
      data: list,
      totalItems: Math.max(0, totalItems),
      totalPages: Math.max(1, totalPages),
      currentPage,
      pageSize: Math.max(1, pageSize)
    };
  }

  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const backendMessage =
        typeof error.error === 'string'
          ? error.error
          : (
              (error.error as { message?: string; error?: string; detail?: string; title?: string } | null)?.message ??
              (error.error as { error?: string } | null)?.error ??
              (error.error as { detail?: string } | null)?.detail ??
              (error.error as { title?: string } | null)?.title
            );

      const authHint =
        error.status === 401
          ? 'Unauthorized. Please log in again.'
          : error.status === 403
            ? 'Access denied.'
            : null;

      const gatewayHint =
        error.status === 404 &&
        typeof error.url === 'string' &&
        error.url.includes('/api/community/')
          ? 'Gateway route is missing RewritePath (/api/community/** -> /api/**)'
          : null;

      const message = backendMessage || authHint || gatewayHint || `${operation} failed`;
      console.error(`[Community API] ${operation}`, error);
      return throwError(() => new Error(message));
    };
  }

  protected currentUserId(): number {
    const userIdFromStorage = this.readUserIdFromStorage();
    if (userIdFromStorage !== null) {
      return userIdFromStorage;
    }

    const token = this.getToken();
    if (!token) {
      throw new Error('JWT token is missing from localStorage');
    }

    const userIdFromToken = this.readUserIdFromToken(token);
    if (userIdFromToken !== null) {
      return userIdFromToken;
    }

    throw new Error('Unable to resolve current user id from JWT/localStorage');
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private buildCommunityBaseUrl(): string {
    const configured = this.readEnvironmentValue('communityApiUrl') ?? environment.apiUrl;
    const baseUrl = configured.replace(/\/+$/, '');

    if (baseUrl.endsWith('/api/community')) {
      return baseUrl;
    }

    if (baseUrl.endsWith('/api')) {
      return `${baseUrl}/community`;
    }

    return `${baseUrl}/api/community`;
  }

  private readEnvironmentValue(key: string): string | null {
    const value = (environment as Record<string, unknown>)[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem('token');
  }

  private readUserIdFromStorage(): number | null {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return this.pickNumericId(parsed, ['idUser', 'userId', 'id']);
    } catch {
      return null;
    }
  }

  private readUserIdFromToken(token: string): number | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payload = this.base64UrlDecode(parts[1]);
      const parsed = JSON.parse(payload) as Record<string, unknown>;
      return this.pickNumericId(parsed, ['idUser', 'userId', 'id', 'sub']);
    } catch {
      return null;
    }
  }

  private base64UrlDecode(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  private pickNumericId(data: Record<string, unknown>, keys: string[]): number | null {
    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return null;
  }

  private extractListFromUnknown<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const record = response as Record<string, unknown>;
    const direct = this.extractList(record as ListResponse<T>);
    if (direct.length > 0) {
      return direct;
    }

    const data = record['data'];
    if (Array.isArray(data)) {
      return data as T[];
    }

    if (data && typeof data === 'object') {
      const nested = this.extractList(data as ListResponse<T>);
      if (nested.length > 0) {
        return nested;
      }

      const nestedRecord = data as Record<string, unknown>;
      const candidates = ['results', 'rows', 'list', 'records'];
      for (const key of candidates) {
        const value = nestedRecord[key];
        if (Array.isArray(value)) {
          return value as T[];
        }
      }
    }

    for (const key of ['results', 'rows', 'list', 'records']) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }

    return [];
  }

  private pickNumber(recordCandidates: Record<string, unknown>[], keys: string[]): number | null {
    for (const record of recordCandidates) {
      for (const key of keys) {
        const raw = record[key];
        if (typeof raw === 'number' && Number.isFinite(raw)) {
          return raw;
        }

        if (typeof raw === 'string' && raw.trim().length > 0) {
          const parsed = Number(raw);
          if (Number.isFinite(parsed)) {
            return parsed;
          }
        }
      }
    }

    return null;
  }
}
