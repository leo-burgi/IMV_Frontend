import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConsultaDestinoContextual, ConsultaIntegralDetalle } from '../../core/models/consulta-integral.model';
import { Persona } from '../../core/models/persona.model';
import { ConsultaIntegralService } from '../../core/services/consulta-integral.service';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PersonaService } from '../../core/services/persona.service';

@Component({
  selector: 'app-personas',
  templateUrl: './personas.component.html',
  styleUrls: ['../../shared/imv-table.css', '../../shared/imv-detail.css']
})
export class PersonasComponent implements OnInit, OnDestroy {
  @Input() idPersonaSeleccionada?: number;
  @Output() solicitarNavegacion = new EventEmitter<ConsultaDestinoContextual>();
  listaPersonas: Persona[] = [];
  filtroBusqueda = '';
  mostrarModalAlta = false;
  mostrarFicha = false;
  cargandoFicha = false;
  personaDetalle?: ConsultaIntegralDetalle;
  personaSeleccionada?: Persona;
  private solicitudFicha?: Subscription;
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
    private consultaIntegralService: ConsultaIntegralService,
    private searchService: ImvSearchService
  ) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe(term => {
      this.filtroBusqueda = term || '';
      this.currentPage = 1;
    });
    this.cargarPersonas();
  }

  ngOnDestroy(): void {
    this.cancelarSolicitudFicha();
  }

  cargarPersonas(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.personaService.getPersonas().subscribe({
      next: data => {
        this.listaPersonas = data || [];
        this.cargando = false;
        this.abrirPersonaContextual();
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

  verPersona(persona: Persona): void {
    if (!persona.IdPersona) return;
    const idPersona = persona.IdPersona;
    this.cancelarSolicitudFicha();
    this.personaSeleccionada = persona;
    this.personaDetalle = undefined;
    this.mostrarFicha = true;
    this.cargandoFicha = true;
    this.mensajeError = '';
    this.solicitudFicha = this.consultaIntegralService.getPersona(idPersona).subscribe({
      next: detalle => {
        if (!this.esFichaActiva(idPersona)) return;
        this.personaDetalle = detalle;
        this.cargandoFicha = false;
      },
      error: () => {
        if (!this.esFichaActiva(idPersona)) return;
        this.cargandoFicha = false;
        this.mostrarFicha = false;
        this.mensajeError = 'No se pudo cargar la ficha integral de la persona.';
      }
    });
  }

  cerrarFicha(): void {
    this.cancelarSolicitudFicha();
    this.mostrarFicha = false;
    this.cargandoFicha = false;
    this.personaDetalle = undefined;
    this.personaSeleccionada = undefined;
  }

  editarDesdeFicha(): void {
    const persona = this.personaSeleccionada;
    this.cerrarFicha();
    if (persona) this.editarPersona(persona);
  }

  navegarDesdeFicha(destino: ConsultaDestinoContextual): void {
    this.cerrarFicha();
    this.solicitarNavegacion.emit(destino);
  }

  private abrirPersonaContextual(): void {
    if (!this.idPersonaSeleccionada) return;
    const index = this.listaPersonas.findIndex(persona => persona.IdPersona === this.idPersonaSeleccionada);
    if (index < 0) {
      this.mensajeError = 'No se encontró la persona seleccionada.';
      return;
    }

    this.filtroBusqueda = '';
    this.currentPage = Math.floor(index / this.pageSize) + 1;
    const persona = this.listaPersonas[index];
    this.idPersonaSeleccionada = undefined;
    this.verPersona(persona);
  }

  private esFichaActiva(idPersona: number): boolean {
    return this.mostrarFicha
      && !!this.personaSeleccionada
      && this.personaSeleccionada.IdPersona === idPersona;
  }

  private cancelarSolicitudFicha(): void {
    if (this.solicitudFicha) {
      this.solicitudFicha.unsubscribe();
      this.solicitudFicha = undefined;
    }
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
