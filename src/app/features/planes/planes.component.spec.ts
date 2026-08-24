import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Plan } from '../../core/models/plan.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PlanService } from '../../core/services/plan.service';
import { ImvFilterPipe } from '../../shared/imv-filter.pipe';
import { PlanesComponent } from './planes.component';

describe('PlanesComponent', () => {
  let component: PlanesComponent;
  let fixture: ComponentFixture<PlanesComponent>;
  let planService: jasmine.SpyObj<PlanService>;

  beforeEach(async () => {
    planService = jasmine.createSpyObj<PlanService>(
      'PlanService',
      ['getPlanes', 'createPlan', 'updatePlan']
    );
    planService.getPlanes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [PlanesComponent, ImvFilterPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: PlanService, useValue: planService },
        {
          provide: ImvSearchService,
          useValue: { searchTerm$: of(''), setSearch: jasmine.createSpy('setSearch') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar el listado', () => {
    expect(component).toBeTruthy();
    expect(planService.getPlanes).toHaveBeenCalled();
  });

  it('debe incluir IdPlan, origen y nombre normalizados al editar', () => {
    const plan: Plan = { IdPlan: 5, OrigenPlan: 'IMV', NombrePlan: 'Original' };
    planService.updatePlan.and.returnValue(of({ IdPlan: 5, OrigenPlan: 'PROVINCIAL', NombrePlan: 'Editado' }));
    component.abrirModalAlta(plan);
    component.planForm.OrigenPlan = ' PROVINCIAL ';
    component.planForm.NombrePlan = ' Editado ';
    component.guardarPlan();
    expect(planService.updatePlan).toHaveBeenCalledWith({
      IdPlan: 5,
      OrigenPlan: 'PROVINCIAL',
      NombrePlan: 'Editado'
    });
  });

  it('debe conservar visibles los planes históricos sin nombre', () => {
    component.listaPlanes = [{ IdPlan: 113, OrigenPlan: 'IMV', NombrePlan: null }];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin nombre informado');
    expect(fixture.nativeElement.textContent).toContain('IMV');
  });

  it('debe paginar de a 15 y volver a página 1 al buscar', () => {
    component.listaPlanes = Array.from({ length: 20 }, (_, i) => ({ IdPlan: i + 1, OrigenPlan: 'IMV', NombrePlan: `Plan ${i + 1}` }));
    component.currentPage = 2;
    expect(component.planesPaginados.length).toBe(5);
    component.onFiltroChange('Plan 1');
    expect(component.currentPage).toBe(1);
  });
});
