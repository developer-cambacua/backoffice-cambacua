import { describe, it, expect } from "vitest";
import {
  formatterMap,
  getReservaPath,
  parseMesAnio,
  sanitizeData,
  transformData,
} from "@/utils/functions/functions";
import {
  formatearResponsablesParaCSV,
  headers,
} from "@/utils/functions/csvHelpers";

/* Intl usa espacios duros; se normalizan para comparar */
const n = (s: string) => s.replace(/\s/g, " ");

describe("formatterMap (montos en pantalla y recibo)", () => {
  it.each([
    ["USD", 1234.5, "$1,234.50"],
    ["USD", 1000, "$1,000"],
    ["ARS", 1234.5, "$ 1.234,50"],
    ["ARS", 1000, "$ 1.000"],
    ["EUR", 1234.5, "1.234,50 €"],
    ["EUR", 1000, "1.000 €"],
  ])("%s %d → %s", (moneda, valor, esperado) => {
    expect(n(formatterMap[moneda](valor as number))).toBe(esperado);
  });

  it("NaN muestra el aviso de error en vez de un monto", () => {
    for (const f of Object.values(formatterMap)) {
      expect(f(NaN)).toBe("Error, verificá los datos.");
    }
  });
});

describe("parseMesAnio (rutas de reportes /reportes/.../[fecha])", () => {
  it.each([
    ["112026", { mes: 11, anio: 2026 }],
    ["32025", { mes: 3, anio: 2025 }],
    [["012026"], { mes: 1, anio: 2026 }],
  ])("%j → %j", (entrada, esperado) => {
    expect(parseMesAnio(entrada as string | string[])).toEqual(esperado);
  });

  it.each(["132026", "02026", "abc", "2026-11"])("rechaza %s", (entrada) => {
    expect(() => parseMesAnio(entrada)).toThrow();
  });
});

describe("getReservaPath (botón 'Continuar reserva')", () => {
  it.each([
    ["reservado", "/reservas/carga-2/5"],
    ["en_proceso", "/reservas/carga-3/5"],
    ["completado", "/reservas/detalle/5"],
    ["cancelado", "/reservas/detalle/5"],
  ])("%s → %s", (estado, esperado) => {
    expect(getReservaPath(estado, "5")).toBe(esperado);
  });
});

describe("sanitizeData", () => {
  it("convierte vacíos y undefined en null y deja el resto igual", () => {
    expect(sanitizeData({ a: "", b: undefined, c: 0, d: "x", e: false })).toEqual({
      a: null, b: null, c: 0, d: "x", e: false,
    });
  });
});

describe("CSV de 'Descargar reporte'", () => {
  const reserva = {
    departamento: { nombre: "Depto 1" },
    huesped: {
      nombre: "Ana", apellido: "Pérez", email: "ana@mail.com", telefono: "1122334455",
      tipo_identificacion: "DNI", numero_identificacion: "30123456",
    },
    nombre_completo: "Ana P",
    quien_cobro: { nombre: "Tamara", apellido: "X" },
    responsable_check_in: { nombre: "Juan", apellido: "Y" },
    responsable_check_out: null,
    responsables_limpieza: [
      { empleado: { nombre: "Lu", apellido: "Z" }, hora_ingreso: "10:00", hora_egreso: "12:30", tiempo_limpieza: "2:30" },
    ],
    check_in_especial: true,
    check_out_especial: false,
    total_a_cobrar: 154880,
  };

  const [fila] = transformData(formatearResponsablesParaCSV([reserva]), headers);

  it("incluye tipo y número de documento del huésped", () => {
    expect(headers.map((h) => h.label)).toEqual(
      expect.arrayContaining(["Tipo de identificación", "Número de identificación"])
    );
    expect(fila["huesped.tipo_identificacion"]).toBe("DNI");
    expect(fila["huesped.numero_identificacion"]).toBe("30123456");
  });

  it("arma nombres de personas y el detalle de limpieza", () => {
    expect(fila["nombre_completo"]).toBe("Ana Pérez");
    expect(fila["quien_cobro"]).toBe("Tamara X");
    expect(fila["responsable_check_in"]).toBe("Juan Y");
    expect(fila["responsable_check_out"]).toBe(" ");
    expect(fila["detalle_limpieza"]).toBe("Lu Z (10:00hs a 12:30hs, Total: 2:30hs)");
  });

  it("booleanos como sí/no, total intacto y faltantes como '-'", () => {
    expect(fila["check_in_especial"]).toBe("sí");
    expect(fila["check_out_especial"]).toBe("no");
    expect(fila["total_a_cobrar"]).toBe(154880);
    expect(fila["valor_cochera"]).toBe("-");
  });

  it("una reserva sin huésped todavía (estado reservado) no rompe la exportación", () => {
    const [f] = transformData(formatearResponsablesParaCSV([{ nombre_completo: "Sin huésped" }]), headers);
    expect(f["huesped.numero_identificacion"]).toBe("-");
    expect(f["detalle_limpieza"]).toBe("-");
  });
});
