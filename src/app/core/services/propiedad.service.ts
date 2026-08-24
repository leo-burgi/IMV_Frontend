import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Propiedad } from '../models/propiedad.model';

@Injectable({ providedIn: 'root' })
export class PropiedadService {
  private readonly apiUrl = `${environment.apiUrl}/propiedades`;

  constructor(private http: HttpClient) { }

  getPropiedades(): Observable<Propiedad[]> {
    return this.http.get<Propiedad[]>(this.apiUrl);
  }

  getPropiedad(idPropiedad: number): Observable<Propiedad> {
    return this.http.get<Propiedad>(`${this.apiUrl}/${idPropiedad}`);
  }
}
