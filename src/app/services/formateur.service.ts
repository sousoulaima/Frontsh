import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Formateur {
  codefor?: number | string;
  nomfor: string;
  prenomfor: string;
  telfor?: string;
  emailfor?: string;
  adrfor?: string;//specialité
  created_at?: string;
  updated_at?: string;
  // Ajoute ici d'autres champs selon ton modèle Laravel
}

@Injectable({
  providedIn: 'root'
})
export class FormateurService {
  private apiUrl = 'http://localhost:8000/api/formateurs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Formateur[]> {
    return this.http.get<Formateur[]>(this.apiUrl);
  }

  getById(id: number | string): Observable<Formateur> {
    return this.http.get<Formateur>(`${this.apiUrl}/${id}`);
  }

  create(data: Formateur): Observable<Formateur> {
    return this.http.post<Formateur>(this.apiUrl, data);
  }

  update(id: number | string, data: Formateur): Observable<Formateur> {
    return this.http.put<Formateur>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
