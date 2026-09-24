import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Barrio } from '../../core/models/barrio.model';
import { Calle } from '../../core/models/calle.model';
import { ConsultaDestinoContextual, ConsultaIntegralDetalle } from '../../core/models/consulta-integral.model';
import { Propiedad, PropiedadUpdate } from '../../core/models/propiedad.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PropiedadService } from '../../core/services/propiedad.service';
import { BarrioService } from '../../core/services/barrio.service';
import { CalleService } from '../../core/services/calle.service';
import { ConsultaIntegralService } from '../../core/services/consulta-integral.service';

@Component({
  selector: 'app-propiedades',
  templateUrl: './propiedades.component.html',
  styleUrls: ['../../shared/imv-table.css', '../../shared/imv-detail.css', './propiedades.component.css']
})
export class PropiedadesComponent implements OnInit, OnDestroy {
  @Input() idPropiedadSeleccionada?: number;
  @Output() solicitarNavegacion = new EventEmitter<ConsultaDestinoContextual>();
  lista: Propiedad[] = [];
  filtroBusqueda = '';
  filtroBarrio = '';
  filtroEstado = 'todas';
  filtroCatastro = 'todas';
  cargando = false;
  cargandoDetalle = false;
  mensajeError = '';
  mensajeExito = '';
  detalleError = '';
  detalle?: ConsultaIntegralDetalle;
  barrios: Barrio[] = [];
  calles: Calle[] = [];
  mostrarEdicion = false;
  guardando = false;
  propiedadForm?: PropiedadUpdate;
  private solicitudDetalle?: Subscription;
  readonly pageSize = 15;
  currentPage = 1;
  total = 0;

  constructor(
    private propiedadService: PropiedadService,
    private consultaIntegralService: ConsultaIntegralService,
    private searchService: ImvSearchService,
    private barrioService: BarrioService,
    private calleService: CalleService
  ) { }

  ngOnInit(): void {
    if (this.idPropiedadSeleccionada) {
      this.filtroBusqueda = String(this.idPropiedadSeleccionada);
      this.filtroBarrio = '';
      this.filtroEstado = 'todas';
      this.filtroCatastro = 'todas';
      this.currentPage = 1;
    }
    this.searchService.searchTerm$.subscribe(term => {
      if (this.idPropiedadSeleccionada) return;
      const nuevo = term || '';
      if (nuevo !== this.filtroBusqueda) {
        this.filtroBusqueda = nuevo;
        this.currentPage = 1;
        this.cargarPropiedades();
      }
    });
    this.barrioService.getBarrios().subscribe(data => this.barrios = (data || []).sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
    this.calleService.getCalles().subscribe(data => this.calles = (data || []).sort((a, b) => a.Nombre.localeCompare(b.Nombre)));
    this.cargarPropiedades();
  }

  ngOnDestroy(): void { this.cancelarDetalle(); }

  cargarPropiedades(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.propiedadService.getPropiedadesPaginadas(this.currentPage, this.pageSize, this.filtroBusqueda, this.filtroBarrio, this.filtroEstado, this.filtroCatastro).subscribe({
      next: data => {
        this.lista = data.Items || [];
        this.total = data.Total;
        this.currentPage = data.Page;
        this.cargando = false;
        this.abrirPropiedadContextual();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar las propiedades desde IMV.Api.';
      }
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.currentPage = 1;
    this.searchService.setSearch(term);
    this.cargarPropiedades();
  }

  onCriterioChange(): void { this.currentPage = 1; this.cargarPropiedades(); }
  cambiarPagina(page: number): void { this.currentPage = page; this.cargarPropiedades(); }

  verDetalle(item: Propiedad): void {
    this.cancelarDetalle();
    const id = item.IdPropiedad;
    this.detalle = undefined;
    this.detalleError = '';
    this.cargandoDetalle = true;
    this.solicitudDetalle = this.consultaIntegralService.getPropiedad(id).subscribe({
      next: detalle => {
        if (!this.cargandoDetalle) return;
        this.detalle = detalle;
        this.cargandoDetalle = false;
      },
      error: () => {
        if (!this.cargandoDetalle) return;
        this.detalleError = 'No se pudo cargar el detalle de la propiedad.';
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarDetalle(): void {
    this.cancelarDetalle();
    this.detalle = undefined;
    this.cargandoDetalle = false;
    this.detalleError = '';
  }

  editarPropiedad(item: Propiedad): void {
    if (item.FechaBaja) return;
    this.abrirEdicion({
      IdPropiedad: item.IdPropiedad, IdBarrio: item.IdBarrio, IdCalle: item.IdCalle,
      Altura: item.Altura, Manzana: item.Manzana, Lote: item.Lote,
      NroCatastro: item.NroCatastro, ObservacionesPropiedad: item.ObservacionesPropiedad
    });
  }

  editarDesdeFicha(): void {
    const propiedad = this.detalle && this.detalle.Propiedad;
    if (!propiedad || propiedad.FechaBaja || !propiedad.IdBarrio || !propiedad.IdCalle) return;
    this.cerrarDetalle();
    this.abrirEdicion({
      IdPropiedad: propiedad.IdPropiedad, IdBarrio: propiedad.IdBarrio, IdCalle: propiedad.IdCalle,
      Altura: propiedad.Altura, Manzana: propiedad.Manzana, Lote: propiedad.Lote,
      NroCatastro: propiedad.Catastro, ObservacionesPropiedad: propiedad.Observaciones
    });
  }

  cerrarEdicion(): void {
    this.mostrarEdicion = false;
    this.guardando = false;
    this.propiedadForm = undefined;
  }

  guardarPropiedad(): void {
    if (!this.propiedadForm || !this.propiedadForm.IdBarrio || !this.propiedadForm.IdCalle) {
      this.mensajeError = 'Barrio y calle son obligatorios.';
      return;
    }
    const payload: PropiedadUpdate = {
      ...this.propiedadForm,
      Altura: this.optional(this.propiedadForm.Altura),
      Manzana: this.optional(this.propiedadForm.Manzana),
      Lote: this.optional(this.propiedadForm.Lote),
      NroCatastro: this.optional(this.propiedadForm.NroCatastro),
      ObservacionesPropiedad: this.optional(this.propiedadForm.ObservacionesPropiedad)
    };
    this.guardando = true;
    this.mensajeError = '';
    this.propiedadService.updatePropiedad(payload).subscribe({
      next: propiedad => {
        this.cerrarEdicion();
        this.mensajeExito = 'La propiedad se actualizó correctamente.';
        this.cargarPropiedades();
        this.verDetalle(propiedad);
      },
      error: error => {
        this.guardando = false;
        this.mensajeError = error.error && error.error.Message
          ? error.error.Message
          : 'No se pudo actualizar la propiedad.';
      }
    });
  }

  navegarDesdeFicha(destino: ConsultaDestinoContextual): void {
    this.cerrarDetalle();
    this.solicitarNavegacion.emit(destino);
  }

  private abrirPropiedadContextual(): void {
    if (!this.idPropiedadSeleccionada) return;
    const propiedad = this.lista.find(item => item.IdPropiedad === this.idPropiedadSeleccionada);
    if (!propiedad) {
      this.mensajeError = 'No se encontró la propiedad seleccionada.';
      return;
    }

    this.idPropiedadSeleccionada = undefined;
    this.verDetalle(propiedad);
  }

  private abrirEdicion(propiedad: PropiedadUpdate): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.propiedadForm = { ...propiedad };
    this.mostrarEdicion = true;
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
