import { describe, it, expect } from "vitest";
import {
  ajustarFechaUTC,
  calculateDaysBetween,
  calculateTimeDifference,
  decimalAHorasMinutos,
  esHoraValida,
  normalizarHoraInput,
  parseTiempoLimpieza,
} from "@/utils/functions/functions";

describe("calculateDaysBetween (noches de la reserva)", () => {
  it("cuenta las noches entre ingreso y egreso", () => {
    expect(calculateDaysBetween("2026-01-10T03:00:00.000Z", "2026-01-13T03:00:00.000Z")).toBe(3);
  });

  it("funciona con fechas guardadas con ajustarFechaUTC(-3)", () => {
    const ingreso = ajustarFechaUTC(new Date(2026, 0, 10), -3);
    const egreso = ajustarFechaUTC(new Date(2026, 0, 17), -3);
    expect(calculateDaysBetween(ingreso, egreso)).toBe(7);
  });

  it("cruza fin de mes y de año", () => {
    expect(calculateDaysBetween("2025-12-30T03:00:00.000Z", "2026-01-02T03:00:00.000Z")).toBe(3);
  });

  it("sin alguna de las fechas devuelve 0", () => {
    expect(calculateDaysBetween(undefined, "2026-01-02T03:00:00.000Z")).toBe(0);
    expect(calculateDaysBetween("2026-01-02T03:00:00.000Z", undefined)).toBe(0);
  });
});

describe("ajustarFechaUTC", () => {
  it("con offset -3 suma 3 horas al instante", () => {
    const local = new Date("2026-01-10T00:00:00.000Z");
    expect(ajustarFechaUTC(local, -3)).toBe("2026-01-10T03:00:00.000Z");
  });
});

describe("calculateTimeDifference (tiempo de limpieza)", () => {
  it.each([
    ["10:00", "12:30", "2:30"],
    ["09:15", "09:45", "0:30"],
    ["11:00", "11:00", "0:00"],
    ["23:30", "01:15", "1:45"], // cruza medianoche
  ])("%s → %s = %s", (ingreso, egreso, esperado) => {
    expect(calculateTimeDifference(ingreso, egreso)).toBe(esperado);
  });

  it.each([["25:00", "10:00"], ["10:00", "10:61"], ["abc", "10:00"]])(
    "lanza error con horas inválidas (%s, %s)",
    (ingreso, egreso) => {
      expect(() => calculateTimeDifference(ingreso, egreso)).toThrow();
    }
  );
});

describe("normalizarHoraInput / esHoraValida", () => {
  it.each([
    ["9", "09:00"],
    ["15", "15:00"],
    ["1530", "15:30"],
    ["9:5", "09:50"],
    ["  10:15 ", "10:15"],
  ])("normaliza %s → %s", (entrada, esperado) => {
    expect(normalizarHoraInput(entrada)).toBe(esperado);
  });

  it("vacío o null devuelve null", () => {
    expect(normalizarHoraInput("")).toBeNull();
    expect(normalizarHoraInput("   ")).toBeNull();
    expect(normalizarHoraInput(null)).toBeNull();
  });

  it.each([["00:00", true], ["23:59", true], ["9:30", true], ["24:00", false], ["12:60", false], ["1230", false], [null, false]])(
    "esHoraValida(%s) = %s",
    (valor, esperado) => {
      expect(esHoraValida(valor as string | null)).toBe(esperado);
    }
  );
});

describe("parseTiempoLimpieza + decimalAHorasMinutos (suma de horas de limpieza)", () => {
  it("convierte H:MM a horas decimales", () => {
    expect(parseTiempoLimpieza("1:45")).toBe(1.75);
    expect(parseTiempoLimpieza("0:30")).toBe(0.5);
    expect(parseTiempoLimpieza("")).toBe(0);
  });

  it("vuelve a formato H:MM", () => {
    expect(decimalAHorasMinutos(2.25)).toBe("2:15");
    expect(decimalAHorasMinutos(0)).toBe("0:00");
  });

  const sumar = (...tiempos: string[]) =>
    decimalAHorasMinutos(tiempos.reduce((acc, t) => acc + parseTiempoLimpieza(t), 0));

  it.each([
    [["1:45", "0:30"], "2:15"],
    [["1:10", "1:50"], "3:00"],
    [["0:20", "0:20", "0:20"], "1:00"],
    [["2:59", "0:01"], "3:00"],
    [["0:40", "0:40", "0:40"], "2:00"],
    // Casos reales que daban "h:60" por redondeo de coma flotante:
    [["0:20", "1:40"], "2:00"],
    [["0:05", "1:55"], "2:00"],
    [["0:11", "2:49"], "3:00"],
    [["1:02", "2:09", "0:19", "3:23", "0:07"], "7:00"],
  ])("suma %j = %s (nunca devuelve minutos = 60)", (tiempos, esperado) => {
    expect(sumar(...(tiempos as string[]))).toBe(esperado);
  });
});
