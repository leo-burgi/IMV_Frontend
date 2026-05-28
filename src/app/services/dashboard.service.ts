import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDTO } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Ajustá esta URL al puerto real de tu API en .NET
  private apiUrl = 'http://localhost:44350/api/dashboard/resumen'; 

  constructor(private http: HttpClient) { }

  getResumen(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(this.apiUrl);
  }
  
}