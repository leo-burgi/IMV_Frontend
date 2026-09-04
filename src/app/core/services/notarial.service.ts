import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Adjudicacion, CambioEstadoNotarialPayload, EstadoNotarialOpcion } from '../models/adjudicacion.model';
import { PagedResult } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class NotarialService {
  private readonly apiUrl = `${environment.apiUrl}/notariales`;
  constructor(private http: HttpClient) { }
  getPaged(page: number, pageSize: number, search: string, idEstado: number | null): Observable<PagedResult<Adjudicacion>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (search.trim()) params = params.set('search', search.trim());
    if (idEstado !== null) params = params.set('idEstado', String(idEstado));
    return this.http.get<PagedResult<Adjudicacion>>(`${this.apiUrl}/paginadas`, { params });
  }
  getCatalogos(): Observable<EstadoNotarialOpcion[]> { return this.http.get<EstadoNotarialOpcion[]>(`${this.apiUrl}/catalogos`); }
  getDetalle(id: number): Observable<Adjudicacion> { return this.http.get<Adjudicacion>(`${this.apiUrl}/${id}`); }
  addEstado(id: number, payload: CambioEstadoNotarialPayload): Observable<Adjudicacion> { return this.http.post<Adjudicacion>(`${this.apiUrl}/${id}/estados`, payload); }
}
