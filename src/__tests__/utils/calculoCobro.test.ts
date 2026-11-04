import { describe, it, expect } from "vitest";
import {
  calcularDetalleCobro,
  calculateReservation,
  CONVERSION_DOLAR_EURO,
  Currency,
  PaymentMethod,
} from "@/utils/functions/paymentFunction";
import {
  calcularTotalReserva,
  calculateDaysBetween,
} from "@/utils/functions/functions";

/* Fechas como quedan guardadas (ajustadas -3 h): 3 noches */
const INGRESO = "2026-01-10T03:00:00.000Z";
const EGRESO = "2026-01-13T03:00:00.000Z";

/**
 * Copia LITERAL del cálculo que hacía CargaDos.tsx antes de unificarlo
 * (amount + rates + calculateReservation). Sirve para garantizar que
 * calcularDetalleCobro no cambió ningún resultado.
 */
function calculoOriginalCargaDos(
  reserva: { valor_reserva: number; fecha_ingreso: string; fecha_egreso: string; app_reserva: string },
  formData: Record<string, any>,
  medioDePago: PaymentMethod,
  monedaDelPago: Currency,
  selectedCollector: number | undefined
) {
  const calcularNochesReservas = calculateDaysBetween(
    reserva?.fecha_ingreso,
    reserva?.fecha_egreso
  );
  const amount = calcularTotalReserva({
    reservaBase: reserva?.valor_reserva.toString() || "0",
    extraCheck: formData?.extra_check || "0",
    mediaEstadia: formData?.media_estadia || "0",
    extraHuesped: (
      Number(formData?.valor_huesped_adicional) *
      Number(formData?.cantidad_huesped_adicional)
    ).toString(),
    cochera: (Number(formData.valor_cochera) * calcularNochesReservas).toString(),
  });
  const rates = {
    dolarOficial: formData.valor_dolar_oficial
      ? parseFloat(formData.valor_dolar_oficial)
      : 0,
    dolarBlue: formData.valor_dolar_blue ? parseFloat(formData.valor_dolar_blue) : 0,
    conversionDolarEuro: 1.09,
  };
  const app = reserva.app_reserva ? reserva.app_reserva : undefined;
  return calculateReservation(
    medioDePago,
    monedaDelPago,
    amount,
    rates,
    selectedCollector,
    app as any
  );
}

const combinacionesPago: [PaymentMethod, Currency][] = [
  ["EFECTIVO", "ARS"], ["EFECTIVO", "USD"], ["EFECTIVO", "EUR"],
  ["TARJETA", "ARS"], ["TRANSFERENCIA", "ARS"],
  ["PAYPAL", "USD"], ["WISE", "USD"], ["WISE", "EUR"],
  ["PAYPAL", "EUR"], ["TRANSFERENCIA", "USD"], // sin config → 0
];
const cobradores = [undefined, 1, 2, 7];
const apps = ["airbnb", "booking", "cambacua", "telefono", "otros"];

/* Formularios coherentes con la UI: con "no" los valores quedan vacíos/0 */
const formularios: Record<string, Record<string, any>> = {
  "sin extras": {
    adicional_huesped: "no", cantidad_huesped_adicional: 0, valor_huesped_adicional: "",
    solicitud_cochera: "no", valor_cochera: "", extra_check: "", media_estadia: "",
  },
  "con todos los extras": {
    adicional_huesped: "si", cantidad_huesped_adicional: 2, valor_huesped_adicional: "25",
    solicitud_cochera: "si", valor_cochera: "10.5", extra_check: "15", media_estadia: "30.25",
  },
  "campos sin tocar (undefined)": {},
  "valores no numéricos": {
    adicional_huesped: "si", cantidad_huesped_adicional: 1, valor_huesped_adicional: "abc",
    solicitud_cochera: "si", valor_cochera: "x", extra_check: "", media_estadia: "",
  },
};

describe("calcularDetalleCobro: mismo resultado que el cálculo original de CargaDos", () => {
  for (const [nombreForm, form] of Object.entries(formularios)) {
    for (const [medio, moneda] of combinacionesPago) {
      for (const cobrador of cobradores) {
        for (const app of apps) {
          it(`${nombreForm} | ${medio} ${moneda} | cobrador ${cobrador} | ${app}`, () => {
            const reserva = { valor_reserva: 120, fecha_ingreso: INGRESO, fecha_egreso: EGRESO, app_reserva: app };
            const formData: Record<string, any> = { ...form, valor_dolar_oficial: "1280", valor_dolar_blue: "1310" };

            const esperado = calculoOriginalCargaDos(reserva, formData, medio, moneda, cobrador);
            const { total } = calcularDetalleCobro({
              valorReserva: reserva.valor_reserva,
              extraCheck: formData.extra_check,
              mediaEstadia: formData.media_estadia,
              adicionalHuesped: formData.adicional_huesped,
              cantidadHuespedAdicional: formData.cantidad_huesped_adicional,
              valorHuespedAdicional: formData.valor_huesped_adicional,
              solicitudCochera: formData.solicitud_cochera,
              valorCochera: formData.valor_cochera,
              fechaIngreso: reserva.fecha_ingreso,
              fechaEgreso: reserva.fecha_egreso,
              medioDePago: medio,
              monedaDelPago: moneda,
              dolarOficial: formData.valor_dolar_oficial,
              dolarBlue: formData.valor_dolar_blue,
              quienCobro: cobrador,
              appReserva: app,
            });

            expect(total).toBe(esperado);
          });
        }
      }
    }
  }
});

describe("calcularDetalleCobro: desglose", () => {
  const base = {
    valorReserva: 100,
    fechaIngreso: INGRESO,
    fechaEgreso: EGRESO,
    medioDePago: "EFECTIVO" as PaymentMethod,
    monedaDelPago: "ARS" as Currency,
    dolarOficial: "1000",
    dolarBlue: "1200",
  };

  it("calcula noches, extras y monto base en USD", () => {
    const d = calcularDetalleCobro({
      ...base,
      extraCheck: "15",
      mediaEstadia: "5",
      adicionalHuesped: "si",
      cantidadHuespedAdicional: 2,
      valorHuespedAdicional: "25",
      solicitudCochera: "si",
      valorCochera: "10",
    });
    expect(d.noches).toBe(3);
    expect(d.extraHuesped).toBe(50); // 25 × 2
    expect(d.cocheraTotal).toBe(30); // 10 × 3 noches
    expect(d.montoBase).toBe(200); // 100 + 15 + 5 + 50 + 30
    expect(d.total).toBe(200_000); // EFECTIVO ARS: × oficial
  });

  it('con "no" el huésped adicional y la cochera no suman aunque haya valores', () => {
    const d = calcularDetalleCobro({
      ...base,
      adicionalHuesped: "no",
      cantidadHuespedAdicional: 3,
      valorHuespedAdicional: "40",
      solicitudCochera: "no",
      valorCochera: "20",
    });
    expect(d.extraHuesped).toBe(0);
    expect(d.cocheraTotal).toBe(0);
    expect(d.montoBase).toBe(100);
  });

  it("Airbnb devuelve el monto base sin conversión", () => {
    const d = calcularDetalleCobro({ ...base, appReserva: "airbnb", monedaDelPago: "ARS" });
    expect(d.total).toBe(100);
  });

  it("sin cotización del dólar el total en ARS es 0", () => {
    const d = calcularDetalleCobro({ ...base, dolarOficial: "", dolarBlue: "" });
    expect(d.total).toBe(0);
  });

  it("IVA, impuesto municipal y comisión NO forman parte del total (regla vigente)", () => {
    // La función ni siquiera los recibe: si algún día deben sumar, este test lo recuerda.
    const d = calcularDetalleCobro({ ...base, appReserva: "booking" });
    expect(d.montoBase).toBe(100);
  });

  it("usa 1.09 como conversión dólar → euro", () => {
    expect(CONVERSION_DOLAR_EURO).toBe(1.09);
    const d = calcularDetalleCobro({ ...base, monedaDelPago: "EUR" });
    expect(d.total).toBe(parseFloat(((100 * 1000) / 1200 / 1.09).toFixed(2)));
  });
});
