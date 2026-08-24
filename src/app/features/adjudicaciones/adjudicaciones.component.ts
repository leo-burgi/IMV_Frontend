import { Component, OnInit } from '@angular/core';
import {
  Adjudicacion, AdjudicacionCatalogos, AdjudicacionPayload
} from '../../core/models/adjudicacion.model';
import { AdjudicacionService } from '../../core/services/adjudicacion.service';
import { ImvSearchService } from '../../core/services/imv-search.service';

type ModalMode = 'alta' | 'edicion' | 'detalle';

@Component({
  selector: 'app-adjudicaciones',
  templateUrl: './adjudicaciones.component.html',
  styleUrls: ['../../shared/imv-table.css', './adjudicaciones.component.css']
})
export class AdjudicacionesComponent implements OnInit {
  lista: Adjudicacion[] = [];
  catalogos: AdjudicacionCatalogos = { Propiedades: [], Planes: [], Personas: [] };
  filtroBusqueda = '';
  filtroPlan = 0;
  filtroEstado = 'todas';
  cargando = false;
  guardando = false;
  mostrarModal = false;
  modo: ModalMode = 'alta';
  mensajeError = '';
  mensajeExito = '';
  seleccionada: Adjudicacion | null = null;
  formulario: AdjudicacionPayload = this.emptyForm();

  constructor(
    private service: AdjudicacionService,
    private searchService: ImvSearchService
  ) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe(term => this.filtroBusqueda = term || '');
    this.cargarDatos();
  }

  get filtradas(): Adjudicacion[] {
    const termino = (this.filtroBusqueda || '').trim().toLowerCase();
    return this.lista.filter(item => {
      const coincidePlan = !this.filtroPlan || item.IdPlan === Number(this.filtroPlan);
      const coincideEstado = this.filtroEstado === 'todas'
        || (this.filtroEstado === 'activas' && item.Activa)
        || (this.filtroEstado === 'inactivas' && !item.Activa);
      const texto = [item.IdAdjudicacion, item.Propiedad, item.Catastro, item.NombrePlan,
        item.OrigenPlan, item.TitularPrincipal, item.DniTitularPrincipal,
        item.NroLegajoFisico, ...(item.Cotitulares || []).map(x => `${x.NombreCompleto} ${x.DNI || ''}`)]
        .join(' ').toLowerCase();
      return coincidePlan && coincideEstado && (!termino || texto.includes(termino));
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.service.getCatalogos().subscribe({
      next: catalogos => {
        this.catalogos = catalogos;
        this.cargarListado();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar los datos necesarios para Adjudicaciones.';
      }
    });
  }

  cargarListado(): void {
    this.service.getAdjudicaciones().subscribe({
      next: data => {
        this.lista = data || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar las adjudicaciones desde IMV.Api.';
      }
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.searchService.setSearch(term);
  }

  abrirAlta(): void {
    this.modo = 'alta';
    this.seleccionada = null;
    this.formulario = this.emptyForm();
    this.abrirModal();
  }

  abrirDetalle(item: Adjudicacion): void {
    this.modo = 'detalle';
    this.seleccionada = item;
    this.abrirModal();
  }

  abrirEdicion(item: Adjudicacion): void {
    this.modo = 'edicion';
    this.seleccionada = item;
    this.formulario = {
      IdAdjudicacion: item.IdAdjudicacion,
      IdPropiedad: item.IdPropiedad,
      IdPlan: item.IdPlan,
      IdTitularPrincipal: item.IdTitularPrincipal,
      IdCotitulares: (item.Cotitulares || []).map(x => x.IdPersona),
      NroLegajoFisico: item.NroLegajoFisico || '',
      FechaAdjudicacion: item.FechaAdjudicacion ? item.FechaAdjudicacion.substring(0, 10) : '',
      Activa: item.Activa
    };
    this.abrirModal();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.guardando = false;
    this.mensajeError = '';
  }

  guardar(): void {
    if (!this.formulario.IdPropiedad || !this.formulario.IdPlan || !this.formulario.IdTitularPrincipal) {
      this.mensajeError = 'Propiedad, Plan y titular principal son obligatorios.';
      return;
    }
    if ((this.formulario.IdCotitulares || []).includes(Number(this.formulario.IdTitularPrincipal))) {
      this.mensajeError = 'El titular principal no puede seleccionarse como cotitular.';
      return;
    }

    const payload: AdjudicacionPayload = {
      ...this.formulario,
      IdPropiedad: Number(this.formulario.IdPropiedad),
      IdPlan: Number(this.formulario.IdPlan),
      IdTitularPrincipal: Number(this.formulario.IdTitularPrincipal),
      IdCotitulares: (this.formulario.IdCotitulares || []).map(Number),
      NroLegajoFisico: this.optional(this.formulario.NroLegajoFisico),
      FechaAdjudicacion: this.formulario.FechaAdjudicacion || undefined
    };
    const request = this.modo === 'edicion'
      ? this.service.updateAdjudicacion(payload)
      : this.service.createAdjudicacion(payload);

    this.guardando = true;
    this.mensajeError = '';
    request.subscribe({
      next: () => {
        this.mostrarModal = false;
        this.guardando = false;
        this.mensajeExito = this.modo === 'edicion'
          ? 'La adjudicación se actualizó correctamente.'
          : 'La adjudicación se creó correctamente.';
        this.cargarListado();
      },
      error: error => {
        this.guardando = false;
        this.mensajeError = error.error && error.error.Message
          ? error.error.Message
          : 'No se pudo guardar la adjudicación.';
      }
    });
  }

  private abrirModal(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.mostrarModal = true;
  }

  private emptyForm(): AdjudicacionPayload {
    return { IdPropiedad: 0, IdPlan: 0, IdTitularPrincipal: 0, IdCotitulares: [], Activa: true };
  }

  private optional(value?: string): string | undefined {
    return value && value.trim() ? value.trim() : undefined;
  }
}
