import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IngresoLocalComponent } from './ingreso-local.component';
import { AuthService } from '../services/auth.service';
import { WindowsAuthInterceptor } from '../interceptors/windows-auth.interceptor';
import { environment } from '../../../environments/environment';

describe('Ingreso local IMV', () => {
  let component: IngresoLocalComponent;
  let fixture: ComponentFixture<IngresoLocalComponent>;
  let backend: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormsModule, HttpClientTestingModule], declarations: [IngresoLocalComponent],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: WindowsAuthInterceptor, multi: true }] }).compileComponents();
    fixture = TestBed.createComponent(IngresoLocalComponent);
    component = fixture.componentInstance;
    backend = TestBed.inject(HttpTestingController);
  });
  afterEach(() => backend.verify());
  it('renderiza y envía el formulario desde el DOM sin conservar la contraseña', fakeAsync(() => {
    fixture.detectChanges(); tick();
    const usuario: HTMLInputElement = fixture.nativeElement.querySelector('#usuario-imv');
    const clave: HTMLInputElement = fixture.nativeElement.querySelector('#contrasena-imv');
    expect(usuario).toBeTruthy(); expect(clave.type).toBe('password');
    usuario.value = 'empleado'; usuario.dispatchEvent(new Event('input'));
    clave.value = 'Contraseña temporal de prueba'; clave.dispatchEvent(new Event('input'));
    tick(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeFalse();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges(); tick(); fixture.detectChanges();
    const req = backend.expectOne(environment.apiUrl + '/auth/login');
    expect(req.request.body.Usuario).toBe('empleado');
    expect(clave.value).toBe('');
    req.flush({ Message: 'Detalle sensible' }, { status: 401, statusText: 'Denegado' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('No se pudo ingresar');
    expect(fixture.nativeElement.textContent).not.toContain('Detalle sensible');
  }));
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
  it('distingue instalación pendiente de credenciales incorrectas sin exponer SQL', () => {
    component.usuario = 'empleado'; component.contrasena = 'Clave sintética de prueba'; component.ingresar();
    backend.expectOne(environment.apiUrl + '/auth/login').flush({ Codigo: 'IMV_ESQUEMA_PENDIENTE', Message: 'Invalid object name dbo.UsuarioRoles' }, { status: 503, statusText: 'No disponible' });
    expect(component.error).toContain('actualización de la base de datos'); expect(component.error).not.toContain('dbo.'); expect(component.contrasena).toBe('');
  });
  it('no realiza una petición cuando faltan credenciales' , () => {
    component.ingresar();
    backend.expectNone(environment.apiUrl + '/auth/login');
  });
});