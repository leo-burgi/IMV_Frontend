export interface CalidadDatosAdjudicaciones {
  TotalLegacy: number;
  TotalMigradas: number;
  PorcentajeMigrado: number;
  SinCatastro: number;
  PorcentajeSinCatastro: number;
  PropiedadPendiente: number;
  PorcentajePropiedadPendiente: number;
  PlanPendiente: number;
  PorcentajePlanPendiente: number;
  TitularPendiente: number;
  PorcentajeTitularPendiente: number;
  CotitularPendiente: number;
  PorcentajeCotitularPendiente: number;
  Conflictos: number;
  PorcentajeConflictos: number;
  ConflictosHistoricos: number;
  PorcentajeConflictosHistoricos: number;
  NivelDeuda: 'ALTA' | 'MODERADA' | 'BAJA' | 'COMPLETA';
  MigracionCompleta: boolean;
}
