import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalleFormation {
  codesalle?: number;
  designationsalle?: string;
  capacitesalle?: number;
  prives_n?: boolean;
  prives_j?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Formateur {
  codefor?: number;
  nomfor?: string;
  prenomfor?: string;
  telfor?: string;
  emailfor?: string;
  adrfor?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ReservationSalle {
  id?: number;
  datereservation?: string;
  montantreservation?: string;
  salle_formation_codesalle?: number;
  formateur_codefor?: number;
  created_at?: string;
  updated_at?: string;
  salle_formation?: SalleFormation;
  formateur?: Formateur;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationSalleService {
  private apiUrl = 'http://localhost:8000/api/reservation-salle-formations'; // adapte l'URL selon ta route Laravel

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReservationSalle[]> {
    return this.http.get<ReservationSalle[]>(this.apiUrl);
  }

  getById(id: string): Observable<ReservationSalle> {
    return this.http.get<ReservationSalle>(`${this.apiUrl}/${id}`);
  }

  create(reservation: ReservationSalle): Observable<ReservationSalle> {
    return this.http.post<ReservationSalle>(this.apiUrl, reservation);
  }

  update(id: string, reservation: ReservationSalle): Observable<ReservationSalle> {
    return this.http.put<ReservationSalle>(`${this.apiUrl}/${id}`, reservation);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
