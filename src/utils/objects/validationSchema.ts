import { z } from "zod";
import { esHoraValida, normalizarHoraInput } from "../functions/functions";

/* ------------- Validación y default values para reservas 1 , 2 y 3 ------------- */

export const defaultValuesReservas = {
  departamento_id: 0,
  nombre_completo: "",
  telefono: "",
  numero_reserva: "",
  app_reserva: "",
  cantidad_huespedes: 0,
  fecha_estadia: { from: undefined, to: undefined },
  check_in: "15:00",
  check_out: "11:00",
  valor_reserva: "",
  valor_comision_app: "",
  extra_check: "",
  media_estadia: "",
  observaciones: "",
};

export const zodRSchema = z.object({
  departamento: z.number().min(1, "Ingresá un departamento").default(0),
  nombre_completo: z
    .string()
    .min(1, "Este campo es obligatorio")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ'´ ]+$/,
      "El nombre contiene caracteres no válidos"
    ),
  telefono: z
    .string()
    .min(1, "Este campo es obligatorio")
    .regex(/^\d{8,15}$/, "El número de teléfono no es válido."),
  cantidad_huespedes: z
    .number()
    .min(1, "El mínimo es 1 huésped.")
    .max(10, "El máximo es 10 huéspedes."),
  numero_reserva: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(4, "El numero de reserva debe tener al menos 4 dígitos"),
  app_reserva: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(2, "La app debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Seleccioná un valor.")
    .default(""),
  fecha_estadia: z
    .object({
      from: z
        .date({ required_error: "Seleccioná la fecha de ingreso" })
        .optional(),
      to: z
        .date({ required_error: "Seleccioná la fecha de egreso" })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.from || !data.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debés seleccionar ambas fechas",
          path: [],
        });
      }
    }),
  check_in: z
    .string({
      required_error: "La hora es obligatoria",
      invalid_type_error: "Ingresá una hora válida",
    })
    .transform((val) => normalizarHoraInput(val))
    .refine((val) => esHoraValida(val), {
      message: "Ingresá una hora válida",
    })
    .optional(),
  check_out: z
    .string({
      required_error: "La hora es obligatoria",
      invalid_type_error: "Ingresá una hora válida",
    })
    .transform((val) => normalizarHoraInput(val))
    .refine((val) => esHoraValida(val), {
      message: "Ingresá una hora válida",
    })
    .optional(),
  valor_reserva: z
    .string()
    .min(1, "Ingresá un valor de reserva")
    .regex(
      /^\d{0,9}(\.\d{0,2})?$/,
      "Solo se permiten números con hasta dos decimales"
    ),
  valor_comision_app: z.string().optional(),
  extra_check: z
    .string()
    .regex(
      /^\d{0,9}(\.\d{0,2})?$/,
      "Solo se permiten números con hasta dos decimales"
    )
    .optional(),
  media_estadia: z
    .string()
    .regex(
      /^\d{0,9}(\.\d{0,2})?$/,
      "Solo se permiten números con hasta dos decimales"
    )
    .optional(),
  observaciones: z
    .string()
    .max(250, "Las observaciones no pueden superar los 250 caracteres")
    .optional(),
});

/* Etapa 2 */

export const defaultValuesReservas2 = {
  tipo_identificacion: "DNI" as const,
  numero_identificacion: "",
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  emailAlt: "",
  nacionalidad: "",
  check_in: "15:00",
  check_out: "11:00",
  extra_check: "",
  media_estadia: "",
  documentacion_huespedes: undefined,
  iva: "",
  impuesto_municipal: "",
  adicional_huesped: "no" as const,
  cantidad_huesped_adicional: 0,
  valor_huesped_adicional: "",
  solicitud_cochera: "no" as const,
  valor_cochera: "",
  fecha_de_pago: undefined,
  posee_factura: "si" as const,
  numero_factura: "",
  quien_cobro: 0,
  responsable_check_in: 0,
  check_in_especial: "no" as const,
};

export const zodRSchema2 = z.object({
  tipo_identificacion: z
    .enum(["DNI", "Pasaporte", "Cédula", "Otros"])
    .default("DNI"),
  numero_identificacion: z
    .string()
    .min(1, "Este campo es obligatorio")
    .regex(/^[A-Za-z0-9]{5,12}$/, "Solo se permiten caracteres alfanúmericos")
    .min(7, "El número de identificación debe tener al menos 7 dígitos")
    .max(10, "Ingresá un número de identificación válido"),
  nombre: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/, "Solo se permiten letras."),
  apellido: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras."),
  telefono: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(2, "El teléfono debe tener al menos 8 dígitos")
    .regex(/^\d{8,15}$/, "El número de teléfono no es válido."),
  email: z
    .string()
    .max(45, "Ingresá un correo electronico válido")
    .optional()
    .refine((email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
      message: "Ingresa un correo electrónico válido.",
    }),
  email_alternativo: z
    .string()
    .max(45, "Ingresá un correo electronico válido")
    .nullable()
    .optional()
    .refine((email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
      message: "Ingresa un correo electrónico válido.",
    }),
  nacionalidad: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(2, "El país debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras."),
  check_in: z.string().min(1, "Este campo es obligatorio"),
  check_out: z.string().min(1, "Este campo es obligatorio"),
  extra_check: z
    .string()
    .regex(
      /^\d{0,9}(\.\d{0,2})?$/,
      "Solo se permiten números con hasta dos decimales"
    )
    .optional(),
  media_estadia: z
    .string()
    .regex(
      /^\d{0,9}(\.\d{0,2})?$/,
      "Solo se permiten números con hasta dos decimales"
    )
    .optional(),
  documentacion_huespedes: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, {
      message: "Seleccioná un archivo",
    })
    .refine(
      (file) =>
        file instanceof File &&
        [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "application/pdf",
        ].includes(file.type),
      {
        message: "Solo se permiten imagenes o archivos PDF.",
      }
    ),
  iva: z.string().optional(),
  impuesto_municipal: z.string().optional(),
  adicional_huesped: z.enum(["si", "no"]).default("no"),
  cantidad_huesped_adicional: z.number().optional().default(0),
  valor_huesped_adicional: z.string().optional(),
  solicitud_cochera: z.enum(["si", "no"]).default("no"),
  valor_cochera: z.string().optional(),
  valor_dolar_oficial: z
    .string({
      required_error: "Este campo es obligatorio",
      invalid_type_error: "Este campo es obligatorio",
    })
    .min(1, "Este campo es obligatorio"),
  valor_dolar_blue: z
    .string({
      required_error: "Este campo es obligatorio",
      invalid_type_error: "Este campo es obligatorio",
    })
    .min(1, "Este campo es obligatorio"),
  fecha_de_pago: z.date({ required_error: "Este campo es obligatorio" }),
  medio_de_pago: z
    .string({
      required_error: "Este campo es obligatorio",
      invalid_type_error: "Este campo es obligatorio",
    })
    .min(1, "Este campo es obligatorio"),
  moneda_del_pago: z
    .string({
      required_error: "Este campo es obligatorio",
      invalid_type_error: "Este campo es obligatorio",
    })
    .min(1, "Este campo es obligatorio"),
  posee_factura: z.enum(["si", "no"]).default("si"),
  numero_factura: z
    .string()
    .max(25, "El número de factura es incorrecto")
    .optional(),
  quien_cobro: z.number().min(1, "Seleccioná una opción").default(0),
  responsable_check_in: z.number().min(1, "Ingresá un responsable").default(0),
  check_in_especial: z.enum(["si", "no"]).default("no"),
  observaciones: z
    .string()
    .max(250, "La observación no debe exceder los 250 caracteres")
    .nullable(),
});

/* Etapa 3 */

export const defaultValuesReservas3 = {
  responsable_check_out: 0,
  check_out_especial: "no" as const,
  ficha_lavadero: "no" as const,
  cantidad_fichas_lavadero: 0,
  viaticos: "no" as const,
  valor_viatico: "",
  a_donde_viatico: 0,
};

export const zodRSchema3 = z.object({
  check_out_especial: z.enum(["si", "no"]).default("no"),
  responsable_check_out: z
    .number({
      required_error: "Ingresá un responsable",
      invalid_type_error: "Ingresá un responsable",
    })
    .min(1, "Ingresá un responsable")
    .default(0),
  ficha_lavadero: z.enum(["si", "no"]).default("no"),
  cantidad_fichas_lavadero: z.number().optional().default(0),
  // hora_ingreso_limpieza: z.string().min(1, "Este campo es obligatorio"),
  // hora_egreso_limpieza: z.string().min(1, "Este campo es obligatorio"),
  // responsable_limpieza: z.number().min(1, "Ingresá un responsable").default(0),
  responsables_limpieza: z
    .array(
      z.object({
        empleado_id: z
          .number({
            required_error: "Seleccioná un responsable",
            invalid_type_error: "Seleccioná un responsable",
          })
          .min(1, "Seleccioná un responsable"),
        hora_ingreso_limpieza: z
          .string({
            required_error: "La hora es obligatoria",
            invalid_type_error: "Ingresá una hora válida",
          })
          .transform((val) => normalizarHoraInput(val))
          .refine((val) => esHoraValida(val), {
            message: "Ingresá una hora válida",
          }),
        hora_egreso_limpieza: z
          .string({
            required_error: "La hora es obligatoria",
            invalid_type_error: "Ingresá una hora válida",
          })
          .transform((val) => normalizarHoraInput(val))
          .refine((val) => esHoraValida(val), {
            message: "Ingresá una hora válida",
          }),
      }),
      {
        required_error: "Debés asignar al menos un responsable",
        invalid_type_error: "Debés asignar al menos un responsable",
      }
    )
    .min(1, "Debés asignar al menos un responsable")
    .max(3, "No podés agregar más de 3 responsables"),
  viaticos: z.enum(["si", "no"]).default("no"),
  valor_viatico: z.string().optional(),
  a_donde_viatico: z.number().optional().default(0),
});

/* ------------- Validación y default values para usuarios ------------- */

export const defaultValueUsers = {
  nombre: "",
  apellido: "",
  email: "",
  rol: "",
};

export const zodUserSchema = z.object({
  nombre: z
    .string()
    .min(1, "Este campo es obligatorio")
    .max(45, "El nombre es demasiado largo"),
  apellido: z
    .string()
    .min(1, "Este campo es obligatorio")
    .max(45, "El apellido es demasiado largo"),
  email: z
    .string()
    .min(1, "Este campo es obligatorio")
    .email("Ingresá un mail válido"),
  rol: z.string().refine((val) => val !== "", { message: "Seleccioná un rol" }),
});

/* ------------- Validación y default values para departamentos ------------- */

export const defaultValueDeptos = {
  nombre: "",
  direccion: "",
  propietario: "",
  max_huespedes: 0,
};

export const zodDeptosSchema = z.object({
  nombre: z
    .string()
    .min(1, "Este campo es obligatorio")
    .max(90, "El nombre es demasiado largo"),
  direccion: z
    .string()
    .min(1, "Este campo es obligatorio")
    .max(90, "El nombre es demasiado largo"),
  propietario: z.number().min(1, "Seleccioná un propietario").default(0),
  max_huespedes: z
    .number()
    .min(1, "El mínimo es 1 huésped.")
    .max(10, "El máximo es 10 huéspedes."),
});

/* ------------- Validación y default values para Editar reserva ------------- */

export const zodEditarReserva = z.object({
  check_out: z.string().optional(),
  responsable_check_out: z.number().default(0).optional(),
  media_estadia: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined || val === "" || /^\d{0,9}(\.\d{0,2})?$/.test(val),
      {
        message: "Solo se permiten números con hasta dos decimales",
      }
    ),
  medio_de_pago: z.string().optional(),
  moneda_del_pago: z.string().optional(),
  valor_dolar_oficial: z.string().optional(),
  valor_dolar_blue: z.string().optional(),
  quien_cobro: z.any().optional(),
  numero_factura: z
    .string()
    .max(25, "El número de factura es incorrecto")
    .optional()
    .refine((val) => val === undefined || val === "" || val.length <= 45, {
      message: "El número de factura es incorrecto",
    }),
});
