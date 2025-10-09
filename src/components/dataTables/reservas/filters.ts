export interface IFiltersReservas {
  selectedDepartamento?: number | null;
  selectedEstado?: string | number | undefined;
  selectedAppReserva?: string | undefined;
  date?: Date | undefined;
  from?: Date | undefined;
  to?: Date | undefined;
}

export interface IEstadoReserva {
  estado_reserva: string;
}
