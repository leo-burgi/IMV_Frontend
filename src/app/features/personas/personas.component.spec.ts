import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Persona } from '../../core/models/persona.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PersonaService } from '../../core/services/persona.service';
import { ImvFilterPipe } from '../../shared/imv-filter.pipe';
import { PersonasComponent } from './personas.component';

describe('PersonasComponent', () => {
  let fixture: ComponentFixture<PersonasComponent>;
  let component: PersonasComponent;
  let personaService: jasmine.SpyObj<PersonaService>;

  beforeEach(async () => {
    personaService = jasmine.createSpyObj<PersonaService>(
      'PersonaService',
      ['getPersonas', 'createPersona', 'updatePersona']
    );
    personaService.getPersonas.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [PersonasComponent, ImvFilterPipe],
      providers: [
        { provide: PersonaService, useValue: personaService },
        { provide: ImvSearchService, useValue: { searchTerm$: of(''), setSearch: jasmine.createSpy('setSearch') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe cargar personas al iniciar', () => {
    expect(component).toBeTruthy();
    expect(personaService.getPersonas).toHaveBeenCalled();
  });

  it('debe incluir IdPersona y normalizar el payload de edición', () => {
    const persona: Persona = { IdPersona: 4, DNI: '123', Apellido: 'Pérez', Nombre: 'Ana' };
    personaService.updatePersona.and.returnValue(of(persona));
    component.abrirModalAlta(persona);
    component.personaForm.Nombre = ' Ana María ';
    component.guardarPersona();
    expect(personaService.updatePersona).toHaveBeenCalledWith({
      IdPersona: 4,
      DNI: '123',
      Apellido: 'Pérez',
      Nombre: 'Ana María',
      CuilCuit: undefined,
      Telefono: undefined,
      Email: undefined
    });
  });
});
