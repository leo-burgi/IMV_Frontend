import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { Calle } from '../../core/models/calle.model';
import { CalleService } from '../../core/services/calle.service';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { ImvFilterPipe } from '../../shared/imv-filter.pipe';
import { CallesComponent } from './calles.component';

describe('CallesComponent', () => {
  let component: CallesComponent;
  let fixture: ComponentFixture<CallesComponent>;
  let calleService: jasmine.SpyObj<CalleService>;

  beforeEach(async () => {
    calleService = jasmine.createSpyObj<CalleService>(
      'CalleService',
      ['getCalles', 'createCalle', 'updateCalle']
    );
    calleService.getCalles.and.returnValue(of([]));

    const searchService = {
      searchTerm$: of(''),
      setSearch: jasmine.createSpy('setSearch')
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CallesComponent, ImvFilterPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CalleService, useValue: calleService },
        { provide: ImvSearchService, useValue: searchService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar el listado', () => {
    expect(component).toBeTruthy();
    expect(calleService.getCalles).toHaveBeenCalled();
  });

  it('debe incluir IdCalle al editar', () => {
    const calle: Calle = {
      IdCalle: 12,
      Nombre: 'Calle original',
      NombreReducido: 'Original'
    };
    calleService.updateCalle.and.returnValue(of({
      ...calle,
      Nombre: 'Calle editada'
    }));

    component.abrirModalAlta(calle);
    component.calleForm.Nombre = ' Calle editada ';
    component.guardarCalle();

    expect(calleService.updateCalle).toHaveBeenCalledWith({
      IdCalle: 12,
      Nombre: 'Calle editada',
      NombreReducido: 'Original'
    });
  });
});
