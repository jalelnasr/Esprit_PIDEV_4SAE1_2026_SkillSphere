import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, concat, defaultIfEmpty, filter, map, of, take } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface RawGatewayUser {
  idUser?: number | string;
  userId?: number | string;
  id?: number | string;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: string;
  phone?: string | null;
  adresse?: string | null;
}

export interface CommunityProfileUser {
  idUser: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  phone: string;
  adresse: string;
}

@Injectable({ providedIn: 'root' })
export class CommunityProfileUserService {
  private readonly baseUrl = environment.apiUrl.replace(/\/+$/, '');

  constructor(private readonly http: HttpClient) {}

  getUserById(userId: number): Observable<CommunityProfileUser> {
    const endpoints = [
      `${this.baseUrl}/api/users/${userId}`,
      `${this.baseUrl}/api/users/admin/${userId}`,
      `${this.baseUrl}/users/${userId}`,
      `${this.baseUrl}/users/admin/${userId}`
    ];

    const attempts = endpoints.map((url) =>
      this.http.get<RawGatewayUser>(url, this.authOptions()).pipe(
        map((response) => this.normalize(response, userId)),
        catchError(() => of(null))
      )
    );

    return concat(...attempts).pipe(
      filter((user): user is CommunityProfileUser => user !== null),
      take(1),
      defaultIfEmpty(this.emptyUser(userId))
    );
  }

  private normalize(raw: RawGatewayUser, fallbackId: number): CommunityProfileUser | null {
    const id = this.asNumber(raw.idUser ?? raw.userId ?? raw.id) ?? fallbackId;
    const nom = (raw.nom ?? '').trim();
    const prenom = (raw.prenom ?? '').trim();

    if (!nom && !prenom && !raw.email) {
      return null;
    }

    return {
      idUser: id,
      nom,
      prenom,
      email: (raw.email ?? '').trim(),
      role: (raw.role ?? '').trim(),
      phone: (raw.phone ?? '').trim(),
      adresse: (raw.adresse ?? '').trim()
    };
  }

  private emptyUser(userId: number): CommunityProfileUser {
    return {
      idUser: userId,
      nom: '',
      prenom: '',
      email: '',
      role: '',
      phone: '',
      adresse: ''
    };
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
