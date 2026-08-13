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

  it('debe incluir IdPlan al editar y permitir Programa vacío', () => {
    const plan: Plan = { IdPlan: 5, NombrePlan: 'Original', Programa: 'Anterior' };
    planService.updatePlan.and.returnValue(of({ IdPlan: 5, NombrePlan: 'Editado' }));
    component.abrirModalAlta(plan);
    component.planForm.NombrePlan = ' Editado ';
    component.planForm.Programa = '   ';
    component.guardarPlan();
    expect(planService.updatePlan).toHaveBeenCalledWith({
      IdPlan: 5,
      NombrePlan: 'Editado',
      Programa: undefined
    });
  });
});
