export function formatearADolar(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2, // Sin decimales si el valor es entero
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
export type TWeb = "booking" | "web";

// Definimos una interfaz para los valores de cambio
interface ExchangeRates {
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
  web?: "booking" | "web"
): number {
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
