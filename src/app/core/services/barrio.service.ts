import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Barrio } from '../models/barrio.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BarrioService {
  private readonly apiUrl = `${environment.apiUrl}/barrios`;

  constructor(private http: HttpClient) { }

  getBarrios(): Observable<Barrio[]> {
    return this.http.get<Barrio[]>(`${this.apiUrl}/listar`);
  }

  createBarrio(barrio: Partial<Barrio>): Observable<Barrio> {
    return this.http.post<Barrio>(`${this.apiUrl}/guardar`, barrio);
  }

  updateBarrio(barrio: Barrio): Observable<Barrio> {
    return this.http.put<Barrio>(`${this.apiUrl}/editar`, barrio);
  }
}
