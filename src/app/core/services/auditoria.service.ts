import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditoriaCambio } from '../models/auditoria.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly apiUrl = `${environment.apiUrl}/auditoria`;

  constructor(private http: HttpClient) { }

  getHistorial(entidad: string, id: number): Observable<AuditoriaCambio[]> {
    return this.http.get<AuditoriaCambio[]>(`${this.apiUrl}/${encodeURIComponent(entidad)}/${id}`);
  }
}
