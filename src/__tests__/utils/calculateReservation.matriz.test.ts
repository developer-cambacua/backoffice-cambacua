import { describe, it, expect } from "vitest";
import {
  calculateReservation,
  calculationConfig,
  Currency,
  PaymentMethod,
} from "@/utils/functions/paymentFunction";

/**
 * Reglas de negocio vigentes (confirmadas como correctas). Si alguien cambia
 * un multiplicador en calculationConfig, estos tests tienen que fallar.
 */
const A = 100; // monto base en USD
const R = { dolarOficial: 1280, dolarBlue: 1310, conversionDolarEuro: 1.09 };
const O = R.dolarOficial;
const B = R.dolarBlue;
const E = R.conversionDolarEuro;
const r2 = (n: number) => parseFloat(n.toFixed(2));

const TAMARA = 1;
const MILAGROS = 2;
const OTRO = 7; // ej. un propietario: sin recargo
const cobradores = [undefined, TAMARA, MILAGROS, OTRO];
const appsNoAirbnb: (undefined | "booking" | "web")[] = [undefined, "booking", "web"];

type Regla = {
  medio: PaymentMethod;
  moneda: Currency;
  esperado: (cobrador: number | undefined) => number;
  descripcion: string;
};

const reglas: Regla[] = [
  { medio: "EFECTIVO", moneda: "ARS", esperado: () => A * O, descripcion: "× oficial" },
  { medio: "TARJETA", moneda: "ARS", esperado: () => A * O * 1.31, descripcion: "× oficial × 1.31" },
  {
    medio: "TRANSFERENCIA",
    moneda: "ARS",
    esperado: (c) => (c === TAMARA ? A * O * 1.21 : A * O),
    descripcion: "× oficial × 1.21 si cobra Tamara, si no × oficial",
  },
  { medio: "EFECTIVO", moneda: "USD", esperado: () => (A * O) / B, descripcion: "× oficial / blue" },
  { medio: "EFECTIVO", moneda: "EUR", esperado: () => (A * O) / B / E, descripcion: "× oficial / blue / 1.09" },
  { medio: "PAYPAL", moneda: "USD", esperado: () => ((A * O) / B) * 1.2, descripcion: "× oficial / blue × 1.2" },
  { medio: "WISE", moneda: "USD", esperado: () => ((A * O) / B) * 1.15, descripcion: "× oficial / blue × 1.15" },
  { medio: "WISE", moneda: "EUR", esperado: () => ((A * O) / B / E) * 1.15, descripcion: "× oficial / blue / 1.09 × 1.15" },
];

describe("calculateReservation: fórmulas por medio de pago y moneda", () => {
  for (const regla of reglas) {
    for (const cobrador of cobradores) {
      for (const app of appsNoAirbnb) {
        it(`${regla.medio} ${regla.moneda} | cobrador ${cobrador ?? "-"} | app ${app ?? "-"} → ${regla.descripcion}`, () => {
          expect(calculateReservation(regla.medio, regla.moneda, A, R, cobrador, app)).toBe(
            r2(regla.esperado(cobrador))
          );
        });
      }
    }
  }
});

describe("calculateReservation: Airbnb", () => {
  const todas: [PaymentMethod, Currency][] = [
    ["EFECTIVO", "ARS"], ["TARJETA", "ARS"], ["TRANSFERENCIA", "ARS"],
    ["EFECTIVO", "USD"], ["WISE", "EUR"], ["PAYPAL", "EUR"],
  ];
  it.each(todas)("%s %s devuelve el monto original, sin conversión", (medio, moneda) => {
    for (const cobrador of cobradores) {
      expect(calculateReservation(medio, moneda, 123.45, R, cobrador, "airbnb")).toBe(123.45);
    }
  });
});

describe("calculateReservation: combinaciones sin fórmula devuelven 0", () => {
  const sinConfig: [PaymentMethod, Currency][] = [
    ["PAYPAL", "ARS"], ["PAYPAL", "EUR"], ["TARJETA", "USD"], ["TARJETA", "EUR"],
    ["TRANSFERENCIA", "USD"], ["TRANSFERENCIA", "EUR"], ["WISE", "ARS"],
  ];
  it.each(sinConfig)("%s %s → 0", (medio, moneda) => {
    expect(calculateReservation(medio, moneda, A, R)).toBe(0);
  });
});

describe("calculateReservation: integridad de la configuración", () => {
  it("cada combinación medio/moneda configurada está cubierta por una regla de este test", () => {
    const combos = new Set(calculationConfig.map((c) => `${c.method}-${c.currency}`));
    const cubiertas = new Set(reglas.map((r) => `${r.medio}-${r.moneda}`));
    expect([...combos].sort()).toEqual([...cubiertas].sort());
  });

  it("redondea a 2 decimales", () => {
    const res = calculateReservation("EFECTIVO", "USD", 1, { dolarOficial: 1, dolarBlue: 3, conversionDolarEuro: 1 });
    expect(res).toBe(0.33);
  });

  it("monto 0 da 0", () => {
    expect(calculateReservation("TARJETA", "ARS", 0, R)).toBe(0);
  });
});
