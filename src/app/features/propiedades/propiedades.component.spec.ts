import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PropiedadService } from '../../core/services/propiedad.service';
import { BarrioService } from '../../core/services/barrio.service';
import { PropiedadesComponent } from './propiedades.component';

describe('PropiedadesComponent', () => {
  let fixture: ComponentFixture<PropiedadesComponent>;
  let component: PropiedadesComponent;
  let service: jasmine.SpyObj<PropiedadService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<PropiedadService>('PropiedadService', ['getPropiedadesPaginadas', 'getPropiedad']);
    service.getPropiedadesPaginadas.and.returnValue(of({ Page: 1, PageSize: 15, Total: 0, Items: [] }));
    await TestBed.configureTestingModule({
      declarations: [PropiedadesComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PropiedadService, useValue: service },
        { provide: BarrioService, useValue: { getBarrios: () => of([]) } },
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

  it('debe consultar el detalle por id', () => {
    const propiedad = { IdPropiedad: 1, IdBarrio: 1, Barrio: 'MORA', IdCalle: 1, Calle: 'LAVALLE' };
    service.getPropiedad.and.returnValue(of(propiedad));
    component.verDetalle(propiedad);
    expect(service.getPropiedad).toHaveBeenCalledWith(1);
    expect(component.seleccionada).toEqual(propiedad);
  });

  it('debe localizar y abrir la Propiedad seleccionada desde Consulta integral', () => {
    const propiedad = { IdPropiedad: 12, IdBarrio: 1, Barrio: 'MORA', IdCalle: 1, Calle: 'LAVALLE' };
    component.idPropiedadSeleccionada = 12;
    component.filtroBusqueda = '12';
    service.getPropiedadesPaginadas.and.returnValue(of({ Page: 1, PageSize: 15, Total: 1, Items: [propiedad] }));
    service.getPropiedad.and.returnValue(of(propiedad));

    component.cargarPropiedades();

    expect(service.getPropiedadesPaginadas).toHaveBeenCalledWith(1, 15, '12', '', 'todas', 'todas');
    expect(service.getPropiedad).toHaveBeenCalledWith(12);
    expect(component.seleccionada?.IdPropiedad).toBe(12);
  });
});
