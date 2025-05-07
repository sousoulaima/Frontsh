import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Abonnement {
  codeabo?: number;
  dateabo: string;
  totalhtabo: number;
  totalremise: number;
  totalht: number;
  totalttc: number;
  solde: boolean; // تأكد إن الـ API بترجع boolean، لو لا هنتعامل معاه في الكود
  restepaye: number;
  mtpaye: number; // المبلغ المالي
  datedeb: string;
  datefin: string;
  adherent_code: string;
  type_abonnement_code: string;
  categorie_abonnement_codecateg: string;
  modalite_reg_id: string; // نوع الدفع (Espèces/Chèque)
}

export interface Adherent {
  code: string;
  nom: string;
  prenom: string;
  profession?: string;
  email?: string;
  adresse?: string;
  tel1?: string;
  tel2?: string;
  datenaissance?: string;
  cin?: string;
  codetva?: string;
  raisonsoc?: string;
  idpointage?: string;
  societe_code?: string;
}

export interface TypeAbonnement {
  code: string;
  designation: string;
  nbmois: number;
  nbjours: number;
  acceslibre: boolean;
  forfait: number;
  nbseancesemaine?: number;
  id_categorie?: number;
}

export interface CategorieAbonnement {
  codecateg: string;
  designationcateg: string;
}

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  private apiUrl = 'http://localhost:8000/api/abonnements';
  private adherentApiUrl = 'http://localhost:8000/api/adherents';

  constructor(protected http: HttpClient) {}

  // Abonnement CRUD
  getAllAbonnements(): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(`${this.apiUrl}`);
  }

  getById(id: number): Observable<Abonnement> {
    return this.http.get<Abonnement>(`${this.apiUrl}/${id}`);
  }

  createAbonnement(abonnement: Abonnement): Observable<Abonnement> {
    return this.http.post<Abonnement>(`${this.apiUrl}`, abonnement);
  }

  update(id: number, data: Abonnement): Observable<Abonnement> {
    return this.http.put<Abonnement>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Adherent CRUD
  getAllAdherents(): Observable<Adherent[]> {
    return this.http.get<Adherent[]>(this.adherentApiUrl);
  }

  createAdherent(adherent: Adherent): Observable<Adherent> {
    return this.http.post<Adherent>(this.adherentApiUrl, adherent);
  }

  // Type Abonnement and Categories
  getAllTypesAbonnement(): Observable<TypeAbonnement[]> {
    return this.http.get<TypeAbonnement[]>(`http://localhost:8000/api/type-abonnements`);
  }

  getAllCategories(): Observable<CategorieAbonnement[]> {
    return this.http.get<CategorieAbonnement[]>(`http://localhost:8000/api/categorie-abonnements`);
  }

  // Méthode pour générer un code adherent aléatoire
  generateAdherentCode(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }
}