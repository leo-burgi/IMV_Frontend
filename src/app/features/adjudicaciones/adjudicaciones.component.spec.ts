import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AdjudicacionesComponent } from './adjudicaciones.component';

describe('AdjudicacionesComponent', () => {
  let component: AdjudicacionesComponent;
  let fixture: ComponentFixture<AdjudicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdjudicacionesComponent],
      imports: [FormsModule, HttpClientTestingModule]
    }).compileComponents();
    fixture = TestBed.createComponent(AdjudicacionesComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el módulo', () => expect(component).toBeTruthy());

  it('debe filtrar por estado y texto', () => {
    component.lista = [{
      IdAdjudicacion: 1, IdPropiedad: 1, Propiedad: 'Belgrano 100', Catastro: '123',
      IdPlan: 1, NombrePlan: 'Plan Norte', OrigenPlan: 'IMV', IdTitularPrincipal: 1, TitularPrincipal: 'Pérez, Ana',
      Cotitulares: [], Activa: true
    }];
    component.filtroBusqueda = 'belgrano';
    component.filtroEstado = 'activas';
    expect(component.filtradas.length).toBe(1);
    component.filtroEstado = 'inactivas';
    expect(component.filtradas.length).toBe(0);
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
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Gómez, Luis');
    expect(fixture.nativeElement.textContent).toContain('DNI: 12345678');
    expect(fixture.nativeElement.textContent).toContain('DNI: Sin dato');
  });
});
