import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ConsultaIntegralDetalle } from '../../core/models/consulta-integral.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PropiedadService } from '../../core/services/propiedad.service';
import { BarrioService } from '../../core/services/barrio.service';
import { CalleService } from '../../core/services/calle.service';
import { ConsultaIntegralService } from '../../core/services/consulta-integral.service';
import { PropiedadesComponent } from './propiedades.component';

describe('PropiedadesComponent', () => {
  let fixture: ComponentFixture<PropiedadesComponent>;
  let component: PropiedadesComponent;
  let service: jasmine.SpyObj<PropiedadService>;
  let consultaService: jasmine.SpyObj<ConsultaIntegralService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<PropiedadService>('PropiedadService', ['getPropiedadesPaginadas', 'updatePropiedad']);
    consultaService = jasmine.createSpyObj<ConsultaIntegralService>('ConsultaIntegralService', ['getPropiedad']);
    service.getPropiedadesPaginadas.and.returnValue(of({ Page: 1, PageSize: 15, Total: 0, Items: [] }));
    await TestBed.configureTestingModule({
      declarations: [PropiedadesComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PropiedadService, useValue: service },
        { provide: ConsultaIntegralService, useValue: consultaService },
        { provide: BarrioService, useValue: { getBarrios: () => of([{ IdBarrio: 1, Nombre: 'MORA' }]) } },
        { provide: CalleService, useValue: { getCalles: () => of([{ IdCalle: 2, Nombre: 'LAVALLE' }]) } },
        { provide: ImvSearchService, useValue: { searchTerm$: of(''), setSearch: jasmine.createSpy('setSearch') } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PropiedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar el listado', () => {
    expect(component).toBeTruthy();
    expect(service.getPropiedadesPaginadas).toHaveBeenCalled();
  });

  it('debe volver a página 1 y enviar filtros al servidor', () => {
    component.currentPage = 4;
    component.filtroBarrio = 'MORA';
    component.filtroEstado = 'activas';
    component.filtroCatastro = 'con';
    component.onCriterioChange();
    expect(component.currentPage).toBe(1);
    expect(service.getPropiedadesPaginadas).toHaveBeenCalledWith(1, 15, '', 'MORA', 'activas', 'con');
  });

  it('debe abrir la ficha integral de sólo lectura por id', () => {
    const propiedad = propiedadLista();
    const response = detallePropiedad();
    consultaService.getPropiedad.and.returnValue(of(response));
    component.verDetalle(propiedad);
    expect(consultaService.getPropiedad).toHaveBeenCalledWith(1);
    expect(component.detalle).toEqual(response);
  });

  it('debe localizar y abrir la misma ficha desde navegación contextual', () => {
    const propiedad = propiedadLista(12);
    const response = detallePropiedad(12);
    component.idPropiedadSeleccionada = 12;
    component.filtroBusqueda = '12';
    service.getPropiedadesPaginadas.and.returnValue(of({ Page: 1, PageSize: 15, Total: 1, Items: [propiedad] }));
    consultaService.getPropiedad.and.returnValue(of(response));

    component.cargarPropiedades();

    expect(service.getPropiedadesPaginadas).toHaveBeenCalledWith(1, 15, '12', '', 'todas', 'todas');
    expect(consultaService.getPropiedad).toHaveBeenCalledWith(12);
    expect(component.detalle?.Propiedad?.IdPropiedad).toBe(12);
  });

  it('debe enviar los campos editables y convertir vacíos en valores nulos', () => {
    const actualizado = propiedadLista();
    service.updatePropiedad.and.returnValue(of(actualizado));
    consultaService.getPropiedad.and.returnValue(of(detallePropiedad()));
    component.editarPropiedad(propiedadLista());
    component.propiedadForm!.NroCatastro = '  CAT-10  ';
    component.propiedadForm!.Altura = '   ';
    component.propiedadForm!.Manzana = ' M1 ';
    component.propiedadForm!.Lote = '';

    component.guardarPropiedad();

    expect(service.updatePropiedad).toHaveBeenCalledWith(jasmine.objectContaining({
      IdPropiedad: 1, IdBarrio: 1, IdCalle: 2,
      NroCatastro: 'CAT-10', Altura: undefined, Manzana: 'M1', Lote: undefined
    }));
    expect(component.mensajeExito).toContain('actualizó correctamente');
  });

  it('debe mostrar el mensaje funcional de catastro duplicado sin cerrar la edición', () => {
    service.updatePropiedad.and.returnValue(throwError({ error: { Message: 'Ya existe otra propiedad activa con el mismo catastro.' } }));
    component.editarPropiedad(propiedadLista());

    component.guardarPropiedad();

    expect(component.mostrarEdicion).toBeTrue();
    expect(component.mensajeError).toContain('mismo catastro');
  });

  it('debe emitir navegación hacia Adjudicación, Persona o Plan desde la ficha', () => {
    const destinos: any[] = [];
    component.solicitarNavegacion.subscribe(destino => destinos.push(destino));
    component.navegarDesdeFicha({ seccion: 'adjudicaciones', id: 9 });
    expect(destinos).toEqual([{ seccion: 'adjudicaciones', id: 9 }]);
  });

  function propiedadLista(id = 1): any {
    return { IdPropiedad: id, IdBarrio: 1, Barrio: 'MORA', IdCalle: 2, Calle: 'LAVALLE', Altura: '100' };
  }

  function detallePropiedad(id = 1): ConsultaIntegralDetalle {
    return {
      TipoResultado: 'PROPIEDAD', NivelConfianza: 'DEFINITIVO',
      Propiedad: { IdPropiedad: id, IdBarrio: 1, IdCalle: 2, Barrio: 'MORA', Calle: 'LAVALLE', Altura: '100' },
      Adjudicaciones: [], AntecedentesLegacy: [], Faltantes: [], Advertencias: []
    };
  }
});
