interface IData {
  key: string;
  label: string;
  column?: string;
  isTimestamp?: boolean;
}

export const headersTableDeptos: IData[] = [
  { label: "Departamento", key: "Departamento", column: "" },
  { label: "Propietario", key: "propietario", column: "" },
  { label: "Dirección", key: "direccion", column: "" },
  { label: "Máx. Huésp.", key: "CantMaxHuespedes", column: "" },
  { label: "Mail de contacto", key: "mailPropietario", column: "" },
  { label: "Acciones", key: "acciones" },
];

export const headersTableReservas: IData[] = [
  { label: "N° de reserva", key: "numero_reserva" },
  { label: "Departamento", key: "departamento" },
  { label: "Huesped", key: "huesped" },
  { label: "App de reserva", key: "app_reserva" },
  {
    label: "Ingreso",
    key: "Ingreso",
    column: "fecha_ingreso",
    isTimestamp: true,
  },
  { label: "Egreso", key: "Egreso", column: "fecha_egreso", isTimestamp: true },
  { label: "Estado", key: "estadoReserva" },
  { label: "Acciones", key: "accionesReserva" },
];

export const headerTableHistorialReservas: any = [
  {
    label: "Número de reserva",
    key: "numero_reserva",
  },
  {
    label: "Huésped",
    key: "huesped",
  },
  {
    label: "Fecha de ingreso",
    key: "fecha_ingreso",
  },
  {
    label: "Fecha de egreso",
    key: "fecha_egreso",
  },
  // {
  //   label: "Ver reserva",
  //   key: "ver_reserva",
  // },
];

export const headersTableUsers: IData[] = [
  { label: "Nombre y apellido", key: "nombreUsuario", column: "" },
  { label: "Mail", key: "mailUsuario", column: "" },
  { label: "Rol", key: "rolUsuario", column: "" },
];

export const headersTableChecks: IData[] = [
  { label: "Empleado", key: "empleado" },
  { label: "Check-Ins", key: "checkIns" },
  { label: "Check-outs", key: "checkOuts" },
];

export const headersTableChecksExpanded: IData[] = [
  { label: "Tipo", key: "tipoCheck" },
  { label: "Empleado", key: "empleadoCheck" },
  { label: "Fecha", key: "fechaCheck" },
  { label: "Departamento", key: "deptoCheck" },
  { label: "Huésped", key: "huespedCheck" },
];

export const headersTableReportesLimpieza: IData[] = [
  { label: "Empleado", key: "empleado" },
  { label: "Total horas", key: "totalHorasLimpieza" },
];

export const headersReportesLimpiezaPrimario: IData[] = [
  { label: "Empleado", key: "empleado" },
  { label: "Departamento", key: "deptoLimpieza" },
  { label: "Hora de ingreso", key: "horaIngresoLimpieza" },
  { label: "Hora de egreso", key: "horaEgresoLimpieza" },
  { label: "Duración", key: "duracionLimpieza" },
  { label: "Notas", key: "notasLimpieza" },
];

export const headersReportesLimpiezaSecundario: IData[] = [
  { label: "Fecha", key: "fechaLimpieza" },
  { label: "Empleado", key: "empleado" },
  { label: "Departamento", key: "deptoLimpieza" },
  { label: "Duración", key: "duracionLimpieza" },
  { label: "Fichas", key: "fichasLimpieza" },
  { label: "Notas", key: "notasLimpieza" },
];

export const headersTableFichas: IData[] = [
  { label: "Departamento", key: "deptoLimpieza" },
  { label: "Fichas", key: "fichasUtilizadas" },
  { label: "Notas", key: "notasLimpieza" },
];
