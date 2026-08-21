export interface AdjudicacionPersona {
  IdPersona: number;
  DNI?: string;
  NombreCompleto: string;
}

export interface Adjudicacion {
  IdAdjudicacion: number;
  IdPropiedad: number;
  Propiedad: string;
  Catastro?: string;
  IdPlan: number;
  Plan: string;
  Programa?: string;
  IdTitularPrincipal: number;
  TitularPrincipal: string;
  DniTitularPrincipal?: string;
  Cotitulares: AdjudicacionPersona[];
  NroLegajoFisico?: string;
  FechaAdjudicacion?: string;
  Activa: boolean;
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
  Nombre: string;
  Programa?: string;
}

export interface PersonaOpcion {
  IdPersona: number;
  DNI?: string;
  NombreCompleto: string;
}

export interface AdjudicacionCatalogos {
  Propiedades: PropiedadOpcion[];
  Planes: PlanOpcion[];
  Personas: PersonaOpcion[];
}
