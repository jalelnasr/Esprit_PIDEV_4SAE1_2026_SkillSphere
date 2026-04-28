import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bEmployeeService {
  private readonly base = '/b2b-api/employees';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Employee[]> { return this.http.get<Employee[]>(this.base); }
  getById(id: number): Observable<Employee> { return this.http.get<Employee>(`${this.base}/${id}`); }
  getByCompany(companyId: number): Observable<Employee[]> { return this.http.get<Employee[]>(`${this.base}/company/${companyId}`); }
  getByManager(managerId: number): Observable<Employee[]> { return this.http.get<Employee[]>(`${this.base}/manager/${managerId}`); }
  create(req: EmployeeRequest): Observable<Employee> { return this.http.post<Employee>(this.base, req); }
  update(id: number, req: EmployeeRequest): Observable<Employee> { return this.http.put<Employee>(`${this.base}/${id}`, req); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
