export interface Propiedad {
  IdPropiedad: number;
  IdBarrio: number;
  Barrio: string;
  IdCalle: number;
  Calle: string;
  Altura?: string;
  Manzana?: string;
  Lote?: string;
  NroCatastro?: string;
  ObservacionesPropiedad?: string;
  UsuarioAlta?: string;
  FechaAlta?: string;
  HoraAlta?: string;
  UsuarioModif?: string;
  FechaModif?: string;
  HoraModif?: string;
  UsuarioBaja?: string;
  FechaBaja?: string;
  HoraBaja?: string;
}
