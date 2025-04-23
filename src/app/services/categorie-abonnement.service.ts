import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategorieAbonnement {
  codecateg?: string;
  nomcateg: string;
  description?: string;
  designationcateg?: string;
  abonnements?: any[]; // Relations optionnelles
}

@Injectable({
  providedIn: 'root'
})
export class CategorieAbonnementService {
  private apiUrl = 'http://localhost:8000/api/categorie-abonnements';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CategorieAbonnement[]> {
    return this.http.get<CategorieAbonnement[]>(this.apiUrl);
  }

  getById(id: number | string): Observable<CategorieAbonnement> {
    return this.http.get<CategorieAbonnement>(`${this.apiUrl}/${id}`);
  }

  create(data: CategorieAbonnement): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number | string, data: CategorieAbonnement): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
