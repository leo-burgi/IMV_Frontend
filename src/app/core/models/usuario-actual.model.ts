export interface UsuarioActual {
  Autenticado: boolean;
  IdUsuarioAplicacion: number;
  NombreMostrar: string;
  CuentaWindows?: string;
  Dominio?: string;
  UsuarioLocal?: string;
  MetodoIngreso: 'Windows' | 'Local';
  Iniciales: string;
}
