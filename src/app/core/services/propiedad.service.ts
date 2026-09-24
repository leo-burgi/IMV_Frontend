import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Propiedad, PropiedadUpdate } from '../models/propiedad.model';
import { PagedResult } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class PropiedadService {
  private readonly apiUrl = `${environment.apiUrl}/propiedades`;

  constructor(private http: HttpClient) { }

  getPropiedades(): Observable<Propiedad[]> {
    return this.http.get<Propiedad[]>(this.apiUrl);
  }

  getPropiedadesPaginadas(page: number, pageSize: number, search: string, barrio: string, estado: string, catastro: string): Observable<PagedResult<Propiedad>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize))
      .set('estado', estado).set('catastro', catastro);
    if (search.trim()) params = params.set('search', search.trim());
    if (barrio) params = params.set('barrio', barrio);
    return this.http.get<PagedResult<Propiedad>>(`${this.apiUrl}/paginadas`, { params });
  }

  getPropiedad(idPropiedad: number): Observable<Propiedad> {
    return this.http.get<Propiedad>(`${this.apiUrl}/${idPropiedad}`);
  }

  updatePropiedad(propiedad: PropiedadUpdate): Observable<Propiedad> {
    return this.http.put<Propiedad>(`${this.apiUrl}/editar`, propiedad);
  }
}
