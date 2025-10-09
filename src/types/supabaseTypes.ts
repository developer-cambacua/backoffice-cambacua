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
  max_huespedes: number;
  image?: any;
  propietario: IUsuario;
}

export interface IResponsableLimpieza {
  tiempo_limpieza: string | null;
  empleado:
    | {
        id: number;
        nombre: string;
        apellido: string;
      }[]
    | null;
}

export interface IEmpleados {
  id: number;
  nombre: string;
  apellido: string;
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

export type StatusType =
  | "reservado"
  | "en_proceso"
  | "completado"
  | "cancelado"
  | "desconocido";

export interface IReservasDefault {
  id: number;
  departamento_id: number;
  cantidad_huespedes: number;
  fecha_ingreso: string;
  fecha_egreso: string;
  numero_reserva: string;
  app_reserva: string;
  check_in: string;
  check_out: string;
  valor_comision_app: number;
  estado_reserva: StatusType;
  documentacion_huesped: string | null;
  valor_reserva: number;
  huesped_id: number;
  iva: number;
  impuesto_municipal: number;
  cantidad_huesped_adicional: number;
  valor_huesped_adicional: number;
  valor_cochera: number;
  valor_ficha_lavadero: number;
  fecha_de_pago: Date | string | null;
  quien_cobro: number | null;
  responsable_check_in: number | { nombre: string; apellido: string } | null;
  responsable_check_out: number | { nombre: string; apellido: string } | null;
  valor_dolar_oficial: number;
  valor_dolar_blue: number;
  medio_de_pago: string;
  moneda_del_pago: string;
  diferencia_montos: number;
  extra_check: number;
  media_estadia: number;
  valor_viatico: number | null;
  ganancia_bruta: number;
  destino_viatico: number | IDepartamento | null;
  check_in_especial: boolean;
  check_out_especial: boolean;
  cantidad_fichas_lavadero: number | null;
  total_a_cobrar: number;
  posee_factura: boolean;
  numero_factura: string | null;
  nombre_completo: string;
  observaciones: string | null;
  created_at: Date | string | null;
  telefono_provisorio: string;
  observaciones_pagos: string | null;
  departamento: {
    id: number;
    nombre: string;
    direccion: string;
  };
  huesped: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    nacionalidad: string;
    tipo_identificacion: string;
    numero_identificacion: string;
  };
  responsables_limpieza: IResponsableLimpieza[] | null;
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

export type ApiError = {
  message: string;
  details?: string | object;
  status: number;
  skipToast?: boolean;
};

export interface Configuracion {
  id: number;
  created_at: Date;
  user_id: number | null;
  allow_past_dates: boolean;
}

export interface IEmpleadoOption {
  key: string;
  label: string;
  value: number | null;
}
