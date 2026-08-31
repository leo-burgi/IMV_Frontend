import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuditoriaCambio } from '../../core/models/auditoria.model';
import {
  ConsultaAntecedenteLegacy,
  ConsultaDestino,
  ConsultaDestinoContextual,
  ConsultaIntegralDetalle
} from '../../core/models/consulta-integral.model';
import { AuditoriaService } from '../../core/services/auditoria.service';

@Component({
  selector: 'app-propiedad-ficha',
  templateUrl: './propiedad-ficha.component.html',
  styleUrls: [
    '../imv-table.css',
    '../../features/consulta-integral/consulta-integral.component.css',
    './propiedad-ficha.component.css'
  ]
})
export class PropiedadFichaComponent {
  @Input() detalle!: ConsultaIntegralDetalle;
  @Output() solicitarNavegacion = new EventEmitter<ConsultaDestinoContextual>();
  historial: AuditoriaCambio[] = [];
  historialVisible = false;
  cargandoHistorial = false;
  historialError = '';

  constructor(private auditoriaService: AuditoriaService) { }

  verHistorial(): void {
    if (this.historialVisible) {
      this.historialVisible = false;
      return;
    }
    if (this.historial.length) {
      this.historialVisible = true;
      return;
    }
    const propiedad = this.detalle && this.detalle.Propiedad;
    if (!propiedad) return;
    this.cargandoHistorial = true;
    this.historialError = '';
    this.auditoriaService.getHistorial('Propiedades', propiedad.IdPropiedad).subscribe({
      next: historial => {
        this.historial = historial || [];
        this.historialVisible = true;
        this.cargandoHistorial = false;
      },
      error: () => {
        this.historialError = 'No se pudo cargar el historial de la propiedad.';
        this.cargandoHistorial = false;
      }
    });
  }

  etiquetaAntecedente(antecedente: ConsultaAntecedenteLegacy): string {
    return antecedente.CategoriaInformacion === 'COINCIDENCIA_CANDIDATA'
      ? 'Coincidencia candidata'
      : 'Antecedente histórico';
  }

  claseAntecedente(antecedente: ConsultaAntecedenteLegacy): string {
    return antecedente.CategoriaInformacion === 'COINCIDENCIA_CANDIDATA'
      ? 'consulta-badge--candidato'
      : 'consulta-badge--legacy';
  }

  etiquetaEstado(estado?: string): string {
    if (estado === 'CONFLICTO') return 'Conflicto';
    if (estado === 'PENDIENTE_VERIFICACION') return 'Pendiente de validación';
    if (estado === 'MIGRADO') return 'Migrado';
    return estado || 'Sin estado';
  }

  navegar(seccion: ConsultaDestino, id?: number): void {
    if (!id) return;
    this.solicitarNavegacion.emit({ seccion, id });
  }
}
