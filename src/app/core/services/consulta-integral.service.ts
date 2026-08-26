import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConsultaIntegralDetalle,
  ConsultaIntegralPagina,
  ConsultaTipo
} from '../models/consulta-integral.model';

@Injectable({ providedIn: 'root' })
export class ConsultaIntegralService {
  private readonly apiUrl = `${environment.apiUrl}/consulta-integral`;

  constructor(private http: HttpClient) { }

  search(search: string, tipo: ConsultaTipo, page: number, pageSize: number): Observable<ConsultaIntegralPagina> {
    const params = new HttpParams()
      .set('search', search.trim())
      .set('tipo', tipo)
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<ConsultaIntegralPagina>(this.apiUrl, { params });
  }

  getPersona(id: number): Observable<ConsultaIntegralDetalle> {
    return this.http.get<ConsultaIntegralDetalle>(`${this.apiUrl}/persona/${id}`);
  }

  getPropiedad(id: number): Observable<ConsultaIntegralDetalle> {
    return this.http.get<ConsultaIntegralDetalle>(`${this.apiUrl}/propiedad/${id}`);
  }

  getLegacy(id: number): Observable<ConsultaIntegralDetalle> {
    return this.http.get<ConsultaIntegralDetalle>(`${this.apiUrl}/legacy/${id}`);
  }
}
