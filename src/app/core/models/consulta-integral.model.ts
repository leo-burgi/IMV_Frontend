import { PagedResult } from './pagination.model';

export type ConsultaTipo = 'TODOS' | 'PERSONA' | 'INMUEBLE' | 'EXPEDIENTE';
export type ConsultaResultadoTipo = 'PERSONA' | 'PROPIEDAD' | 'LEGACY';
export type ConsultaNivel = 'DEFINITIVO' | 'ANTECEDENTE_LEGACY_NO_VALIDADO' | 'COINCIDENCIA_CANDIDATA';

export interface ConsultaIntegralResultado {
  TipoResultado: ConsultaResultadoTipo;
  NivelConfianza: ConsultaNivel;
  IdPersona?: number;
  IdPropiedad?: number;
  IdRegistroLegacy?: number;
  Titulo: string;
  Subtitulo?: string;
  DNI?: string;
  Catastro?: string;
  Domicilio?: string;
  Estado?: string;
  CodigoMotivo?: string;
  DetalleMotivo?: string;
  HojaOrigen?: string;
  FilaOrigen?: number;
  TieneInformacionDefinitiva: boolean;
}

export type ConsultaIntegralPagina = PagedResult<ConsultaIntegralResultado>;

export interface ConsultaPersona {
  IdPersona: number;
  DNI?: string;
  CuilCuit?: string;
  Apellido: string;
  Nombre: string;
  Telefono?: string;
  Email?: string;
}

export interface ConsultaPropiedad {
  IdPropiedad: number;
  Catastro?: string;
  Calle?: string;
  Altura?: string;
  Barrio?: string;
  Manzana?: string;
  Lote?: string;
  Observaciones?: string;
}

export interface ConsultaPlan {
  IdPlan: number;
  Nombre?: string;
  Origen?: string;
}

export interface ConsultaTitular {
  IdPersona: number;
  DNI?: string;
  NombreCompleto: string;
  EsTitularPrincipal: boolean;
}

export interface ConsultaEstadoNotarial {
  IdEstado: number;
  Descripcion: string;
  FechaCambio: string;
  Observaciones?: string;
}

export interface ConsultaAdjudicacion {
  IdAdjudicacion: number;
  NumeroExpediente?: string;
  FechaAdjudicacion?: string;
  Activa: boolean;
  Propiedad: ConsultaPropiedad;
  Plan: ConsultaPlan;
  TitularPrincipal?: ConsultaTitular;
  Cotitulares: ConsultaTitular[];
  EstadoNotarialActual?: ConsultaEstadoNotarial;
}

export interface ConsultaAntecedenteLegacy {
  IdRegistro: number;
  IdLote: number;
  HojaOrigen: string;
  FilaOrigen: number;
  CategoriaInformacion: ConsultaNivel;
  EstadoValidacion: string;
  CodigoMotivo?: string;
  DetalleMotivo?: string;
  ClasificacionCatastro?: string;
  EstadoVerificacionInmueble?: string;
  ClasificacionIdentidadTitular?: string;
  ClasificacionIdentidadCotitular?: string;
  ClasificacionAntecedente?: string;
  IdAdjudicacionMigrada?: number;
  IdPropiedadCandidata?: number;
  IdPlanCandidato?: number;
  IdPersonaTitularCandidata?: number;
  IdPersonaCotitularCandidata?: number;
  RawPlan?: string;
  RawPrograma?: string;
  RawTitular?: string;
  RawDNI?: string;
  RawCotitular?: string;
  RawDNICotitular?: string;
  RawCatastro?: string;
  RawDomicilio?: string;
  RawDomicilioInmueble?: string;
  RawDomicilioParticular?: string;
  RawAltura?: string;
  RawBarrio?: string;
  RawManzana?: string;
  RawLote?: string;
  RawFechaAdjudicacion?: string;
  RawObservaciones?: string;
  MotivosValidacion?: string;
}

export interface ConsultaCoincidencia {
  NivelConfianza: 'COINCIDENCIA_CANDIDATA';
  PersonaTitular?: ConsultaPersona;
  PersonaCotitular?: ConsultaPersona;
  Propiedad?: ConsultaPropiedad;
  Plan?: ConsultaPlan;
}

export interface ConsultaIntegralDetalle {
  TipoResultado: ConsultaResultadoTipo;
  NivelConfianza: ConsultaNivel;
  Persona?: ConsultaPersona;
  Propiedad?: ConsultaPropiedad;
  Adjudicaciones: ConsultaAdjudicacion[];
  AntecedentesLegacy: ConsultaAntecedenteLegacy[];
  CoincidenciaCandidata?: ConsultaCoincidencia;
  Faltantes: string[];
  Advertencias: string[];
}
