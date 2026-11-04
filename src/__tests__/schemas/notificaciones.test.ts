import { describe, it, expect } from "vitest";
import { notificacionSchema } from "@/utils/objects/validationSchema";
import {
  diaArgentinaDesdeISO,
  finDelDiaArgentina,
} from "@/utils/functions/functions";

const valida = {
  message: "Mantenimiento programado",
  type: "warning",
  visible: true,
  expires_at: "2026-12-01T02:59:59.999Z",
};

describe("notificacionSchema", () => {
  it("acepta una notificación válida", () => {
    expect(notificacionSchema.safeParse(valida).success).toBe(true);
  });

  it("recorta espacios del mensaje y rechaza uno vacío", () => {
    expect(notificacionSchema.parse({ ...valida, message: "  hola  " }).message).toBe("hola");
    expect(notificacionSchema.safeParse({ ...valida, message: "   " }).success).toBe(false);
  });

  it("rechaza mensajes de más de 200 caracteres", () => {
    expect(notificacionSchema.safeParse({ ...valida, message: "a".repeat(201) }).success).toBe(false);
    expect(notificacionSchema.safeParse({ ...valida, message: "a".repeat(200) }).success).toBe(true);
  });

  it("rechaza un tipo desconocido", () => {
    expect(notificacionSchema.safeParse({ ...valida, type: "rosa" }).success).toBe(false);
  });

  it("acepta los 8 tipos de la tabla", () => {
    for (const type of ["info", "success", "warning", "error", "in_progress", "dark", "light", "special"]) {
      expect(notificacionSchema.safeParse({ ...valida, type }).success).toBe(true);
    }
  });

  it("el vencimiento es obligatorio y debe ser una fecha", () => {
    expect(notificacionSchema.safeParse({ ...valida, expires_at: "" }).success).toBe(false);
    expect(notificacionSchema.safeParse({ ...valida, expires_at: "no-es-fecha" }).success).toBe(false);
    const { expires_at, ...sinVencimiento } = valida;
    expect(notificacionSchema.safeParse(sinVencimiento).success).toBe(false);
  });

  it("visible es true por defecto", () => {
    const { visible, ...sinVisible } = valida;
    expect(notificacionSchema.parse(sinVisible).visible).toBe(true);
  });

  it(".partial() no inyecta defaults (un PATCH no pisa campos que no vienen)", () => {
    expect(notificacionSchema.partial().parse({ visible: false })).toEqual({ visible: false });
    expect(notificacionSchema.partial().parse({})).toEqual({});
  });
});

describe("vencimiento (hora Argentina)", () => {
  it("el día elegido vence a las 23:59:59.999 de Argentina (02:59:59.999Z del día siguiente)", () => {
    expect(finDelDiaArgentina(new Date(2026, 11, 1))).toBe("2026-12-02T02:59:59.999Z");
  });

  it("maneja el cambio de mes y de año", () => {
    expect(finDelDiaArgentina(new Date(2026, 11, 31))).toBe("2027-01-01T02:59:59.999Z");
  });

  it("diaArgentinaDesdeISO es la inversa de finDelDiaArgentina", () => {
    const d = new Date(2026, 5, 15);
    const vuelta = diaArgentinaDesdeISO(finDelDiaArgentina(d));
    expect([vuelta.getFullYear(), vuelta.getMonth(), vuelta.getDate()]).toEqual([2026, 5, 15]);
  });
});
