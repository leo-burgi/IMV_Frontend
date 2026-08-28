import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ConsultaAdjudicacion,
  ConsultaAntecedenteLegacy,
  ConsultaDestino,
  ConsultaDestinoContextual,
  ConsultaIntegralDetalle
} from '../../core/models/consulta-integral.model';

@Component({
  selector: 'app-persona-ficha',
  templateUrl: './persona-ficha.component.html',
  styleUrls: [
    '../imv-table.css',
    '../../features/consulta-integral/consulta-integral.component.css',
    './persona-ficha.component.css'
  ]
})
export class PersonaFichaComponent {
  @Input() detalle!: ConsultaIntegralDetalle;
  @Output() solicitarNavegacion = new EventEmitter<ConsultaDestinoContextual>();

  condicion(adjudicacion: ConsultaAdjudicacion): string {
    const personaId = this.detalle && this.detalle.Persona && this.detalle.Persona.IdPersona;
    if (!personaId) return 'Sin dato';
    if (adjudicacion.TitularPrincipal && adjudicacion.TitularPrincipal.IdPersona === personaId) {
      return 'Titular principal';
    }
    return adjudicacion.Cotitulares.some(cotitular => cotitular.IdPersona === personaId)
      ? 'Cotitular'
      : 'Persona relacionada';
  }

  etiquetaEstado(estado?: string): string {
    if (estado === 'CONFLICTO') return 'Conflicto';
    if (estado === 'PENDIENTE_VERIFICACION') return 'Pendiente de validación';
    if (estado === 'MIGRADO') return 'Migrado';
    return estado || 'Sin estado';
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

  navegar(seccion: ConsultaDestino, id?: number): void {
    if (!id) return;
    this.solicitarNavegacion.emit({ seccion, id });
  }
}
