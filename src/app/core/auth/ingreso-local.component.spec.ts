import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IngresoLocalComponent } from './ingreso-local.component';
import { AuthService } from '../services/auth.service';
import { WindowsAuthInterceptor } from '../interceptors/windows-auth.interceptor';
import { environment } from '../../../environments/environment';

describe('Ingreso local IMV', () => {
  let component: IngresoLocalComponent;
  let backend: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormsModule, HttpClientTestingModule], declarations: [IngresoLocalComponent],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: WindowsAuthInterceptor, multi: true }] }).compileComponents();
    component = TestBed.createComponent(IngresoLocalComponent).componentInstance;
    backend = TestBed.inject(HttpTestingController);
  });
  afterEach(() => backend.verify());
  it('envía la contraseña sólo al login y la borra del formulario inmediatamente', () => {
    const guardar = spyOn(Storage.prototype, 'setItem');
    component.usuario = 'empleado'; component.contrasena = 'Contraseña temporal de prueba';
    component.ingresar();
    expect(component.contrasena).toBe('');
    component.ingresar();
    const req = backend.expectOne(environment.apiUrl + '/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Usuario: 'empleado', Contrasena: 'Contraseña temporal de prueba' });
    req.flush({ Autenticado: true, IdUsuarioAplicacion: 3, NombreMostrar: 'Empleado', Iniciales: 'EM', MetodoIngreso: 'Local' });
    expect(TestBed.inject(AuthService).usuario.IdUsuarioAplicacion).toBe(3);
    expect(guardar).not.toHaveBeenCalled();
    expect(component.enviando).toBeFalse();
  });
  it('rechaza credenciales sin mostrar detalles sensibles del servidor', () => {
    component.usuario = 'empleado'; component.contrasena = 'Incorrecta';
    component.ingresar();
    backend.expectOne(environment.apiUrl + '/auth/login').flush({ Message: 'Detalle sensible' }, { status: 401, statusText: 'Denegado' });
    expect(component.error).toContain('No se pudo ingresar');
    expect(component.error).not.toContain('Detalle sensible');
    expect(component.contrasena).toBe('');
    expect(component.enviando).toBeFalse();
  });
  it('no realiza una petición cuando faltan credenciales', () => {
    component.ingresar();
    backend.expectNone(environment.apiUrl + '/auth/login');
  });
});