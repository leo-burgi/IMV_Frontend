import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { AdjudicacionService } from '../../core/services/adjudicacion.service';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { AdjudicacionesComponent } from './adjudicaciones.component';

describe('AdjudicacionesComponent', () => {
  let component: AdjudicacionesComponent;
  let fixture: ComponentFixture<AdjudicacionesComponent>;
  let service: jasmine.SpyObj<AdjudicacionService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('AdjudicacionService', ['getCatalogos', 'getAdjudicacionesPaginadas']);
    service.getCatalogos.and.returnValue(of({ Propiedades: [], Planes: [], Personas: [] }));
    service.getAdjudicacionesPaginadas.and.returnValue(of({ Page: 1, PageSize: 15, Total: 0, Items: [] }));
    await TestBed.configureTestingModule({
      declarations: [AdjudicacionesComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AdjudicacionService, useValue: service },
        { provide: ImvSearchService, useValue: { searchTerm$: of(''), setSearch: jasmine.createSpy('setSearch') } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AdjudicacionesComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el módulo', () => expect(component).toBeTruthy());

  it('debe volver a página 1 al cambiar un filtro', () => {
    component.currentPage = 3;
    component.filtroEstado = 'activas';
    component.onCriterioChange();
    expect(component.currentPage).toBe(1);
    expect(service.getAdjudicacionesPaginadas).toHaveBeenCalledWith(1, 15, '', 0, 'activas');
  });

  it('debe mostrar cada cotitular con su DNI', () => {
    component.lista = [{
      IdAdjudicacion: 1, IdPropiedad: 1, Propiedad: 'Belgrano 100',
      IdPlan: 1, NombrePlan: 'Plan Norte', OrigenPlan: 'IMV',
      IdTitularPrincipal: 1, TitularPrincipal: 'Pérez, Ana',
      Cotitulares: [
        { IdPersona: 2, NombreCompleto: 'Gómez, Luis', DNI: '12345678' },
        { IdPersona: 3, NombreCompleto: 'López, Marta' }
      ], Activa: true
    }];
    component.total = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Gómez, Luis');
    expect(fixture.nativeElement.textContent).toContain('DNI: 12345678');
    expect(fixture.nativeElement.textContent).toContain('DNI: Sin dato');
  });
});
