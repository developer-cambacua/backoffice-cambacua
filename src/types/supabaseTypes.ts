export interface IUsuario {
  id: number;
  rol: string;
  email: string;
  nombre: string;
  apellido: string;
  isActive: boolean;
  created_at: string;
}

export interface IDepartamento {
  id: number;
  nombre: string;
  isActive: boolean;
  direccion: string;
  created_at: string;
  usuario: IUsuario;
  max_huespedes: number;
  image?: any;
}

export interface IResponsableLimpieza {
  id: number;
  rol: string;
  email: string;
  nombre: string;
  apellido: string;
  isActive: boolean;
  created_at: string;
}

export interface IHuesped {
  id: number;
  dni?: string;
  tipo_identificacion: "DNI" | "Pasaporte" | "Cédula" | "Otros";
  numero_identificacion: string;
  nombre: string;
  apellido: string;
  email: string | undefined;
  emailAlt: string | undefined;
  telefono: string;
  nacionalidad: string;
  created_at: string;
}

export interface IReserva {
  id: number;
  created_at: string;
  departamento_id: number;
  cantidad_huespedes: number;
  fecha_ingreso: string;
  fecha_egreso: string;
  numero_reserva: string;
  app_reserva: string;
  check_in: string;
  check_out: string;
  valor_comision_app: any;
  estado_reserva: string;
  documentacion_huesped: any;
  valor_reserva: number;
  huesped_id: number;
  iva: any;
  impuesto_municipal: any;
  cantidad_huesped_adicional: any;
  valor_huesped_adicional: any;
  valor_cochera: any;
  cantidad_fichas_lavadero: string | number;
  valor_ficha_lavadero: any;
  fecha_de_pago: any;
  quien_cobro: any;
  responsable_check_in: any;
  responsable_check_out: any;
  valor_dolar_oficial: any;
  valor_dolar_blue: any;
  medio_de_pago: any;
  moneda_del_pago: any;
  diferencia_montos: any;
  extra_check: any;
  media_estadia: any;
  check_in_especial: boolean;
  valor_limpieza: any;
  valor_viatico: any;
  ganancia_bruta: any;
  check_out_especial: boolean;
  destino_viatico: IDepartamento;
  tiempo_limpieza: any;
  hora_ingreso_limpieza: any;
  hora_egreso_limpieza: any;
  responsable_limpieza: IResponsableLimpieza;
  valor_check_out_especial: any;
  nombre_completo: string;
  telefono_provisorio: string;
  departamento: IDepartamento;
  huesped: IHuesped;
}

/* Tipado para el caso que se seleccione un huésped existente: */

export type SelectedGuest = Pick<
  IHuesped,
  | "id"
  | "nombre"
  | "apellido"
  | "email"
  | "tipo_identificacion"
  | "numero_identificacion"
  | "dni"
  | "telefono"
  | "nacionalidad"
>;
