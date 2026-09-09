import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  Adjudicacion, AdjudicacionCatalogos, AdjudicacionPayload, CambioEstadoNotarialPayload
} from '../../core/models/adjudicacion.model';
import { AdjudicacionService } from '../../core/services/adjudicacion.service';
import { ImvSearchService } from '../../core/services/imv-search.service';

type ModalMode = 'alta' | 'edicion' | 'detalle';

@Component({
  selector: 'app-adjudicaciones',
  templateUrl: './adjudicaciones.component.html',
  styleUrls: ['../../shared/imv-table.css', '../../shared/imv-detail.css', './adjudicaciones.component.css']
})
export class AdjudicacionesComponent implements OnInit, OnDestroy {
  @Input() idAdjudicacionSeleccionada?: number;
  lista: Adjudicacion[] = [];
  catalogos: AdjudicacionCatalogos = { Propiedades: [], Planes: [], Personas: [], EstadosNotariales: [] };
  filtroBusqueda = '';
  filtroPlan = 0;
  filtroEstado = 'todas';
  cargando = false;
  guardando = false;
  cargandoDetalle = false;
  guardandoEstado = false;
  mostrarModal = false;
  mostrarCambioEstado = false;
  modo: ModalMode = 'alta';
  mensajeError = '';
  mensajeExito = '';
  seleccionada: Adjudicacion | null = null;
  adjudicacionEstado: Adjudicacion | null = null;
  estadoForm: CambioEstadoNotarialPayload = { IdEstado: 0 };
  private solicitudDetalle?: Subscription;
  readonly pageSize = 15;
  currentPage = 1;
  total = 0;
  formulario: AdjudicacionPayload = this.emptyForm();

  constructor(
    private service: AdjudicacionService,
    private searchService: ImvSearchService
  ) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe(term => {
      const nuevo = term || '';
      if (nuevo !== this.filtroBusqueda) {
        this.filtroBusqueda = nuevo;
        this.currentPage = 1;
        if (this.catalogos.Planes.length) this.cargarListado();
      }
    });
    this.cargarDatos();
  }

  ngOnDestroy(): void { this.cancelarDetalle(); }

  cargarDatos(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.service.getCatalogos().subscribe({
      next: catalogos => {
        this.catalogos = catalogos;
        if (this.idAdjudicacionSeleccionada) {
          this.filtroBusqueda = String(this.idAdjudicacionSeleccionada);
          this.filtroPlan = 0;
          this.filtroEstado = 'todas';
          this.currentPage = 1;
        }
        this.cargarListado();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar los datos necesarios para Adjudicaciones.';
      }
    });
  }

  cargarListado(page: number = this.currentPage): void {
    this.cargando = true;
    this.service.getAdjudicacionesPaginadas(page, this.pageSize, this.filtroBusqueda, Number(this.filtroPlan), this.filtroEstado).subscribe({
      next: data => {
        this.currentPage = data.Page;
        this.total = data.Total;
        this.lista = data.Items || [];
        this.cargando = false;
        this.abrirAdjudicacionContextual();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar las adjudicaciones desde IMV.Api.';
      }
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.currentPage = 1;
    this.searchService.setSearch(term);
    this.cargarListado();
  }

  onCriterioChange(): void { this.currentPage = 1; this.cargarListado(); }
  cambiarPagina(page: number): void { this.currentPage = page; this.cargarListado(page); }

  abrirAlta(): void {
    this.modo = 'alta';
    this.seleccionada = null;
    this.formulario = this.emptyForm();
    this.abrirModal();
  }

  abrirDetalle(item: Adjudicacion): void {
    this.cancelarDetalle();
    this.modo = 'detalle';
    this.seleccionada = item;
    this.cargandoDetalle = true;
    this.abrirModal();
    const id = item.IdAdjudicacion;
    this.solicitudDetalle = this.service.getDetalle(id).subscribe({
      next: detalle => {
        if (!this.cargandoDetalle || !this.seleccionada || this.seleccionada.IdAdjudicacion !== id) return;
        this.seleccionada = detalle;
        this.cargandoDetalle = false;
      },
      error: () => {
        if (!this.cargandoDetalle || !this.seleccionada || this.seleccionada.IdAdjudicacion !== id) return;
        this.cargandoDetalle = false;
        this.mensajeError = 'No se pudo cargar el detalle completo de la adjudicación.';
      }
    });
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
    this.cancelarDetalle();
    this.mostrarModal = false;
    this.guardando = false;
    this.cargandoDetalle = false;
    this.mensajeError = '';
  }

  abrirCambioEstado(item: Adjudicacion): void {
    this.adjudicacionEstado = item;
    this.estadoForm = { IdEstado: 0, Observaciones: '' };
    this.mensajeError = '';
    this.mensajeExito = '';
    this.mostrarCambioEstado = true;
  }

  abrirCambioEstadoDesdeDetalle(): void {
    const adjudicacion = this.seleccionada;
    if (!adjudicacion) return;
    this.cerrarModal();
    this.abrirCambioEstado(adjudicacion);
  }

  cerrarCambioEstado(): void {
    this.mostrarCambioEstado = false;
    this.guardandoEstado = false;
    this.adjudicacionEstado = null;
    this.estadoForm = { IdEstado: 0 };
    this.mensajeError = '';
  }

  guardarEstado(): void {
    if (!this.adjudicacionEstado || !this.estadoForm.IdEstado) {
      this.mensajeError = 'Seleccioná el nuevo estado notarial.';
      return;
    }
    const payload: CambioEstadoNotarialPayload = {
      IdEstado: Number(this.estadoForm.IdEstado),
      Observaciones: this.optional(this.estadoForm.Observaciones)
    };
    this.guardandoEstado = true;
    this.mensajeError = '';
    this.service.cambiarEstadoNotarial(this.adjudicacionEstado.IdAdjudicacion, payload).subscribe({
      next: () => {
        this.cerrarCambioEstado();
        this.mensajeExito = 'El estado notarial se actualizó y quedó registrado en el historial.';
        this.cargarListado();
      },
      error: error => {
        this.guardandoEstado = false;
        this.mensajeError = error.error && error.error.Message
          ? error.error.Message
          : 'No se pudo cambiar el estado notarial.';
      }
    });
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

  private abrirAdjudicacionContextual(): void {
    if (!this.idAdjudicacionSeleccionada) return;
    const adjudicacion = this.lista.find(item => item.IdAdjudicacion === this.idAdjudicacionSeleccionada);
    if (!adjudicacion) {
      this.mensajeError = 'No se encontró la adjudicación seleccionada.';
      return;
    }

    this.idAdjudicacionSeleccionada = undefined;
    this.abrirDetalle(adjudicacion);
  }

  private emptyForm(): AdjudicacionPayload {
    return { IdPropiedad: 0, IdPlan: 0, IdTitularPrincipal: 0, IdCotitulares: [], Activa: true };
  }

  private optional(value?: string): string | undefined {
    return value && value.trim() ? value.trim() : undefined;
  }

  private cancelarDetalle(): void {
    if (this.solicitudDetalle) {
      this.solicitudDetalle.unsubscribe();
      this.solicitudDetalle = undefined;
    }
  }
}
