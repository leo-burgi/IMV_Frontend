import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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

  it('debe crear la aplicación', () => {
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

    expect(app.seccionActiva).toBe('personas');
    expect(app.idDestino('personas')).toBe(4);
    app.cambiarSeccion('consulta-integral');
    expect(app.consultaIntegralEstado).toEqual({ search: 'Pérez', tipo: 'PERSONA', page: 2 });
    expect(app.idDestino('personas')).toBeUndefined();
  });
});
