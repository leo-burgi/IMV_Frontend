import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Persona } from '../../core/models/persona.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PersonaService } from '../../core/services/persona.service';
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
      declarations: [PersonasComponent],
      schemas: [NO_ERRORS_SCHEMA],
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

  it('debe paginar de a 15 y mostrar la última página sin filas vacías', () => {
    component.listaPersonas = crearPersonas(32);

    expect(component.personasPaginadas.length).toBe(15);
    component.cambiarPagina(3);

    expect(component.currentPage).toBe(3);
    expect(component.personasPaginadas.length).toBe(2);
    expect(component.personasPaginadas[0].IdPersona).toBe(31);
  });

  it('debe volver a página 1 al cambiar la búsqueda', () => {
    component.currentPage = 2;

    component.onFiltroChange('Pérez');

    expect(component.currentPage).toBe(1);
  });

  it('debe buscar por nombre, apellido, DNI y CUIT/CUIL ignorando separadores numéricos', () => {
    component.listaPersonas = [
      { IdPersona: 1, DNI: '12345678', CuilCuit: '20-12345678-3', Apellido: 'Pérez', Nombre: 'Ana' },
      { IdPersona: 2, DNI: '87654321', Apellido: 'Gómez', Nombre: 'Luis' }
    ];

    component.filtroBusqueda = '12.345.678';
    expect(component.personasFiltradas.map(persona => persona.IdPersona)).toEqual([1]);

    component.filtroBusqueda = '20 12345678 3';
    expect(component.personasFiltradas.map(persona => persona.IdPersona)).toEqual([1]);

    component.filtroBusqueda = 'ana';
    expect(component.personasFiltradas.map(persona => persona.IdPersona)).toEqual([1]);

    component.filtroBusqueda = 'Gómez';
    expect(component.personasFiltradas.map(persona => persona.IdPersona)).toEqual([2]);
  });

  it('debe mostrar una representación neutra cuando faltan DNI y CUIT/CUIL', () => {
    component.listaPersonas = [
      { IdPersona: 1, DNI: null as any, CuilCuit: undefined, Apellido: 'Pérez', Nombre: 'Ana' }
    ];

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Pérez, Ana');
    expect(text.match(/Sin dato/g).length).toBeGreaterThanOrEqual(2);
  });

  it('debe abrir directamente la Persona seleccionada desde Consulta integral', () => {
    const personas = crearPersonas(20);
    component.idPersonaSeleccionada = 18;
    personaService.getPersonas.and.returnValue(of(personas));

    component.cargarPersonas();

    expect(component.currentPage).toBe(2);
    expect(component.mostrarModalAlta).toBeTrue();
    expect(component.personaForm.IdPersona).toBe(18);
  });

  function crearPersonas(cantidad: number): Persona[] {
    return Array.from({ length: cantidad }, (_, index) => ({
      IdPersona: index + 1,
      DNI: `${10000000 + index}`,
      Apellido: `Apellido ${index + 1}`,
      Nombre: `Nombre ${index + 1}`
    }));
  }
});
