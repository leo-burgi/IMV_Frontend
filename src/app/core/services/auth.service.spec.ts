import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, EstadoSesion } from './auth.service';
import { WindowsAuthInterceptor } from '../interceptors/windows-auth.interceptor';
import { environment } from '../../../environments/environment';

describe('Sesión integrada Windows', () => {
  let auth: AuthService;
  let http: HttpClient;
  let backend: HttpTestingController;
  let estado: EstadoSesion;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [
      { provide: HTTP_INTERCEPTORS, useClass: WindowsAuthInterceptor, multi: true }
    ] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    auth.estado$.subscribe(value => estado = value);
  });
  afterEach(() => backend.verify());

  it('carga me con credenciales y expone la cuenta real', () => {
    auth.cargarSesion();
    expect(estado).toBe('cargando');
    const req = backend.expectOne(environment.apiUrl + '/auth/me');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ Autenticado: true, IdUsuarioAplicacion: 1, MetodoIngreso: 'Windows', CuentaWindows: 'MUNICIPALIDAD\\jperez', NombreMostrar: 'jperez', Dominio: 'MUNICIPALIDAD', Iniciales: 'JP' });
    expect(estado).toBe('autenticado');
    expect(auth.usuario.NombreMostrar).toBe('jperez');
  });
  [401, 403, 0, 500].forEach(status => it('resuelve el error de sesión ' + status, () => {
    auth.cargarSesion();
    backend.expectOne(environment.apiUrl + '/auth/me').flush(null, { status, statusText: 'Fallo' });
    if (status === 401) { backend.expectOne(environment.apiUrl + '/auth/windows').flush(null, { status, statusText: 'Fallo' }); }
    expect(estado).toBe(status === 401 ? 'no-autenticado' : status === 403 ? 'denegado' : 'error');
    expect(auth.usuario).toBeNull();
  }));
  ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => it('envía credenciales en ' + method, () => {
    http.request(method, environment.apiUrl + '/planes').subscribe();
    const req = backend.expectOne(environment.apiUrl + '/planes');
    expect(req.request.withCredentials).toBeTrue();
    if (method !== 'GET') { expect(req.request.headers.get('X-IMV-Solicitud')).toBe('1'); }
    req.flush({});
  }));
  [401, 403].forEach(status => it('centraliza ' + status + ' de una operación funcional', () => {
    http.get(environment.apiUrl + '/planes').subscribe(() => fail('debió fallar'), () => {});
    backend.expectOne(environment.apiUrl + '/planes').flush({}, { status, statusText: 'Denegado' });
    expect(estado).toBe(status === 401 ? 'no-autenticado' : 'denegado');
  }));
  ['https://otro.invalid/api/planes', environment.apiUrl + '-otro/planes', 'assets/config.json'].forEach(url =>
    it('no envía credenciales fuera de API: ' + url, () => {
      http.get(url).subscribe();
      const req = backend.expectOne(url);
      expect(req.request.withCredentials).toBeFalse();
      req.flush({});
    }));
  it('rechaza una respuesta de sesión no autenticada', () => {
    auth.cargarSesion();
    backend.expectOne(environment.apiUrl + '/auth/me').flush({ Autenticado: false });
    expect(estado).toBe('no-autenticado');
  });
  it('intenta Windows automáticamente cuando no existe sesión', () => {
    auth.cargarSesion();
    backend.expectOne(environment.apiUrl + '/auth/me').flush({}, { status: 401, statusText: 'Sin sesión' });
    const windows = backend.expectOne(environment.apiUrl + '/auth/windows');
    expect(windows.request.method).toBe('GET');
    expect(windows.request.withCredentials).toBeTrue();
    windows.flush({ Autenticado: true, IdUsuarioAplicacion: 7, NombreMostrar: 'Municipal', CuentaWindows: 'MUNICIPIO\\empleado', Iniciales: 'MU', MetodoIngreso: 'Windows' });
    expect(auth.usuario.IdUsuarioAplicacion).toBe(7);
    expect(estado).toBe('autenticado');
  });
  it('admite usuario local sin CuentaWindows con el mismo contrato interno', () => {
    auth.elegirIngresoLocal();
    auth.ingresarLocal('empleado', 'Contraseña de prueba').subscribe(usuario => auth.aceptar(usuario));
    const req = backend.expectOne(environment.apiUrl + '/auth/login');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.headers.get('X-IMV-Solicitud')).toBe('1');
    req.flush({ Autenticado: true, IdUsuarioAplicacion: 9, NombreMostrar: 'Empleado', UsuarioLocal: 'empleado', Iniciales: 'EM', MetodoIngreso: 'Local' });
    expect(auth.usuario.IdUsuarioAplicacion).toBe(9);
    expect(estado).toBe('autenticado');
  });
  it('permite elegir IMV durante el intento automático y cancela la solicitud', () => {
    auth.cargarSesion();
    const req = backend.expectOne(environment.apiUrl + '/auth/me');
    auth.elegirIngresoLocal();
    expect(req.cancelled).toBeTrue();
    expect(estado).toBe('no-autenticado');
  });
  it('cierra la sesión local mediante POST protegido', () => {
    auth.salirLocal();
    const req = backend.expectOne(environment.apiUrl + '/auth/salir');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('X-IMV-Solicitud')).toBe('1');
    req.flush({});
    expect(auth.usuario).toBeNull();
    expect(estado).toBe('no-autenticado');
  });
});
