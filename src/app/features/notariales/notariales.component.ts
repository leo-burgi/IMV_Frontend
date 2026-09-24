import { Component, OnInit } from '@angular/core';
import { Adjudicacion, CambioEstadoNotarialPayload, EstadoNotarialOpcion } from '../../core/models/adjudicacion.model';
import { NotarialService } from '../../core/services/notarial.service';

@Component({ selector: 'app-notariales', templateUrl: './notariales.component.html', styleUrls: ['../../shared/imv-table.css', '../../shared/imv-detail.css', './notariales.component.css'] })
export class NotarialesComponent implements OnInit {
  lista: Adjudicacion[] = []; estados: EstadoNotarialOpcion[] = [];
  filtroBusqueda = ''; filtroEstado: number | null = null;
  readonly pageSize = 15; currentPage = 1; total = 0;
  cargando = false; guardando = false; mensajeError = ''; mensajeExito = '';
  seleccionada: Adjudicacion | null = null; mostrarDetalle = false; mostrarEstado = false;
  estadoForm: CambioEstadoNotarialPayload = { IdEstado: 0, FechaCambio: '' };
  constructor(private service: NotarialService) { }
  ngOnInit(): void { this.service.getCatalogos().subscribe({ next: e => { this.estados = e; this.cargarListado(); }, error: () => this.mensajeError = 'No se pudo cargar el catálogo de estados notariales.' }); }
  cargarListado(page: number = this.currentPage): void {
    this.cargando = true; this.mensajeError = '';
    this.service.getPaged(page, this.pageSize, this.filtroBusqueda, this.filtroEstado).subscribe({ next: d => { this.lista = d.Items || []; this.total = d.Total; this.currentPage = d.Page; this.cargando = false; }, error: () => { this.cargando = false; this.mensajeError = 'No se pudo cargar la gestión notarial.'; } });
  }
  onFiltroChange(): void { this.currentPage = 1; this.cargarListado(); }
  cambiarPagina(page: number): void { this.currentPage = page; this.cargarListado(page); }
  abrirDetalle(item: Adjudicacion): void { this.mostrarDetalle = true; this.seleccionada = item; this.service.getDetalle(item.IdAdjudicacion).subscribe({ next: d => this.seleccionada = d, error: () => this.mensajeError = 'No se pudo cargar el historial notarial.' }); }
  cerrarDetalle(): void { this.mostrarDetalle = false; this.seleccionada = null; }
  abrirEstadoDesdeDetalle(): void { const item = this.seleccionada; if (!item) return; this.mostrarDetalle = false; this.abrirEstado(item); }
  abrirEstado(item: Adjudicacion): void { this.seleccionada = item; this.estadoForm = { IdEstado: 0, FechaCambio: this.hoy(), Observaciones: '' }; this.mensajeError = ''; this.mostrarEstado = true; }
  cerrarEstado(): void { this.mostrarEstado = false; this.guardando = false; this.seleccionada = null; }
  guardarEstado(): void {
    if (!this.seleccionada || !this.estadoForm.IdEstado || !this.estadoForm.FechaCambio) { this.mensajeError = 'Estado y fecha son obligatorios.'; return; }
    const payload = { IdEstado: Number(this.estadoForm.IdEstado), FechaCambio: this.estadoForm.FechaCambio, Observaciones: this.estadoForm.Observaciones && this.estadoForm.Observaciones.trim() || undefined };
    this.guardando = true;
    this.service.addEstado(this.seleccionada.IdAdjudicacion, payload).subscribe({ next: () => { this.cerrarEstado(); this.mensajeExito = 'El movimiento notarial se registró correctamente.'; this.cargarListado(); }, error: e => { this.guardando = false; this.mensajeError = e.error && e.error.Message ? e.error.Message : 'No se pudo registrar el movimiento notarial.'; } });
  }
  private hoy(): string { const f = new Date(); return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`; }
}
