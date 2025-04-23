import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; // Assurez-vous d'ajouter l'URL de votre API dans `environment.ts`

@Injectable({
  providedIn: 'root'
})
export class TypeAbonnementService {
  private apiUrl = `http://localhost:8000/api/type-abonnements`;  // Assurez-vous que l'URL de l'API est correcte

  constructor(private http: HttpClient) {}

  // Récupérer tous les types d'abonnement
  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Récupérer un type d'abonnement spécifique par son ID
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau type d'abonnement
  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, this.getHttpOptions());
  }

  // Mettre à jour un type d'abonnement existant
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, this.getHttpOptions());
  }

  // Supprimer un type d'abonnement
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Méthode pour les options HTTP (par exemple, l'authentification avec token)
  private getHttpOptions() {
    const token = localStorage.getItem('token');  // Exemple d'utilisation d'un token d'authentification
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }
}
