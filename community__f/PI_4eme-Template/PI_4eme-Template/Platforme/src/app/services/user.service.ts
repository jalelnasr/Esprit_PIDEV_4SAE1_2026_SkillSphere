import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UserService {


   private apiBaseUrl = this.buildApiBaseUrl();

  constructor(private http: HttpClient) { }

  login(data: any) {
    return this.http.post(`${this.apiBaseUrl}/users/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.apiBaseUrl}/users/register`, data);
  }

  getUsers() {
    return this.http.get(`${this.apiBaseUrl}/users`);
  }

  private buildApiBaseUrl(): string {
    const base = environment.apiUrl.replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }

}
