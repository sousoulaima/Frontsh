import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000/api/dashboard/stats';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(this.apiUrl);
    
  }
}