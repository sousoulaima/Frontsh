import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ModaliteReg {
  codeMod: string;
  designationmod: string;
  created_at?: string;
  updated_at?: string;
  reglement?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModaliteRegService {
  private apiUrl = 'http://localhost:8000/api/modalites'; // adapte l'URL selon tes routes

  constructor(private http: HttpClient) {}

  getAll(): Observable<ModaliteReg[]> {
    return this.http.get<ModaliteReg[]>(this.apiUrl);
  }

  getById(codemod: string): Observable<ModaliteReg> {
    return this.http.get<ModaliteReg>(`${this.apiUrl}/${codemod}`);
  }

  create(modalite: ModaliteReg): Observable<ModaliteReg> {
    return this.http.post<ModaliteReg>(this.apiUrl, modalite);
  }

  update(codemod: string, modalite: ModaliteReg): Observable<ModaliteReg> {
    return this.http.put<ModaliteReg>(`${this.apiUrl}/${codemod}`, modalite);
  }

  delete(codemod: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${codemod}`);
  }
}
