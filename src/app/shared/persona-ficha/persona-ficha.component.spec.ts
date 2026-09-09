import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaIntegralDetalle } from '../../core/models/consulta-integral.model';
import { PersonaFichaComponent } from './persona-ficha.component';

describe('PersonaFichaComponent', () => {
  let fixture: ComponentFixture<PersonaFichaComponent>;
  let component: PersonaFichaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [PersonaFichaComponent] }).compileComponents();
    fixture = TestBed.createComponent(PersonaFichaComponent);
    component = fixture.componentInstance;
  });

  it('debe contemplar persona sin adjudicaciones y datos de contacto faltantes', () => {
    component.detalle = detalleBase();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No hay adjudicaciones definitivas');
    expect(text.match(/Sin dato/g).length).toBeGreaterThanOrEqual(2);
  });

  it('debe mostrar múltiples adjudicaciones como titular y cotitular, nulos y antecedentes', () => {
    const detalle = detalleBase();
    detalle.Adjudicaciones = [
      adjudicacion(1, true, 7, []),
      adjudicacion(2, false, 9, [{ IdPersona: 7, DNI: '12345678', NombreCompleto: 'Pérez, Ana', EsTitularPrincipal: false }])
    ];
    detalle.AntecedentesLegacy = [{
      IdRegistro: 10, IdLote: 12, HojaOrigen: 'Hoja 1', FilaOrigen: 20,
      CategoriaInformacion: 'ANTECEDENTE_LEGACY_NO_VALIDADO', EstadoValidacion: 'PENDIENTE_VERIFICACION',
      CodigoMotivo: 'PLAN_NO_RESUELTO', RawTitular: 'PEREZ ANA', RawObservaciones: 'Texto original'
    }, {
      IdRegistro: 11, IdLote: 12, HojaOrigen: 'Hoja 2', FilaOrigen: 21,
      CategoriaInformacion: 'COINCIDENCIA_CANDIDATA', EstadoValidacion: 'PENDIENTE_VERIFICACION'
    }];
    component.detalle = detalle;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Titular principal');
    expect(text).toContain('Cotitular');
    expect(text).toContain('Antecedentes históricos');
    expect(text).toContain('Coincidencia candidata');
    expect(text).toContain('Historial notarial');
    expect(text).toContain('Estado iniciado');
    expect(text).toContain('PLAN_NO_RESUELTO');
    expect(text).toContain('Texto original');
    expect(text).toContain('Sin dato');
  });

  it('debe navegar a adjudicación, propiedad y plan', () => {
    component.detalle = detalleBase();
    const destinos: any[] = [];
    component.solicitarNavegacion.subscribe(destino => destinos.push(destino));
    component.navegar('adjudicaciones', 4);
    component.navegar('propiedades', 5);
    component.navegar('planes', 6);
    expect(destinos).toEqual([
      { seccion: 'adjudicaciones', id: 4 },
      { seccion: 'propiedades', id: 5 },
      { seccion: 'planes', id: 6 }
    ]);
  });

  function detalleBase(): ConsultaIntegralDetalle {
    return {
      TipoResultado: 'PERSONA', NivelConfianza: 'DEFINITIVO',
      Persona: { IdPersona: 7, DNI: '12345678', Apellido: 'Pérez', Nombre: 'Ana' },
      Adjudicaciones: [], AntecedentesLegacy: [], Faltantes: [], Advertencias: []
    };
  }

  function adjudicacion(id: number, activa: boolean, titularId: number, cotitulares: any[]): any {
    return {
      IdAdjudicacion: id, NumeroExpediente: undefined, FechaAdjudicacion: undefined, Activa: activa,
      Propiedad: { IdPropiedad: id, Calle: 'San Martín', Altura: '100', Catastro: 'C-1', Barrio: 'Centro' },
      Plan: { IdPlan: id, Nombre: `Plan ${id}`, Origen: 'IMV' },
      TitularPrincipal: { IdPersona: titularId, DNI: '12345678', NombreCompleto: 'Pérez, Ana', EsTitularPrincipal: true },
      Cotitulares: cotitulares,
      HistorialEstados: [{
        IdEstado: 1, Descripcion: 'Estado iniciado', FechaCambio: '2026-08-31T09:00:00',
        Usuario: 'operador'
      }]
    };
  }
});
