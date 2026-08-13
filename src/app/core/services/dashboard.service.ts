import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardDTO } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Ajustá esta URL al puerto real de tu API en .NET
  private readonly apiUrl = `${environment.apiUrl}/dashboard/resumen`;

  constructor(private http: HttpClient) { }

  getResumen(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(this.apiUrl);
  }
  
}
