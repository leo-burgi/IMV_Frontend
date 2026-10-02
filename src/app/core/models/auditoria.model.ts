export interface AuditoriaCambio {
  IdAuditoria: number;
  Entidad: string;
  IdEntidad: number;
  Operacion: string;
  Campo: string;
  ValorAnterior?: string;
  ValorNuevo?: string;
  Usuario: string;
  IdUsuarioAplicacion?: number;
  FechaHora: string;
}
