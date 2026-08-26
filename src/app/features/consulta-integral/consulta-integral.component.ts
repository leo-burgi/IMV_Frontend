import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ConsultaDestino,
  ConsultaIntegralEstado,
  ConsultaIntegralDetalle,
  ConsultaIntegralNavegacion,
  ConsultaIntegralResultado,
  ConsultaNivel,
  ConsultaTipo
} from '../../core/models/consulta-integral.model';
import { ConsultaIntegralService } from '../../core/services/consulta-integral.service';

@Component({
  selector: 'app-consulta-integral',
  templateUrl: './consulta-integral.component.html',
  styleUrls: ['../../shared/imv-table.css', './consulta-integral.component.css']
})
export class ConsultaIntegralComponent implements OnInit {
  @Input() estadoInicial?: ConsultaIntegralEstado;
  @Output() solicitarNavegacion = new EventEmitter<ConsultaIntegralNavegacion>();

  search = '';
  tipo: ConsultaTipo = 'TODOS';
  readonly pageSize = 15;
  currentPage = 1;
  total = 0;
  resultados: ConsultaIntegralResultado[] = [];
  cargando = false;
  busquedaRealizada = false;
  mensajeError = '';
  detalles: { [key: string]: ConsultaIntegralDetalle } = {};
  cargandoDetalle: { [key: string]: boolean } = {};
  expandido = '';

  constructor(private service: ConsultaIntegralService) { }

  ngOnInit(): void {
    if (!this.estadoInicial || !this.estadoInicial.search) return;
    this.search = this.estadoInicial.search;
    this.tipo = this.estadoInicial.tipo;
    this.buscar(this.estadoInicial.page);
  }

  buscar(page: number = 1): void {
    const term = this.search.trim();
    this.currentPage = page;
    this.mensajeError = '';
    this.expandido = '';
    if (!term) {
      this.resultados = [];
      this.total = 0;
      this.busquedaRealizada = false;
      return;
    }

    this.cargando = true;
    this.busquedaRealizada = true;
    this.service.search(term, this.tipo, page, this.pageSize).subscribe({
      next: data => {
        this.resultados = data.Items || [];
        this.total = data.Total;
        this.currentPage = data.Page;
        this.cargando = false;
      },
      error: () => {
        this.resultados = [];
        this.total = 0;
        this.cargando = false;
        this.mensajeError = 'No se pudo realizar la consulta integral.';
      }
    });
  }

  cambiarTipo(): void {
    if (this.busquedaRealizada) this.buscar(1);
  }

  cambiarPagina(page: number): void { this.buscar(page); }

  toggleDetalle(item: ConsultaIntegralResultado): void {
    const key = this.key(item);
    if (this.expandido === key) {
      this.expandido = '';
      return;
    }

    this.expandido = key;
    if (this.detalles[key] || this.cargandoDetalle[key]) return;
    this.cargandoDetalle[key] = true;

    const request = item.TipoResultado === 'PERSONA'
      ? this.service.getPersona(item.IdPersona as number)
      : item.TipoResultado === 'PROPIEDAD'
        ? this.service.getPropiedad(item.IdPropiedad as number)
        : this.service.getLegacy(item.IdRegistroLegacy as number);

    request.subscribe({
      next: detail => {
        this.detalles[key] = detail;
        this.cargandoDetalle[key] = false;
      },
      error: () => {
        this.cargandoDetalle[key] = false;
        this.mensajeError = 'No se pudo cargar el detalle de la consulta.';
      }
    });
  }

  detalleDe(item: ConsultaIntegralResultado): ConsultaIntegralDetalle | undefined {
    return this.detalles[this.key(item)];
  }

  estaCargandoDetalle(item: ConsultaIntegralResultado): boolean {
    return !!this.cargandoDetalle[this.key(item)];
  }

  estaExpandido(item: ConsultaIntegralResultado): boolean {
    return this.expandido === this.key(item);
  }

  etiqueta(nivel: ConsultaNivel): string {
    if (nivel === 'DEFINITIVO') return 'Confirmado';
    if (nivel === 'COINCIDENCIA_CANDIDATA') return 'Coincidencia candidata';
    return 'Antecedente legacy no validado';
  }

  claseNivel(nivel: ConsultaNivel): string {
    if (nivel === 'DEFINITIVO') return 'consulta-badge--confirmado';
    if (nivel === 'COINCIDENCIA_CANDIDATA') return 'consulta-badge--candidato';
    return 'consulta-badge--legacy';
  }

  etiquetaEstado(estado?: string): string {
    if (estado === 'CONFLICTO') return 'Conflicto';
    if (estado === 'PENDIENTE_VERIFICACION') return 'Pendiente de validación';
    if (estado === 'MIGRADO') return 'Migrado';
    return estado || 'Sin estado';
  }

  navegar(seccion: ConsultaDestino, id?: number): void {
    if (!id) return;
    this.solicitarNavegacion.emit({
      seccion,
      id,
      estado: { search: this.search, tipo: this.tipo, page: this.currentPage }
    });
  }

  trackResultado(_index: number, item: ConsultaIntegralResultado): string {
    return `${item.TipoResultado}-${item.IdPersona || item.IdPropiedad || item.IdRegistroLegacy}`;
  }

  private key(item: ConsultaIntegralResultado): string {
    return `${item.TipoResultado}-${item.IdPersona || item.IdPropiedad || item.IdRegistroLegacy}`;
  }
}
