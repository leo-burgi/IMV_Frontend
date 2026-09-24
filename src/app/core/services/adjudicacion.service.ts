import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Adjudicacion, AdjudicacionCatalogos, AdjudicacionPayload,
  CambioEstadoNotarialPayload, EstadoNotarialOpcion, HistorialEstado
} from '../models/adjudicacion.model';
import { PagedResult } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class AdjudicacionService {
  private readonly apiUrl = `${environment.apiUrl}/adjudicaciones`;

  constructor(private http: HttpClient) { }

  getAdjudicaciones(): Observable<Adjudicacion[]> {
    return this.http.get<Adjudicacion[]>(`${this.apiUrl}/listar`);
  }

  getAdjudicacionesPaginadas(page: number, pageSize: number, search: string, idPlan: number, estado: string): Observable<PagedResult<Adjudicacion>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize)).set('estado', estado);
    if (search.trim()) params = params.set('search', search.trim());
    if (idPlan) params = params.set('idPlan', String(idPlan));
    return this.http.get<PagedResult<Adjudicacion>>(`${this.apiUrl}/paginadas`, { params });
  }

  getDetalle(idAdjudicacion: number): Observable<Adjudicacion> {
    return this.http.get<Adjudicacion>(`${this.apiUrl}/detalle/${idAdjudicacion}`);
  }

  getCatalogos(): Observable<AdjudicacionCatalogos> {
    return this.http.get<AdjudicacionCatalogos>(`${this.apiUrl}/catalogos`);
  }

  createAdjudicacion(payload: AdjudicacionPayload): Observable<Adjudicacion> {
    return this.http.post<Adjudicacion>(`${this.apiUrl}/guardar`, payload);
  }

  updateAdjudicacion(payload: AdjudicacionPayload): Observable<Adjudicacion> {
    return this.http.put<Adjudicacion>(`${this.apiUrl}/editar`, payload);
  }

  getEstadosNotariales(): Observable<EstadoNotarialOpcion[]> {
    return this.http.get<EstadoNotarialOpcion[]>(`${this.apiUrl}/estados-notariales`);
  }

  getHistorialEstados(idAdjudicacion: number): Observable<HistorialEstado[]> {
    return this.http.get<HistorialEstado[]>(`${this.apiUrl}/${idAdjudicacion}/historial-estados`);
  }

  cambiarEstadoNotarial(idAdjudicacion: number, payload: CambioEstadoNotarialPayload): Observable<Adjudicacion> {
    return this.http.post<Adjudicacion>(`${this.apiUrl}/${idAdjudicacion}/estado-notarial`, payload);
  }
}
