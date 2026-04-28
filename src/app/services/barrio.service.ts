import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Barrio } from '../models/barrio.model';

@Injectable({
  providedIn: 'root'
})
export class BarrioService {
  private apiUrl = 'https://localhost:44350/api/barrios';

  constructor(private http: HttpClient) { }

  getBarrios(): Observable<Barrio[]> {
    return this.http.get<Barrio[]>(`${this.apiUrl}/listar`);
  }
}