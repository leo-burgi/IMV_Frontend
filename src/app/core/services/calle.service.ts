import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Calle } from '../models/calle.model';

@Injectable({
  providedIn: 'root'
})
export class CalleService {
  private apiUrl = 'https://localhost:44350/api/calles';

  constructor(private http: HttpClient) { }

  getCalles(): Observable<Calle[]> {
    return this.http.get<Calle[]>(`${this.apiUrl}/listar`);
  }

  createCalle(calle: Partial<Calle>): Observable<Calle> {
    return this.http.post<Calle>(`${this.apiUrl}/guardar`, calle);
  }

  updateCalle(calle: Calle): Observable<Calle> {
    return this.http.put<Calle>(`${this.apiUrl}/editar`, calle);
  }
}
