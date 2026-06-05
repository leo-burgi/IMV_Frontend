import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from '../models/plan.model';


@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = 'https://localhost:44350/api/planes/listar';

  constructor(private http: HttpClient) { }

  getPlanes():Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }
}
