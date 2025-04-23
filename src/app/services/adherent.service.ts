import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Adherent {
  code?: string;
  nom: string;
  prenom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  societe_code?: string; // Changed to string
  societe?: any;
  profession?: string;
  cin?: string;
  tel1?: string;
  tel2?: string;
  datenaissance?: string;
  codetva?: string;
  raisonsoc?: string;
  idpointage?: string; // Changed to string
  abonnements?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdherentService {
  private apiUrl = 'http://localhost:8000/api/adherents';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Adherent[]> {
    return this.http.get<Adherent[]>(this.apiUrl);
  }

  getById(id: string): Observable<Adherent> {
    return this.http.get<Adherent>(`${this.apiUrl}/${id}`);
  }

  create(data: Adherent): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: string, data: Adherent): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}