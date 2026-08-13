import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Persona } from '../models/persona.model';

@Injectable({ providedIn: 'root' })
export class PersonaService {
  private readonly apiUrl = `${environment.apiUrl}/personas`;

  constructor(private http: HttpClient) { }

  getPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/listar`);
  }

  createPersona(persona: Partial<Persona>): Observable<Persona> {
    return this.http.post<Persona>(`${this.apiUrl}/guardar`, persona);
  }

  updatePersona(persona: Persona): Observable<Persona> {
    return this.http.put<Persona>(`${this.apiUrl}/editar`, persona);
  }
}
