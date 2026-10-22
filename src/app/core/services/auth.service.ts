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
  saliendo = false;
  errorSalida = '';
  mensajeServicio = '';
  constructor(private http: HttpClient) {}

  cargarSesion(): void {
    this.cancelarCarga();
    this.usuario = null;
    this.estadoSubject.next('cargando');
    this.solicitud = this.http.get<UsuarioActual>(environment.apiUrl + '/auth/me').subscribe(
      usuario => this.aceptar(usuario),
      (error: HttpErrorResponse) => {
        if (error.status === 401) { this.elegirIngresoLocal(); }
        else { this.registrarError(error.status, error.error?.Codigo); }
      }
    );
  }
  ingresarWindows(): void {
    this.cancelarCarga();
    this.estadoSubject.next('cargando');
    this.solicitud = this.http.get<UsuarioActual>(environment.apiUrl + '/auth/windows').subscribe(
      usuario => this.aceptar(usuario), (error: HttpErrorResponse) => this.registrarError(error.status, error.error?.Codigo)
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
    this.mensajeServicio = '';
    this.usuario = usuario;
    this.estadoSubject.next('autenticado');
  }
  salirLocal(alSalir?: () => void): void {
    if (this.saliendo) { return; }
    this.saliendo = true;
    this.errorSalida = '';
    this.http.post(environment.apiUrl + '/auth/salir', {}).subscribe(
      () => { this.saliendo = false; this.elegirIngresoLocal(); if (alSalir) { alSalir(); } },
      () => { this.saliendo = false; this.errorSalida = 'No se pudo confirmar la revocación. Volvé a intentar.'; }
    );
  }
  registrarError(status: number, codigo?: string): void {
    this.mensajeServicio = status === 503 && codigo === 'IMV_ESQUEMA_PENDIENTE' ?
      'El acceso a IMV todavía no está preparado. Informática debe completar la actualización de la base de datos antes de iniciar sesión.' : '';
    this.usuario = null;
    this.estadoSubject.next(status === 401 ? 'no-autenticado' : status === 403 ? 'denegado' : 'error');
  }
  private cancelarCarga(): void { if (this.solicitud) { this.solicitud.unsubscribe(); this.solicitud = undefined; } }
}
