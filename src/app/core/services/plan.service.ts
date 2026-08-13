import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from '../models/plan.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly apiUrl = `${environment.apiUrl}/planes`;

  constructor(private http: HttpClient) { }

  getPlanes(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/listar`);
  }

  createPlan(plan: Partial<Plan>): Observable<Plan> {
    return this.http.post<Plan>(`${this.apiUrl}/guardar`, plan);
  }

  updatePlan(plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/editar`, plan);
  }
}
