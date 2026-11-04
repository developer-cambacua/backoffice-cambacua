import { calcularTotalReserva, calculateDaysBetween } from "./functions";

export function formatearADolar(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}

export type PaymentMethod =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "PAYPAL"
  | "WISE";
export type Currency = "ARS" | "USD" | "EUR";
export type Collector = "TAMARA" | "MILAGROS" | "PROPIETARIO";
export type TWeb = "airbnb" | "booking" | "web";

export interface ExchangeRates {
  dolarOficial: number;
  dolarBlue: number;
  conversionDolarEuro: number;
}

interface CalculationConfig {
  method: PaymentMethod;
  currency: Currency;
  collector: Collector | undefined;
  web: TWeb | undefined;
  formula: (amount: number, rates: ExchangeRates) => number;
}

export const calculationConfig: CalculationConfig[] = [
  // EFECTIVO en ARS
  {
    method: "EFECTIVO",
    currency: "ARS",
    collector: undefined,
    web: undefined, // No aplica
    formula: (amount, rates) => amount * rates.dolarOficial,
  },

  // POSNET TARJETA en ARS
  {
    method: "TARJETA",
    currency: "ARS",
    collector: undefined,
    web: undefined, // No aplica
    formula: (amount, rates) => amount * rates.dolarOficial * 1.31,
  },

  // TRANSFERENCIA en ARS
  {
    method: "TRANSFERENCIA",
    currency: "ARS",
    collector: "TAMARA",
    web: undefined,
    formula: (amount, rates) => amount * rates.dolarOficial * 1.21,
  },
  {
    method: "TRANSFERENCIA",
    currency: "ARS",
    collector: "TAMARA",
    web: "booking",
    formula: (amount, rates) => amount * rates.dolarOficial * 1.21,
  },
  {
    method: "TRANSFERENCIA",
    currency: "ARS",
    collector: "MILAGROS",
    web: undefined,
    formula: (amount, rates) => amount * rates.dolarOficial,
  },
  {
    method: "TRANSFERENCIA",
    currency: "ARS",
    collector: undefined,
    web: undefined,
    formula: (amount, rates) => amount * rates.dolarOficial,
  },

  // EFECTIVO en USD
  {
    method: "EFECTIVO",
    currency: "USD",
    collector: undefined,
    web: undefined,
    formula: (amount, rates) => (amount * rates.dolarOficial) / rates.dolarBlue,
  },
  // EFECTIVO en EUR
  {
    method: "EFECTIVO",
    currency: "EUR",
    collector: undefined,
    web: undefined,
    formula: (amount, rates) =>
      (amount * rates.dolarOficial) /
      rates.dolarBlue /
      rates.conversionDolarEuro,
  },
  // PAYPAL en USD
  {
    method: "PAYPAL",
    currency: "USD",
    collector: undefined,
    web: undefined,
    formula: (amount, rates) =>
      ((amount * rates.dolarOficial) / rates.dolarBlue) * 1.2,
  },

  // WISE en USD
  {
    method: "WISE",
    currency: "USD",
    collector: undefined,
    web: undefined,
    formula: (amount, rates) =>
      ((amount * rates.dolarOficial) / rates.dolarBlue) * 1.15,
  },

  {
    method: "WISE",
    currency: "EUR",
    collector: undefined,
    web: undefined,
    formula: (amount, rates) =>
      ((amount * rates.dolarOficial) /
        rates.dolarBlue /
        rates.conversionDolarEuro) *
      1.15,
  },
];

const collectorMap: Record<number, Collector> = {
  1: "TAMARA",
  2: "MILAGROS",
};

function resolveCollector(collectorId?: number): Collector | undefined {
  if (collectorId === undefined || !(collectorId in collectorMap)) {
    return undefined;
  }
  return collectorMap[collectorId];
}

export function calculateReservation(
  method: PaymentMethod,
  currency: Currency,
  amount: number,
  rates: ExchangeRates,
  collectorId?: number,
  web?: "booking" | "web" | "airbnb"
): number {
  if (web === "airbnb") return amount;
  const config = calculationConfig.find((conf) => {
    const collector = resolveCollector(collectorId);
    return (
      conf.method === method &&
      conf.currency === currency &&
      (conf.collector === collector || conf.collector === undefined) &&
      (conf.web === web || conf.web === undefined)
    );
  });

  if (!config) {
    return 0;
  }

  const result = config.formula(amount, rates);
  return parseFloat(result.toFixed(2));
}

/* ------------------------------------------------------------------------- */
/*  Cálculo completo del cobro (única fuente de verdad: carga 2, resumen y     */
/*  recibo usan esta función).                                                 */
/* ------------------------------------------------------------------------- */

/** Tipo de cambio dólar → euro usado en las fórmulas con EUR. */
export const CONVERSION_DOLAR_EURO = 1.09;

type ValorNumerico = string | number | null | undefined;

export interface DetalleCobroInput {
  /** Valor de la reserva (USD), cargado en la etapa 1. */
  valorReserva: ValorNumerico;
  extraCheck?: ValorNumerico;
  mediaEstadia?: ValorNumerico;
  /** "si" | "no". Con "no" el huésped adicional no suma. */
  adicionalHuesped?: string;
  cantidadHuespedAdicional?: ValorNumerico;
  valorHuespedAdicional?: ValorNumerico;
  /** "si" | "no". Con "no" la cochera no suma. */
  solicitudCochera?: string;
  /** Valor de la cochera POR NOCHE. */
  valorCochera?: ValorNumerico;
  fechaIngreso?: string;
  fechaEgreso?: string;
  medioDePago: PaymentMethod;
  monedaDelPago: Currency;
  dolarOficial?: ValorNumerico;
  dolarBlue?: ValorNumerico;
  /** id del usuario que cobró (1 = TAMARA, 2 = MILAGROS, otros = sin recargo). */
  quienCobro?: number;
  appReserva?: string;
}

export interface DetalleCobro {
  noches: number;
  /** valor huésped adicional × cantidad */
  extraHuesped: number;
  /** valor cochera por noche × noches */
  cocheraTotal: number;
  /** Suma en USD antes de aplicar medio de pago / moneda */
  montoBase: number;
  /** Total a cobrar en la moneda del pago */
  total: number;
}

/* Vacío, null, undefined o no numérico → 0 (mismo criterio que tenía CargaDos) */
const aNumero = (valor: ValorNumerico): number => {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
};

const aTasa = (valor: ValorNumerico): number =>
  valor === "" || valor === null || valor === undefined
    ? 0
    : parseFloat(String(valor));

export function calcularDetalleCobro(input: DetalleCobroInput): DetalleCobro {
  const noches = calculateDaysBetween(input.fechaIngreso, input.fechaEgreso);

  const extraHuesped =
    input.adicionalHuesped === "no"
      ? 0
      : aNumero(input.valorHuespedAdicional) *
        aNumero(input.cantidadHuespedAdicional);

  const cocheraTotal =
    input.solicitudCochera === "no" ? 0 : aNumero(input.valorCochera) * noches;

  const montoBase = calcularTotalReserva({
    reservaBase: String(aNumero(input.valorReserva)),
    extraCheck: String(aNumero(input.extraCheck)),
    mediaEstadia: String(aNumero(input.mediaEstadia)),
    extraHuesped: String(extraHuesped),
    cochera: String(cocheraTotal),
  });

  const rates: ExchangeRates = {
    dolarOficial: aTasa(input.dolarOficial),
    dolarBlue: aTasa(input.dolarBlue),
    conversionDolarEuro: CONVERSION_DOLAR_EURO,
  };

  const total = calculateReservation(
    input.medioDePago,
    input.monedaDelPago,
    montoBase,
    rates,
    input.quienCobro,
    input.appReserva as TWeb | undefined
  );

  return { noches, extraHuesped, cocheraTotal, montoBase, total };
}
