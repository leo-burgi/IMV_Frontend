import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CalidadDatosAdjudicaciones } from '../../core/models/calidad-datos-adjudicaciones.model';
import { CalidadDatosPanelComponent } from './calidad-datos-panel.component';

describe('CalidadDatosPanelComponent', () => {
  let component: CalidadDatosPanelComponent;
  let fixture: ComponentFixture<CalidadDatosPanelComponent>;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/inicio/calidad-adjudicaciones`;
  const metricas: CalidadDatosAdjudicaciones = {
    TotalLegacy: 100,
    TotalMigradas: 25,
    PorcentajeMigrado: 25,
    SinCatastro: 40,
    PorcentajeSinCatastro: 40,
    PropiedadPendiente: 35,
    PorcentajePropiedadPendiente: 35,
    PlanPendiente: 10,
    PorcentajePlanPendiente: 10,
    TitularPendiente: 20,
    PorcentajeTitularPendiente: 20,
    CotitularPendiente: 5,
    PorcentajeCotitularPendiente: 5,
    Conflictos: 8,
    PorcentajeConflictos: 8,
    ConflictosHistoricos: 3,
    PorcentajeConflictosHistoricos: 3,
    NivelDeuda: 'ALTA',
    MigracionCompleta: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalidadDatosPanelComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CalidadDatosPanelComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe consultar y mostrar las métricas sin recalcularlas', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush(metricas);
    fixture.detectChanges();

    expect(component.calidadDatos).toEqual(metricas);
    expect(fixture.nativeElement.textContent).toContain('25 de 100 (25.0%)');
    expect(fixture.nativeElement.textContent).toContain('Faltan 10 registros por asociar a un plan');
    expect(fixture.nativeElement.textContent).not.toContain('Control administrativo');
    expect(fixture.nativeElement.textContent).not.toContain('Los indicadores pueden');
    expect(fixture.nativeElement.querySelector('.quality-card').classList).toContain('quality-card--alta');
  });

  it('debe mostrar el error y permitir reintentar', () => {
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(component.mensajeError).toContain('No se pudo consultar');
    fixture.nativeElement.querySelector('.quality-error button').click();
    httpMock.expectOne(apiUrl).flush(metricas);
  });

  it('debe solicitar navegación a Adjudicaciones', () => {
    spyOn(component.verAdjudicaciones, 'emit');
    fixture.detectChanges();
    httpMock.expectOne(apiUrl).flush(metricas);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.quality-footer button').click();
    expect(component.verAdjudicaciones.emit).toHaveBeenCalled();
  });
});
