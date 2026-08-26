import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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
