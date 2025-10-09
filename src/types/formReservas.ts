export interface AddReservaInput {
  departamento: number;
  nombre_completo: string;
  telefono: string;
  numero_reserva: string;
  app_reserva: string;
  cantidad_huespedes: number;
  fecha_estadia: { from: Date; to: Date };
  check_in: boolean;
  check_out: boolean;
  valor_reserva: number;
  valor_comision_app?: number;
  extra_check?: boolean;
  media_estadia?: string;
  observaciones?: string;
}
