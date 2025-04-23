import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Reglement {
  codereg: number;
  datereg: string; // Format ISO 8601: "2025-04-20T00:00:00.000000Z"
  mtreg: string;
  numchq?: string; // Le "?" indique que ce champ est optionnel
  numtraite?: string; // Le "?" indique que ce champ est optionnel
  commentaire?: string; // Le "?" indique que ce champ est optionnel
  abonnement_codeabo: number;
  abonnement: Abonnement;
}

interface Abonnement {
  codeabo: number;
  dateabo: string; // Format ISO 8601: "2025-04-19T00:00:00.000000Z"
  totalhtabo: string;
  totalremise: string;
  totalht: string;
  totalttc: string;
  solde: boolean;
  restepaye: string;
  mtpaye: string;
  datedeb: string; // Format ISO 8601: "2025-04-19T00:00:00.000000Z"
  datefin: string; // Format ISO 8601: "2026-04-19T00:00:00.000000Z"
  adherent_code: number;
  type_abonnement_code: number;
  categorie_abonnement_codecateg: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReglementService {
  private apiUrl = 'http://localhost:8000/api/reglements'; // adapte si besoin

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reglement[]> {
    return this.http.get<Reglement[]>(this.apiUrl);
  }

  getById(id: string): Observable<Reglement> {
    return this.http.get<Reglement>(`${this.apiUrl}/${id}`);
  }

  create(reglement: Reglement): Observable<Reglement> {
    return this.http.post<Reglement>(this.apiUrl, reglement);
  }

  update(id: string, reglement: Reglement): Observable<Reglement> {
    return this.http.put<Reglement>(`${this.apiUrl}/${id}`, reglement);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
