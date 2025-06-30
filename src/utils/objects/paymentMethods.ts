import { TMediosPago } from "@/types/select";

export const payments: TMediosPago[] = [
  {
    label: "Efectivo",
    value: "EFECTIVO",
  },
  {
    label: "Transferencia",
    value: "TRANSFERENCIA",
  },
  {
    label: "Tarjeta (Posnet)",
    value: "TARJETA",
  },
  {
    label: "Paypal",
    value: "PAYPAL",
  },
  {
    label: "Wise",
    value: "WISE",
  },
];

export const currency: TMediosPago[] = [
  {
    label: "Pesos Argentinos",
    value: "ARS",
  },
  {
    label: "Dolar",
    value: "USD",
  },
  {
    label: "Euros",
    value: "EUR",
  },
];

export const collector: TMediosPago[] = [
  {
    label: "Tamara",
    value: "TAMARA",
  },
  {
    label: "Milagros",
    value: "MILAGROS",
  },
  {
    label: "Otros",
    value: "OTROS",
  },
];
