import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Societe {
  codesoc: string;
  nom: string;
  adresse: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocieteService {
  private apiUrl = 'http://localhost:8000/api/societes'; // adapte l'URL selon ta route Laravel

  constructor(private http: HttpClient) {}

  getAll(): Observable<Societe[]> {
    return this.http.get<Societe[]>(this.apiUrl);
  }

  getById(id: string): Observable<Societe> {
    return this.http.get<Societe>(`${this.apiUrl}/${id}`);
  }

  create(societe: Societe): Observable<Societe> {
    return this.http.post<Societe>(this.apiUrl, societe);
  }

  update(id: string, societe: Societe): Observable<Societe> {
    return this.http.put<Societe>(`${this.apiUrl}/${id}`, societe);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
