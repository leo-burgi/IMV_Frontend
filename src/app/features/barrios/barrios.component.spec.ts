import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Barrio } from '../../core/models/barrio.model';
import { BarrioService } from '../../core/services/barrio.service';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { ImvFilterPipe } from '../../shared/imv-filter.pipe';
import { BarriosComponent } from './barrios.component';

describe('BarriosComponent', () => {
  let component: BarriosComponent;
  let fixture: ComponentFixture<BarriosComponent>;
  let barrioService: jasmine.SpyObj<BarrioService>;

  beforeEach(async () => {
    barrioService = jasmine.createSpyObj<BarrioService>(
      'BarrioService',
      ['getBarrios', 'createBarrio', 'updateBarrio']
    );
    barrioService.getBarrios.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [BarriosComponent, ImvFilterPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: BarrioService, useValue: barrioService },
        {
          provide: ImvSearchService,
          useValue: { searchTerm$: of(''), setSearch: jasmine.createSpy('setSearch') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BarriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar el listado', () => {
    expect(component).toBeTruthy();
    expect(barrioService.getBarrios).toHaveBeenCalled();
  });

  it('debe incluir IdBarrio al editar', () => {
    const barrio: Barrio = { IdBarrio: 8, Nombre: 'Original' };
    barrioService.updateBarrio.and.returnValue(of({ IdBarrio: 8, Nombre: 'Editado' }));
    component.abrirModalAlta(barrio);
    component.barrioForm.Nombre = ' Editado ';
    component.guardarBarrio();
    expect(barrioService.updateBarrio).toHaveBeenCalledWith({
      IdBarrio: 8,
      Nombre: 'Editado'
    });
  });
});
