import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, concat, defaultIfEmpty, filter, forkJoin, map, of, shareReplay, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface BackendUserResponse {
  idUser?: number | string;
  userId?: number | string;
  nom?: string;
  prenom?: string;
  fullName?: string;
  name?: string;
}

export interface CommunityUserDisplay {
  userId: number;
  fullName: string;
  initials: string;
}

@Injectable({ providedIn: 'root' })
export class CommunityUserDirectoryService {
  private readonly baseUrl = environment.apiUrl.replace(/\/+$/, '');
  private readonly cache = new Map<number, CommunityUserDisplay>();
  private readonly inflight = new Map<number, Observable<CommunityUserDisplay>>();

  constructor(private readonly http: HttpClient) {
    this.seedCurrentUser();
  }

  resolveUser(userId: number): Observable<CommunityUserDisplay> {
    if (!Number.isFinite(userId) || userId <= 0) {
      return of(this.fallbackUser(userId));
    }

    const cached = this.cache.get(userId);
    if (cached && !this.isFallbackName(cached.fullName, userId)) {
      return of(cached);
    }

    const pending = this.inflight.get(userId);
    if (pending) {
      return pending;
    }

    const request$ = this.fetchUser(userId).pipe(
      tap((user) => {
        if (!this.isFallbackName(user.fullName, userId)) {
          this.cache.set(userId, user);
        }
      }),
      tap({ complete: () => this.inflight.delete(userId) }),
      shareReplay(1)
    );

    this.inflight.set(userId, request$);
    return request$;
  }

  resolveUsers(userIds: number[]): Observable<Map<number, CommunityUserDisplay>> {
    const ids = Array.from(new Set(userIds.filter((id) => Number.isFinite(id) && id > 0)));
    if (ids.length === 0) {
      return of(new Map<number, CommunityUserDisplay>());
    }

    return forkJoin(ids.map((id) => this.resolveUser(id))).pipe(
      map((users) => {
        const byId = new Map<number, CommunityUserDisplay>();
        users.forEach((user) => byId.set(user.userId, user));
        return byId;
      })
    );
  }

  getCachedDisplay(userId: number): CommunityUserDisplay | null {
    return this.cache.get(userId) ?? null;
  }

  private fetchUser(userId: number): Observable<CommunityUserDisplay> {
    const candidateUrls = this.userLookupEndpoints(userId);
    const attempts = candidateUrls.map((url) =>
      this.http.get<BackendUserResponse>(url, this.authOptions()).pipe(
        map((response) => this.toDisplay(response, userId)),
        catchError(() => of(null)),
        filter((user): user is CommunityUserDisplay => user !== null)
      )
    );

    return concat(...attempts).pipe(take(1), defaultIfEmpty(this.fallbackUser(userId)));
  }

  private userLookupEndpoints(userId: number): string[] {
    return [
      `${this.baseUrl}/api/users/${userId}`,
      `${this.baseUrl}/api/users/admin/${userId}`,
      `${this.baseUrl}/users/admin/${userId}`,
      `${this.baseUrl}/users/${userId}`
    ];
  }

  private toDisplay(response: BackendUserResponse, fallbackId: number): CommunityUserDisplay | null {
    const rawId = response.idUser ?? response.userId;
    const parsedId = this.asNumber(rawId) ?? fallbackId;

    const nom = (response.nom ?? '').trim();
    const prenom = (response.prenom ?? '').trim();
    const composed = `${prenom} ${nom}`.trim();
    const fullName = composed || (response.fullName ?? '').trim() || (response.name ?? '').trim();
    if (!fullName) {
      return null;
    }

    return {
      userId: parsedId,
      fullName,
      initials: this.computeInitials(fullName, parsedId)
    };
  }

  private fallbackUser(userId: number): CommunityUserDisplay {
    return {
      userId,
      fullName: `User #${userId}`,
      initials: this.computeInitials('', userId)
    };
  }

  private isFallbackName(fullName: string, userId: number): boolean {
    return fullName.trim() === `User #${userId}`;
  }

  private computeInitials(fullName: string, fallbackId: number): string {
    const value = fullName.trim();
    if (!value) {
      return `U${fallbackId}`;
    }

    const initials = value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || `U${fallbackId}`;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private seedCurrentUser(): void {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    const raw = localStorage.getItem('user');
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as BackendUserResponse;
      const userId = this.asNumber(parsed.idUser ?? parsed.userId);
      if (userId === null) {
        return;
      }

      const display = this.toDisplay(parsed, userId) ?? this.fallbackUser(userId);
      this.cache.set(userId, display);
    } catch {
      // Ignore malformed localStorage payload
    }
  }

  private authOptions(): { headers?: HttpHeaders } {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return {};
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return {};
    }

    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }
}
