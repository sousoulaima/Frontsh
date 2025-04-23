import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalleFormation {
  codesalle?: number;
  designationsalle: string;
  capacitesalle: number;
  prives_n: boolean;
  prives_j: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SalleFormationService {
  private apiUrl = 'http://localhost:8000/api/salle-formations'; // adapte l’URL si besoin

  constructor(private http: HttpClient) {}

  getAll(): Observable<SalleFormation[]> {
    return this.http.get<SalleFormation[]>(this.apiUrl);
  }

  getById(codesalle: number): Observable<SalleFormation> {
    return this.http.get<SalleFormation>(`${this.apiUrl}/${codesalle}`);
  }

  create(salle: SalleFormation): Observable<SalleFormation> {
    return this.http.post<SalleFormation>(this.apiUrl, salle);
  }

  update(codesalle: number, salle: SalleFormation): Observable<SalleFormation> {
    return this.http.put<SalleFormation>(`${this.apiUrl}/${codesalle}`, salle);
  }

  delete(codesalle: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${codesalle}`);
  }
}
