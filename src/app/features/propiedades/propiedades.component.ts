import { Component, OnInit } from '@angular/core';
import { Propiedad } from '../../core/models/propiedad.model';
import { ImvSearchService } from '../../core/services/imv-search.service';
import { PropiedadService } from '../../core/services/propiedad.service';

@Component({
  selector: 'app-propiedades',
  templateUrl: './propiedades.component.html',
  styleUrls: ['../../shared/imv-table.css', './propiedades.component.css']
})
export class PropiedadesComponent implements OnInit {
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

  constructor(
    private propiedadService: PropiedadService,
    private searchService: ImvSearchService
  ) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe(term => this.filtroBusqueda = term || '');
    this.cargarPropiedades();
  }

  get barrios(): string[] {
    return Array.from(new Set(this.lista.map(x => x.Barrio).filter(Boolean))).sort();
  }

  get filtradas(): Propiedad[] {
    const termino = (this.filtroBusqueda || '').trim().toLowerCase();
    return this.lista.filter(item => {
      const activa = !item.FechaBaja;
      const coincideEstado = this.filtroEstado === 'todas'
        || (this.filtroEstado === 'activas' && activa)
        || (this.filtroEstado === 'bajas' && !activa);
      const conCatastro = !!(item.NroCatastro && item.NroCatastro.trim());
      const coincideCatastro = this.filtroCatastro === 'todas'
        || (this.filtroCatastro === 'con' && conCatastro)
        || (this.filtroCatastro === 'sin' && !conCatastro);
      const coincideBarrio = !this.filtroBarrio || item.Barrio === this.filtroBarrio;
      const texto = [item.IdPropiedad, item.Calle, item.Altura, item.Barrio,
        item.NroCatastro, item.Manzana, item.Lote].join(' ').toLowerCase();
      return coincideEstado && coincideCatastro && coincideBarrio
        && (!termino || texto.includes(termino));
    });
  }

  cargarPropiedades(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.propiedadService.getPropiedades().subscribe({
      next: data => {
        this.lista = data || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar las propiedades desde IMV.Api.';
      }
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.searchService.setSearch(term);
  }

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
}
