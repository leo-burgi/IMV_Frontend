export interface AdjudicacionPersona {
  IdPersona: number;
  DNI?: string;
  NombreCompleto: string;
}

export interface EstadoNotarial {
  IdEstado: number;
  Descripcion: string;
  FechaCambio: string;
  Observaciones?: string;
  Usuario?: string;
}

export interface HistorialEstado extends EstadoNotarial {
  IdHistorial: number;
  IdAdjudicacion: number;
}

export interface Adjudicacion {
  IdAdjudicacion: number;
  IdPropiedad: number;
  Propiedad: string;
  Catastro?: string;
  IdPlan: number;
  NombrePlan: string | null;
  OrigenPlan: string;
  IdTitularPrincipal: number;
  TitularPrincipal: string;
  DniTitularPrincipal?: string;
  Cotitulares: AdjudicacionPersona[];
  NroLegajoFisico?: string;
  FechaAdjudicacion?: string;
  Activa: boolean;
  EstadoNotarialActual?: EstadoNotarial;
  HistorialEstados?: HistorialEstado[];
}

export interface AdjudicacionPayload {
  IdAdjudicacion?: number;
  IdPropiedad: number;
  IdPlan: number;
  IdTitularPrincipal: number;
  IdCotitulares: number[];
  NroLegajoFisico?: string;
  FechaAdjudicacion?: string;
  Activa: boolean;
}

export interface PropiedadOpcion {
  IdPropiedad: number;
  Descripcion: string;
  Catastro?: string;
}

export interface PlanOpcion {
  IdPlan: number;
  NombrePlan: string | null;
  OrigenPlan: string;
}

export interface PersonaOpcion {
  IdPersona: number;
  DNI?: string;
  NombreCompleto: string;
}

export interface EstadoNotarialOpcion {
  IdEstado: number;
  Descripcion: string;
}

export interface AdjudicacionCatalogos {
  Propiedades: PropiedadOpcion[];
  Planes: PlanOpcion[];
  Personas: PersonaOpcion[];
  EstadosNotariales: EstadoNotarialOpcion[];
}

export interface CambioEstadoNotarialPayload {
  IdEstado: number;
  Observaciones?: string;
}
