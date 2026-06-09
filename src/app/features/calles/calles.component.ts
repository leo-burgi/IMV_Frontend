import { Component, OnInit } from '@angular/core';
import { CalleService } from 'src/app/core/services/calle.service';
import { Calle } from 'src/app/core/models/calle.model';
import { ImvSearchService } from 'src/app/core/services/imv-search.service';

@Component({
  selector: 'app-calles',
  templateUrl: './calles.component.html',
  styleUrls: ['../../shared/imv-table.css']
})
export class CallesComponent implements OnInit {
  listarCalles: Calle[] = [];
  filtroBusqueda: string = '';
  mostrarModalAlta = false;
  modoEdicion = false;
  guardando = false;
  mensajeError = '';
  mensajeExito = '';
  calleForm: Partial<Calle> = { NombreCalle: '', NombreReducido: '' };

  constructor(private calleService: CalleService, private searchService: ImvSearchService) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe((term) => {
      this.filtroBusqueda = term || '';
    });
    this.cargarCalles();
  }

  cargarCalles(): void {
    this.calleService.getCalles().subscribe({
      next: (data) => this.listarCalles = data || [],
      error: () => this.mensajeError = 'No se pudieron cargar las calles desde IMV.Api.'
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.searchService.setSearch(term);
  }

  abrirModalAlta(calle?: Calle): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.modoEdicion = !!calle;
    this.calleForm = calle ? { ...calle } : { NombreCalle: '', NombreReducido: '' };
    this.mostrarModalAlta = true;
  }

  cerrarModalAlta(): void {
    this.mostrarModalAlta = false;
    this.guardando = false;
    this.mensajeError = '';
    this.modoEdicion = false;
    this.calleForm = { NombreCalle: '', NombreReducido: '' };
  }

  guardarCalle(): void {
    const nombre = this.calleForm.NombreCalle?.trim();
    if (!nombre) {
      this.mensajeError = 'El nombre de la calle es obligatorio.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    const payload: Partial<Calle> = {
      NombreCalle: nombre,
      NombreReducido: this.calleForm.NombreReducido?.trim() || ''
    };

    const request = this.modoEdicion && this.calleForm.IdCalle
      ? this.calleService.updateCalle(this.calleForm as Calle)
      : this.calleService.createCalle(payload);

    request.subscribe({
      next: () => {
        this.cargarCalles();
        this.mostrarModalAlta = false;
        this.guardando = false;
        this.mensajeExito = this.modoEdicion ? 'La calle se actualizó correctamente.' : 'La calle se cargó correctamente.';
        this.modoEdicion = false;
        this.calleForm = { NombreCalle: '', NombreReducido: '' };
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = 'No se pudo guardar la calle. Verificá la conexión con IMV.Api.';
      }
    });
  }

  verDetalle(calle: Calle): void {
    alert('Vas a ver el detalle de la calle: ' + calle.NombreCalle);
  }

  editarCalle(calle: Calle): void {
    this.abrirModalAlta(calle);
  }
}
