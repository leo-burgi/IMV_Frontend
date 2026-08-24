import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PropiedadService } from '../../core/services/propiedad.service';
import { PropiedadesComponent } from './propiedades.component';

describe('PropiedadesComponent', () => {
  let fixture: ComponentFixture<PropiedadesComponent>;
  let component: PropiedadesComponent;
  let service: jasmine.SpyObj<PropiedadService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<PropiedadService>('PropiedadService', ['getPropiedades', 'getPropiedad']);
    service.getPropiedades.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      declarations: [PropiedadesComponent],
      imports: [FormsModule],
      providers: [
        { provide: PropiedadService, useValue: service },
        { provide: ImvSearchService, useValue: { searchTerm$: of(''), setSearch: jasmine.createSpy('setSearch') } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PropiedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar el listado', () => {
    expect(component).toBeTruthy();
    expect(service.getPropiedades).toHaveBeenCalled();
  });

  it('debe filtrar por barrio, estado y catastro sin modificar datos', () => {
    component.lista = [
      { IdPropiedad: 1, IdBarrio: 1, Barrio: 'MORA', IdCalle: 1, Calle: 'LAVALLE', NroCatastro: '123' },
      { IdPropiedad: 2, IdBarrio: 2, Barrio: 'CENTRO', IdCalle: 2, Calle: 'MITRE', FechaBaja: '2026-08-20' }
    ];
    component.filtroBarrio = 'MORA';
    component.filtroEstado = 'activas';
    component.filtroCatastro = 'con';
    expect(component.filtradas.map(x => x.IdPropiedad)).toEqual([1]);
  });

  it('debe consultar el detalle por id', () => {
    const propiedad = { IdPropiedad: 1, IdBarrio: 1, Barrio: 'MORA', IdCalle: 1, Calle: 'LAVALLE' };
    service.getPropiedad.and.returnValue(of(propiedad));
    component.verDetalle(propiedad);
    expect(service.getPropiedad).toHaveBeenCalledWith(1);
    expect(component.seleccionada).toEqual(propiedad);
  });
});
