import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioActual } from '../models/usuario-actual.model';

export type EstadoSesion = 'cargando' | 'autenticado' | 'no-autenticado' | 'denegado' | 'error';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly estadoSubject = new BehaviorSubject<EstadoSesion>('cargando');
  readonly estado$ = this.estadoSubject.asObservable();
  usuario: UsuarioActual | null = null;
  private solicitud?: Subscription;
  constructor(private http: HttpClient) {}

  cargarSesion(): void {
    this.cancelarCarga();
    this.usuario = null;
    this.estadoSubject.next('cargando');
    this.solicitud = this.http.get<UsuarioActual>(environment.apiUrl + '/auth/me').subscribe(
      usuario => this.aceptar(usuario),
      (error: HttpErrorResponse) => {
        if (error.status === 401) { this.ingresarWindows(); }
        else { this.registrarError(error.status); }
      }
    );
  }
  ingresarWindows(): void {
    this.cancelarCarga();
    this.estadoSubject.next('cargando');
    this.solicitud = this.http.get<UsuarioActual>(environment.apiUrl + '/auth/windows').subscribe(
      usuario => this.aceptar(usuario), (error: HttpErrorResponse) => this.registrarError(error.status)
    );
  }
  elegirIngresoLocal(): void {
    this.cancelarCarga();
    this.usuario = null;
    this.estadoSubject.next('no-autenticado');
  }
  ingresarLocal(usuario: string, contrasena: string): Observable<UsuarioActual> {
    return this.http.post<UsuarioActual>(environment.apiUrl + '/auth/login', { Usuario: usuario, Contrasena: contrasena });
  }
  aceptar(usuario: UsuarioActual): void {
    if (!usuario || !usuario.Autenticado || !usuario.IdUsuarioAplicacion) { this.registrarError(401); return; }
    this.usuario = usuario;
    this.estadoSubject.next('autenticado');
  }
  salirLocal(): void {
    this.http.post(environment.apiUrl + '/auth/salir', {}).subscribe(
      () => this.elegirIngresoLocal(), () => this.registrarError(0)
    );
  }
  registrarError(status: number): void {
    this.usuario = null;
    this.estadoSubject.next(status === 401 ? 'no-autenticado' : status === 403 ? 'denegado' : 'error');
  }
  private cancelarCarga(): void { if (this.solicitud) { this.solicitud.unsubscribe(); this.solicitud = undefined; } }
}
