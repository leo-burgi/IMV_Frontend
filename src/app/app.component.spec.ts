import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule, FormsModule, RouterTestingModule.withRoutes([])],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.returnValue(Promise.resolve(true));
  });

  it('oculta módulos durante carga y muestra usuario al autenticar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Verificando acceso');
    expect(fixture.nativeElement.querySelector('.imv-layout')).toBeNull();
    TestBed.inject(HttpTestingController).expectOne(environment.apiUrl + '/auth/me').flush({
      Autenticado: true, IdUsuarioAplicacion: 1, MetodoIngreso: 'Windows', CuentaWindows: 'MUNICIPALIDAD\\jperez', NombreMostrar: 'jperez', Dominio: 'MUNICIPALIDAD', Iniciales: 'JP'
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.imv-user-name').textContent).toContain('jperez');
    expect(fixture.nativeElement.querySelector('.imv-avatar').textContent).toContain('JP');
    TestBed.inject(AuthService).registrarError(403);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Acceso denegado');
    expect(fixture.nativeElement.querySelector('.imv-layout')).toBeNull();
  });

  it('permite ingreso local directo sin negociar Windows ni consultar una sesión previa', () => {
    const originalUrl = window.location.href;
    try {
      window.history.replaceState(null, '', '?ingreso=local');
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.mostrarIngresoLocal).toBeTrue();
      expect(fixture.nativeElement.querySelector('app-ingreso-local')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('.imv-layout')).toBeNull();
      expect(fixture.nativeElement.querySelector('.imv-session__logo').getAttribute('src')).toBe('assets/img/IMV-sinfondo.png');
      TestBed.inject(HttpTestingController).expectNone(environment.apiUrl + '/auth/me');
      TestBed.inject(HttpTestingController).expectNone(environment.apiUrl + '/auth/windows');
      fixture.destroy();
    } finally { window.history.replaceState(null, '', originalUrl); }
  });
  it('abre el panel con teclado nativo y Escape devuelve foco al disparador', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(environment.apiUrl + '/auth/me').flush({
      Autenticado: true, IdUsuarioAplicacion: 1, MetodoIngreso: 'Local', NombreMostrar: 'IMV', Iniciales: 'IM'
    });
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.imv-user-trigger') as HTMLButtonElement;
    trigger.click(); fixture.detectChanges(); tick();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('#imv-user-panel')).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  }));
  it('crea una cuenta desde el DOM sin enviar roles ni conservar la contraseña', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
    const backend = TestBed.inject(HttpTestingController);
    backend.expectOne(environment.apiUrl + '/auth/me').flush({ Autenticado: true, IdUsuarioAplicacion: 1, MetodoIngreso: 'Windows', NombreMostrar: 'IMV', Iniciales: 'IM', Roles: ['Admin'] });
    fixture.detectChanges(); fixture.componentInstance.menuUsuarioAbierto = true; fixture.componentInstance.panelUsuario = 'usuarios';
    fixture.detectChanges(); tick();
    const completar = (id: string, valor: string) => { const input = fixture.nativeElement.querySelector(id) as HTMLInputElement; input.value = valor; input.dispatchEvent(new Event('input')); };
    completar('#alta-local-nombre', 'Cuenta nueva'); completar('#alta-local-usuario', 'cuenta.nueva');
    completar('#alta-local-clave', 'Clave nueva sintética de prueba'); completar('#alta-local-confirmar', 'Clave nueva sintética de prueba');
    tick(); fixture.detectChanges();
    const formulario = fixture.nativeElement.querySelector('form[aria-label="Alta de cuenta IMV"]');
    expect(formulario.querySelector('button[type=submit]').disabled).toBeFalse();
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); fixture.detectChanges(); tick(); fixture.detectChanges();
    const req = backend.expectOne(environment.apiUrl + '/seguridad/usuarios/local');
    expect(req.request.body.UsuarioLocal).toBe('cuenta.nueva'); expect(req.request.body.Roles).toBeUndefined();
    expect(fixture.nativeElement.querySelector('#alta-local-clave').value).toBe('');
    expect(fixture.nativeElement.querySelector('#alta-local-confirmar').value).toBe('');
    req.flush({ IdUsuarioAplicacion: 3 }); backend.expectOne(environment.apiUrl + '/seguridad/usuarios').flush([]);
    fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Cuenta IMV creada sin roles'); fixture.destroy();
  }));
  it('debe crear la aplicación'  , () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe conservar el estado mínimo de Consulta integral al navegar a una ficha', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.navegarDesdeConsulta({
      seccion: 'personas',
      id: 4,
      estado: { search: 'Pérez', tipo: 'PERSONA', page: 2 }
    });

    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['personas'], { queryParams: { id: 4 } });
    expect(app.idDestino('personas')).toBe(4);
    app.cambiarSeccion('consulta-integral');
    expect(app.consultaIntegralEstado).toEqual({ search: 'Pérez', tipo: 'PERSONA', page: 2 });
    expect(app.idDestino('personas')).toBeUndefined();
  });
});
