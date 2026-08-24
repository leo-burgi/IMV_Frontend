import { Component, OnInit } from '@angular/core';
import { Persona } from '../../core/models/persona.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PersonaService } from '../../core/services/persona.service';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['../../shared/imv-table.css']
})
export class PersonasComponent implements OnInit {
  listaPersonas: Persona[] = [];
  filtroBusqueda = '';
  mostrarModalAlta = false;
  modoEdicion = false;
  guardando = false;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  readonly pageSize = 15;
  currentPage = 1;
  personaForm: Partial<Persona> = this.emptyForm();

  constructor(
    private personaService: PersonaService,
    private searchService: ImvSearchService
  ) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe(term => {
      this.filtroBusqueda = term || '';
      this.currentPage = 1;
    });
    this.cargarPersonas();
  }

  cargarPersonas(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.personaService.getPersonas().subscribe({
      next: data => {
        this.listaPersonas = data || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar las personas desde IMV.Api.';
      }
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.currentPage = 1;
    this.searchService.setSearch(term);
  }

  get personasFiltradas(): Persona[] {
    const term = this.filtroBusqueda.trim().toLowerCase();
    const termDigits = this.onlyDigits(term);

    return this.listaPersonas.filter(persona => {
      if (!term) return true;

      const text = `${persona.Apellido || ''} ${persona.Nombre || ''} ${persona.DNI || ''} ${persona.CuilCuit || ''}`
        .toLowerCase();
      const identifierMatches = !!termDigits && (
        this.onlyDigits(persona.DNI).includes(termDigits) ||
        this.onlyDigits(persona.CuilCuit).includes(termDigits)
      );

      return text.includes(term) || identifierMatches;
    });
  }

  get personasPaginadas(): Persona[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.personasFiltradas.slice(start, start + this.pageSize);
  }

  cambiarPagina(page: number): void { this.currentPage = page; }

  abrirModalAlta(persona?: Persona): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.modoEdicion = !!persona;
    this.personaForm = persona ? { ...persona } : this.emptyForm();
    this.mostrarModalAlta = true;
  }

  cerrarModalAlta(): void {
    this.mostrarModalAlta = false;
    this.guardando = false;
    this.modoEdicion = false;
    this.mensajeError = '';
    this.personaForm = this.emptyForm();
  }

  guardarPersona(): void {
    const dni = this.personaForm.DNI && this.personaForm.DNI.trim();
    const apellido = this.personaForm.Apellido && this.personaForm.Apellido.trim();
    const nombre = this.personaForm.Nombre && this.personaForm.Nombre.trim();
    if (!dni || !apellido || !nombre) {
      this.mensajeError = 'DNI, apellido y nombre son obligatorios.';
      return;
    }

    const datos: Persona = {
      DNI: dni,
      Apellido: apellido,
      Nombre: nombre,
      CuilCuit: this.optional(this.personaForm.CuilCuit),
      Telefono: this.optional(this.personaForm.Telefono),
      Email: this.optional(this.personaForm.Email)
    };
    const request = this.modoEdicion && this.personaForm.IdPersona
      ? this.personaService.updatePersona({ ...datos, IdPersona: this.personaForm.IdPersona })
      : this.personaService.createPersona(datos);

    this.guardando = true;
    this.mensajeError = '';
    request.subscribe({
      next: () => {
        this.cargarPersonas();
        this.mostrarModalAlta = false;
        this.guardando = false;
        this.mensajeExito = this.modoEdicion
          ? 'La persona se actualizó correctamente.'
          : 'La persona se cargó correctamente.';
        this.modoEdicion = false;
        this.personaForm = this.emptyForm();
      },
      error: error => {
        this.guardando = false;
        this.mensajeError = error.error && error.error.Message
          ? error.error.Message
          : 'No se pudo guardar la persona.';
      }
    });
  }

  editarPersona(persona: Persona): void {
    this.abrirModalAlta(persona);
  }

  private emptyForm(): Partial<Persona> {
    return { DNI: '', CuilCuit: '', Apellido: '', Nombre: '', Telefono: '', Email: '' };
  }

  private optional(value?: string): string | undefined {
    return value && value.trim() ? value.trim() : undefined;
  }

  private onlyDigits(value?: string): string {
    return (value || '').replace(/\D/g, '');
  }
}
