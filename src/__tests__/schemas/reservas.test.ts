import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  createReservaSchema,
  createReservaSchemaBack,
  pickStepSchema,
  schemaCargaDos,
  schemaCargaTres,
  schemaCargaUno,
  updateReservaSchema,
} from "@/utils/objects/validationSchema";

/* Campos por paso: mismos que definen CargaUno / CargaDos / CargaTres en `steps` */
const CARGA1_PASO3 = ["valor_reserva", "valor_comision_app", "extra_check", "media_estadia"];
const CARGA1_PASO1 = ["departamento", "nombre_completo", "telefono", "cantidad_huespedes"];
const CARGA2_PASO2 = [
  "tipo_identificacion", "numero_identificacion", "nombre", "apellido",
  "email", "telefono", "nacionalidad", "documentacion_huespedes",
];
const CARGA2_PASO3 = [
  "check_in", "check_out", "extra_check", "media_estadia", "iva", "impuesto_municipal",
  "adicional_huesped", "cantidad_huesped_adicional", "valor_huesped_adicional",
  "solicitud_cochera", "valor_cochera",
];
const CARGA3_PASO1 = [
  "responsable_check_out", "check_out_especial", "ficha_lavadero", "cantidad_fichas_lavadero",
  "responsables_limpieza", "viaticos", "valor_viatico", "a_donde_viatico",
];

/** Mensajes de error por campo (primer error de cada uno) */
const errores = (schema: z.ZodTypeAny, data: unknown) => {
  const r = schema.safeParse(data);
  if (r.success) return {};
  const out: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const k = String(issue.path[0] ?? "_");
    out[k] ??= issue.message;
  }
  return out;
};

describe("Carga 1", () => {
  const paso3 = { valor_reserva: "120", extra_check: "", media_estadia: "" };

  it("Booking: la comisión es obligatoria en el paso 3", () => {
    const s = pickStepSchema(schemaCargaUno({ appReserva: "booking" }), CARGA1_PASO3);
    expect(errores(s, { ...paso3, valor_comision_app: "" }).valor_comision_app).toBe("Ingresá un valor de comisión");
    expect(errores(s, { ...paso3, valor_comision_app: "15.5" })).toEqual({});
  });

  it("otras apps: la comisión es opcional", () => {
    const s = pickStepSchema(schemaCargaUno({ appReserva: "airbnb" }), CARGA1_PASO3);
    expect(errores(s, { ...paso3, valor_comision_app: "" })).toEqual({});
  });

  it("valor de reserva: obligatorio y con hasta 2 decimales", () => {
    const s = pickStepSchema(schemaCargaUno({}), CARGA1_PASO3);
    expect(errores(s, { ...paso3, valor_reserva: "" }).valor_reserva).toBe("Ingresá un valor de reserva");
    expect(errores(s, { ...paso3, valor_reserva: "10.123" }).valor_reserva).toMatch(/dos decimales/);
  });

  it("paso 1: teléfono sin espacios, nombre sin números, entre 1 y 10 huéspedes", () => {
    const s = pickStepSchema(createReservaSchema, CARGA1_PASO1);
    const e = errores(s, { departamento: 1, nombre_completo: "Ana 2", telefono: "11 2233 4455", cantidad_huespedes: 0 });
    expect(e.nombre_completo).toMatch(/caracteres no válidos/);
    expect(e.telefono).toMatch(/no es válido/);
    expect(e.cantidad_huespedes).toBe("El mínimo es 1 huésped.");
    expect(errores(s, { departamento: 1, nombre_completo: "Ana Pérez", telefono: "1122334455", cantidad_huespedes: 2 })).toEqual({});
  });

  it("fechas: exige ingreso y egreso", () => {
    const s = pickStepSchema(createReservaSchema, ["fecha_estadia"]);
    expect(errores(s, { fecha_estadia: { from: new Date(), to: undefined } }).fecha_estadia).toBe("Debés seleccionar ambas fechas");
  });

  it("horarios: normaliza lo que escribe el usuario", () => {
    const s = pickStepSchema(createReservaSchema, ["check_in", "check_out"]);
    const r = s.safeParse({ check_in: "9", check_out: "1130" });
    expect(r.success && r.data).toEqual({ check_in: "09:00", check_out: "11:30" });
  });
});

describe("Alta de reserva en el back (createReservaSchemaBack)", () => {
  const valida = {
    departamento_id: 1, nombre_completo: "Ana Pérez", telefono_provisorio: "1122334455",
    cantidad_huespedes: 2, numero_reserva: "R123456", app_reserva: "booking",
    fecha_ingreso: "2026-01-10T03:00:00.000Z", fecha_egreso: "2026-01-13T03:00:00.000Z",
    check_in: "15:00", check_out: "11:00", valor_reserva: "120", estado_reserva: "reservado",
  };

  it("acepta una reserva válida y convierte las fechas", () => {
    const r = createReservaSchemaBack.safeParse(valida);
    expect(r.success).toBe(true);
    expect(r.success && r.data.fecha_ingreso).toBeInstanceOf(Date);
  });

  it("no permite crear una reserva ya cancelada", () => {
    expect(createReservaSchemaBack.safeParse({ ...valida, estado_reserva: "cancelado" }).success).toBe(false);
  });

  it("rechaza hora inválida", () => {
    expect(errores(createReservaSchemaBack, { ...valida, check_in: "25:00" }).check_in).toBe("Ingresá una hora válida");
  });
});

describe("Carga 2", () => {
  const paso3Base = {
    check_in: "15:00", check_out: "11:00", extra_check: "", media_estadia: "",
    iva: "", impuesto_municipal: "", adicional_huesped: "no", cantidad_huesped_adicional: 0,
    valor_huesped_adicional: "", solicitud_cochera: "no", valor_cochera: "",
  };

  it('huésped adicional "si": cantidad mínima 1 y valor obligatorio', () => {
    const s = pickStepSchema(schemaCargaDos({ adicionalHuesped: "si" }), CARGA2_PASO3);
    const e = errores(s, { ...paso3Base, adicional_huesped: "si" });
    expect(e.cantidad_huesped_adicional).toBe("El mínimo es 1 huésped.");
    expect(e.valor_huesped_adicional).toBe("Este campo es obligatorio");
    expect(errores(s, { ...paso3Base, adicional_huesped: "si", cantidad_huesped_adicional: 2, valor_huesped_adicional: "25" })).toEqual({});
  });

  it('cochera "si": valor obligatorio con hasta 2 decimales', () => {
    const s = pickStepSchema(schemaCargaDos({ solicitudCochera: "si" }), CARGA2_PASO3);
    expect(errores(s, { ...paso3Base, solicitud_cochera: "si" }).valor_cochera).toBe("Este campo es obligatorio");
    expect(errores(s, { ...paso3Base, solicitud_cochera: "si", valor_cochera: "10.555" }).valor_cochera).toMatch(/dos decimales/);
  });

  it('con "no" no exige valores de huésped adicional ni cochera', () => {
    const s = pickStepSchema(schemaCargaDos({ adicionalHuesped: "no", solicitudCochera: "no" }), CARGA2_PASO3);
    expect(errores(s, paso3Base)).toEqual({});
  });

  it("Booking: IVA e impuesto municipal deben ser numéricos (si se cargan)", () => {
    const booking = pickStepSchema(schemaCargaDos({ appReserva: "booking" }), CARGA2_PASO3);
    expect(errores(booking, { ...paso3Base, iva: "abc" }).iva).toMatch(/dos decimales/);
    const otra = pickStepSchema(schemaCargaDos({ appReserva: "airbnb" }), CARGA2_PASO3);
    expect(errores(otra, { ...paso3Base, iva: "abc" })).toEqual({});
  });

  describe("paso 4: cotización del dólar", () => {
    const s = pickStepSchema(updateReservaSchema, ["valor_dolar_oficial", "valor_dolar_blue"]);

    it.each([["0"], ["0.00"], ["000"]])("rechaza %s (no puede ser 0)", (valor) => {
      const e = errores(s, { valor_dolar_oficial: valor, valor_dolar_blue: valor });
      expect(e.valor_dolar_oficial).toBe("La cotización del dólar debe ser mayor a 0");
      expect(e.valor_dolar_blue).toBe("La cotización del dólar debe ser mayor a 0");
    });

    it.each([["abc"], ["-1250"], ["1250,50"], ["12.345"]])("rechaza %s (no es un número válido)", (valor) => {
      expect(errores(s, { valor_dolar_oficial: valor, valor_dolar_blue: "1300" }).valor_dolar_oficial).toBe(
        "Ingresá un número válido (ej. 1250.50)"
      );
    });

    it("vacío sigue siendo obligatorio", () => {
      expect(errores(s, { valor_dolar_oficial: "", valor_dolar_blue: "1300" }).valor_dolar_oficial).toBe("Este campo es obligatorio");
    });

    it.each([["1250"], ["1250.5"], ["1250.50"], [" 1310 "], ["0.5"]])("acepta %s", (valor) => {
      expect(errores(s, { valor_dolar_oficial: valor, valor_dolar_blue: valor })).toEqual({});
    });
  });

  describe("paso 2: datos del huésped", () => {
    const s = pickStepSchema(updateReservaSchema, CARGA2_PASO2);
    const pdf = new File(["%PDF"], "dni.pdf", { type: "application/pdf" });
    const huesped = {
      tipo_identificacion: "DNI", numero_identificacion: "30123456", nombre: "Ana", apellido: "Pérez",
      email: "", telefono: "1122334455", nacionalidad: "Argentina", documentacion_huespedes: pdf,
    };

    it("acepta un huésped válido con PDF", () => {
      expect(errores(s, huesped)).toEqual({});
    });

    it("documentación obligatoria y sólo imagen o PDF", () => {
      expect(errores(s, { ...huesped, documentacion_huespedes: undefined }).documentacion_huespedes).toBe("Seleccioná un archivo");
      const txt = new File(["hola"], "dni.txt", { type: "text/plain" });
      expect(errores(s, { ...huesped, documentacion_huespedes: txt }).documentacion_huespedes).toMatch(/imagenes o archivos PDF/);
    });

    it("documento alfanumérico de 7 a 10 caracteres y email válido si se carga", () => {
      expect(errores(s, { ...huesped, numero_identificacion: "30.123.456" }).numero_identificacion).toBeDefined();
      expect(errores(s, { ...huesped, numero_identificacion: "123" }).numero_identificacion).toBeDefined();
      expect(errores(s, { ...huesped, email: "ana@" }).email).toMatch(/correo electrónico/);
    });
  });
});

describe("Carga 3", () => {
  const responsable = { empleado_id: 3, hora_ingreso_limpieza: "10:00", hora_egreso_limpieza: "12:00" };
  const base = {
    responsable_check_out: 2, check_out_especial: "no", ficha_lavadero: "no", cantidad_fichas_lavadero: 0,
    responsables_limpieza: [responsable], viaticos: "no", valor_viatico: "", a_donde_viatico: 0,
  };

  it("acepta un check-out válido", () => {
    expect(errores(pickStepSchema(schemaCargaTres({}), CARGA3_PASO1), base)).toEqual({});
  });

  it("entre 1 y 3 responsables de limpieza", () => {
    const s = pickStepSchema(schemaCargaTres({}), CARGA3_PASO1);
    expect(errores(s, { ...base, responsables_limpieza: [] }).responsables_limpieza).toBe("Debés asignar al menos un responsable");
    expect(errores(s, { ...base, responsables_limpieza: Array(4).fill(responsable) }).responsables_limpieza).toBe("No podés agregar más de 3 responsables");
  });

  it("horas de limpieza válidas y responsable obligatorio", () => {
    const s = pickStepSchema(schemaCargaTres({}), CARGA3_PASO1);
    const e = s.safeParse({ ...base, responsables_limpieza: [{ empleado_id: 0, hora_ingreso_limpieza: "930", hora_egreso_limpieza: "12:00" }] });
    expect(e.success).toBe(false);
    const mensajes = e.success ? [] : e.error.issues.map((i) => i.message);
    expect(mensajes).toEqual(expect.arrayContaining(["Seleccioná un responsable", "Ingresá una hora válida"]));
  });

  it('viático "si": valor y destino obligatorios', () => {
    const s = pickStepSchema(schemaCargaTres({ viatico: "si" }), CARGA3_PASO1);
    const e = errores(s, { ...base, viaticos: "si" });
    expect(e.valor_viatico).toBe("Este campo es obligatorio");
    expect(e.a_donde_viatico).toBe("Seleccioná un valor");
  });

  it('fichas de lavadero "si": entre 1 y 10', () => {
    const s = pickStepSchema(schemaCargaTres({ fichaLavadero: "si" }), CARGA3_PASO1);
    expect(errores(s, { ...base, ficha_lavadero: "si" }).cantidad_fichas_lavadero).toBe("El mínimo es 1 ficha.");
    expect(errores(s, { ...base, ficha_lavadero: "si", cantidad_fichas_lavadero: 11 }).cantidad_fichas_lavadero).toBe("El máximo es 10 fichas.");
  });
});

describe("Mensajes de error en español", () => {
  it('un campo sin tocar (undefined) dice "Este campo es obligatorio", no "Required"', () => {
    const s = pickStepSchema(updateReservaSchema, ["nombre", "apellido"]);
    expect(errores(s, {})).toEqual({ nombre: "Este campo es obligatorio", apellido: "Este campo es obligatorio" });
  });

  it("los mensajes propios del schema tienen prioridad", () => {
    const s = pickStepSchema(updateReservaSchema, ["fecha_de_pago"]);
    expect(errores(s, {}).fecha_de_pago).toBe("Este campo es obligatorio");
    const t = pickStepSchema(updateReservaSchema, ["medio_de_pago"]);
    expect(errores(t, { medio_de_pago: 5 }).medio_de_pago).toBe("Este campo es obligatorio");
  });
});
