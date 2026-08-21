import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalidadDatosAdjudicaciones } from '../models/calidad-datos-adjudicaciones.model';

@Injectable({ providedIn: 'root' })
export class CalidadDatosService {
  private readonly apiUrl = `${environment.apiUrl}/inicio/calidad-adjudicaciones`;

  constructor(private http: HttpClient) { }

  getCalidadAdjudicaciones(): Observable<CalidadDatosAdjudicaciones> {
    return this.http.get<CalidadDatosAdjudicaciones>(this.apiUrl);
  }
}
