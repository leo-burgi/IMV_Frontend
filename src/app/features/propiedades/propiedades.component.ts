import { Component, Input, OnInit } from '@angular/core';
import { Propiedad } from '../../core/models/propiedad.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PropiedadService } from '../../core/services/propiedad.service';
import { BarrioService } from '../../core/services/barrio.service';

@Component({
  selector: 'app-propiedades',
  templateUrl: './propiedades.component.html',
  styleUrls: ['../../shared/imv-table.css', './propiedades.component.css']
})
export class PropiedadesComponent implements OnInit {
  @Input() idPropiedadSeleccionada?: number;
  lista: Propiedad[] = [];
  filtroBusqueda = '';
  filtroBarrio = '';
  filtroEstado = 'todas';
  filtroCatastro = 'todas';
  cargando = false;
  cargandoDetalle = false;
  mensajeError = '';
  detalleError = '';
  seleccionada: Propiedad | null = null;
  barrios: string[] = [];
  readonly pageSize = 15;
  currentPage = 1;
  total = 0;

  constructor(
    private propiedadService: PropiedadService,
    private searchService: ImvSearchService,
    private barrioService: BarrioService
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
    this.barrioService.getBarrios().subscribe(data => this.barrios = (data || []).map(x => x.Nombre).filter(Boolean).sort());
    this.cargarPropiedades();
  }

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
    this.seleccionada = null;
    this.detalleError = '';
    this.cargandoDetalle = true;
    this.propiedadService.getPropiedad(item.IdPropiedad).subscribe({
      next: detalle => {
        this.seleccionada = detalle;
        this.cargandoDetalle = false;
      },
      error: () => {
        this.detalleError = 'No se pudo cargar el detalle de la propiedad.';
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarDetalle(): void {
    this.seleccionada = null;
    this.cargandoDetalle = false;
    this.detalleError = '';
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
}
