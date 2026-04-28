import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract, ContractRequest } from '../models/b2b.models';

@Injectable({ providedIn: 'root' })
export class B2bContractService {
  private readonly base = '/b2b-api/contracts';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Contract[]> { return this.http.get<Contract[]>(this.base); }
  getById(id: number): Observable<Contract> { return this.http.get<Contract>(`${this.base}/${id}`); }
  getByCompany(companyId: number): Observable<Contract[]> { return this.http.get<Contract[]>(`${this.base}/company/${companyId}`); }
  getByCandidate(candidateId: number): Observable<Contract[]> { return this.http.get<Contract[]>(`${this.base}/candidate/${candidateId}`); }
  create(req: ContractRequest): Observable<Contract> { return this.http.post<Contract>(this.base, req); }
  sign(id: number): Observable<Contract> { return this.http.put<Contract>(`${this.base}/${id}/sign`, null); }
  signWithSignature(id: number, signatureData: string): Observable<Contract> { 
    return this.http.put<Contract>(`${this.base}/${id}/sign-with-data`, { signatureData }); 
  }
  updateStatus(id: number, status: string): Observable<Contract> {
    return this.http.put<Contract>(`${this.base}/${id}/status`, null, { params: new HttpParams().set('status', status) });
  }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
}
