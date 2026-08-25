import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe solicitar la navegacion a Personas', () => {
    spyOn(component.solicitarNavegacion, 'emit');

    component.irASeccion('personas');

    expect(component.solicitarNavegacion.emit).toHaveBeenCalledWith('personas');
  });

  it('debe construir el grafico con la distribucion de estados', () => {
    component.dashboardData = {
      TotalBarrios: 1,
      TotalAdjudicaciones: 10,
      TotalPlanes: 1,
      TotalPersonas: 12,
      TopBarrios: [],
      EstadosEscrituras: [
        { Estado: 'Iniciada', Cantidad: 6, Porcentaje: 60 },
        { Estado: 'Finalizada', Cantidad: 4, Porcentaje: 40 }
      ]
    };

    expect(component.estiloGraficoEscrituras).toContain('conic-gradient');
    expect(component.estiloGraficoEscrituras).toContain('60%');
    expect(component.descripcionGraficoEscrituras).toContain('Finalizada: 40%');
  });

  it('debe aplicar una progresión de cinco colores al Top 5', () => {
    const colores = [0, 1, 2, 3, 4].map(i => component.colorBarrio(i));
    expect(new Set(colores).size).toBe(5);
    expect(colores).toEqual(component.coloresBarrios);
  });
});
