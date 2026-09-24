import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConsultaIntegralDetalle } from '../../core/models/consulta-integral.model';
import { AuditoriaService } from '../../core/services/auditoria.service';
import { PropiedadFichaComponent } from './propiedad-ficha.component';

describe('PropiedadFichaComponent', () => {
  let fixture: ComponentFixture<PropiedadFichaComponent>;
  let component: PropiedadFichaComponent;
  let auditoriaService: jasmine.SpyObj<AuditoriaService>;

  beforeEach(async () => {
    auditoriaService = jasmine.createSpyObj<AuditoriaService>('AuditoriaService', ['getHistorial']);
    await TestBed.configureTestingModule({
      declarations: [PropiedadFichaComponent],
      providers: [{ provide: AuditoriaService, useValue: auditoriaService }]
    }).compileComponents();
    fixture = TestBed.createComponent(PropiedadFichaComponent);
    component = fixture.componentInstance;
  });

  it('debe mostrar valores faltantes y ausencia de adjudicaciones sin romper la ficha', () => {
    component.detalle = detalleBase();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('No hay adjudicaciones definitivas');
    expect(text).toContain('Sin dato');
  });

  it('debe mostrar adjudicaciones, titulares, plan y antecedentes sin presentarlos como definitivos', () => {
    const detalle = detalleBase();
    detalle.Adjudicaciones = [{
      IdAdjudicacion: 7, NumeroExpediente: undefined, Activa: true,
      Propiedad: detalle.Propiedad!,
      Plan: { IdPlan: 3, Nombre: 'Plan Norte', Origen: 'IMV' },
      TitularPrincipal: { IdPersona: 4, DNI: '12345678', NombreCompleto: 'Pérez, Ana', EsTitularPrincipal: true },
      Cotitulares: [{ IdPersona: 5, NombreCompleto: 'Gómez, Luis', EsTitularPrincipal: false }],
      EstadoNotarialActual: { IdEstado: 2, Descripcion: 'Escriturado', FechaCambio: '2026-08-31T10:00:00' },
      HistorialEstados: [
        { IdEstado: 2, Descripcion: 'Escriturado', FechaCambio: '2026-08-31T10:00:00', Usuario: 'operador' },
        { IdEstado: 1, Descripcion: 'Iniciado', FechaCambio: '2026-08-30T09:00:00', Usuario: 'operador' }
      ]
    }];
    detalle.AntecedentesLegacy = [{
      IdRegistro: 20, IdLote: 12, HojaOrigen: 'Hoja 1', FilaOrigen: 8,
      CategoriaInformacion: 'COINCIDENCIA_CANDIDATA', EstadoValidacion: 'PENDIENTE_VERIFICACION',
      CodigoMotivo: 'PLAN_NO_RESUELTO', RawObservaciones: 'Texto original'
    }];
    component.detalle = detalle;
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Plan Norte');
    expect(text).toContain('Titular principal');
    expect(text).toContain('Cotitular');
    expect(text).toContain('Coincidencia candidata');
    expect(text).toContain('PLAN_NO_RESUELTO');
    expect(text).toContain('Texto original');
    expect(text).toContain('Historial notarial');
    expect(text).toContain('Escriturado');
  });

  it('debe obtener y mostrar el historial auditado de la propiedad', () => {
    auditoriaService.getHistorial.and.returnValue(of([{
      IdAuditoria: 1, Entidad: 'Propiedades', IdEntidad: 1, Operacion: 'MODIFICACION',
      Campo: 'Catastro', ValorAnterior: 'A', ValorNuevo: 'B', Usuario: 'operador',
      FechaHora: '2026-08-31T10:00:00'
    }]));
    component.detalle = detalleBase();
    fixture.detectChanges();

    component.verHistorial();
    fixture.detectChanges();

    expect(auditoriaService.getHistorial).toHaveBeenCalledWith('Propiedades', 1);
    expect(fixture.nativeElement.textContent).toContain('Catastro');
    expect(fixture.nativeElement.textContent).toContain('operador');
  });

  it('debe emitir navegación hacia adjudicación, titular y plan', () => {
    component.detalle = detalleBase();
    const destinos: any[] = [];
    component.solicitarNavegacion.subscribe(destino => destinos.push(destino));
    component.navegar('adjudicaciones', 7);
    component.navegar('personas', 4);
    component.navegar('planes', 3);
    expect(destinos).toEqual([
      { seccion: 'adjudicaciones', id: 7 },
      { seccion: 'personas', id: 4 },
      { seccion: 'planes', id: 3 }
    ]);
  });

  function detalleBase(): ConsultaIntegralDetalle {
    return {
      TipoResultado: 'PROPIEDAD', NivelConfianza: 'DEFINITIVO',
      Propiedad: { IdPropiedad: 1, IdBarrio: 2, IdCalle: 3, Calle: 'Lavalle', Barrio: 'Centro' },
      Adjudicaciones: [], AntecedentesLegacy: [], Faltantes: [], Advertencias: []
    };
  }
});
