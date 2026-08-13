import { Component, OnInit } from '@angular/core';
import { Barrio } from 'src/app/core/models/barrio.model';
import { BarrioService } from 'src/app/core/services/barrio.service';
import { ImvSearchService } from 'src/app/core/services/imv-search.service';

@Component({
  selector: 'app-barrios',
  templateUrl: './barrios.component.html',
  styleUrls: ['../../shared/imv-table.css']
})
export class BarriosComponent implements OnInit {
  listaBarrios: Barrio[] = [];
  filtroBusqueda = '';
  mostrarModalAlta = false;
  modoEdicion = false;
  guardando = false;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  barrioForm: Partial<Barrio> = { Nombre: '' };

  constructor(private barrioService: BarrioService, private searchService: ImvSearchService) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe((term) => {
      this.filtroBusqueda = term || '';
    });
    this.cargarBarrios();
  }

  cargarBarrios(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.barrioService.getBarrios().subscribe({
      next: (data) => {
        this.listaBarrios = data || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar los barrios desde IMV.Api.';
      }
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.searchService.setSearch(term);
  }

  abrirModalAlta(barrio?: Barrio): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.modoEdicion = !!barrio;
    this.barrioForm = barrio ? { ...barrio } : { Nombre: '' };
    this.mostrarModalAlta = true;
  }

  cerrarModalAlta(): void {
    this.mostrarModalAlta = false;
    this.guardando = false;
    this.mensajeError = '';
    this.modoEdicion = false;
    this.barrioForm = { Nombre: '' };
  }

  guardarBarrio(): void {
    const nombre = this.barrioForm.Nombre?.trim();
    if (!nombre) {
      this.mensajeError = 'El nombre del barrio es obligatorio.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    const datosBarrio: Barrio = { Nombre: nombre };
    const request = this.modoEdicion && this.barrioForm.IdBarrio
      ? this.barrioService.updateBarrio({
          ...datosBarrio,
          IdBarrio: this.barrioForm.IdBarrio
        })
      : this.barrioService.createBarrio(datosBarrio);

    request.subscribe({
      next: () => {
        this.cargarBarrios();
        this.mostrarModalAlta = false;
        this.guardando = false;
        this.mensajeExito = this.modoEdicion ? 'El barrio se actualizó correctamente.' : 'El barrio se cargó correctamente.';
        this.modoEdicion = false;
        this.barrioForm = { Nombre: '' };
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = 'No se pudo guardar el barrio. Verificá la conexión con IMV.Api.';
      }
    });
  }

  verDetalle(barrio: Barrio): void {
    alert('Vas a ver el detalle del barrio: ' + barrio.Nombre);
  }

  editarBarrio(barrio: Barrio): void {
    this.abrirModalAlta(barrio);
  }
}
