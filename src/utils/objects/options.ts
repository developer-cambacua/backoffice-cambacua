import { TMediosPago } from "@/types/select";

export const mediosPago: TMediosPago[] = [
  {
    label: "Efectivo (Pesos)",
    value: "efectivoPesos",
  },
  {
    label: "Efectivo (USD)",
    value: "efectivoUsd",
  },
  {
    label: "Efectivo (€)",
    value: "efectivoEuros",
  },
  {
    label: "Transferencia (Cuenta Tamara)",
    value: "transferenciaTami",
  },
  {
    label: "Transferencia (Cuenta Milagros)",
    value: "transferenciaMili",
  },
  {
    label: "Transferencia (otros)",
    value: "transferenciaOtros",
  },
  {
    label: "Tarjeta (Posnet)",
    value: "tarjetaPosnet",
  },
  {
    label: "Paypal (USD)",
    value: "paypalUsd",
  },
  {
    label: "Wise (USD)",
    value: "wiseUsd",
  },
  {
    label: "Wise (€)",
    value: "wiseEuros",
  },
];

export const appReservas = [
  { key: "TodosLosResultados", label: "Todos", value: "" },
  { key: "airbnb", label: "Airbnb", value: "airbnb" },
  { key: "booking", label: "Booking", value: "booking" },
  { key: "cambacua", label: "Cambacuá", value: "cambacua" },
  { key: "telefono", label: "Teléfono", value: "telefono" },
  { key: "otros", label: "Otros", value: "otros" },
];

export const estadoReservas = [
  { key: "todosLosEstados", label: "Todos", value: "" },
  { key: "reservado", label: "Reservado", value: "reservado" },
  { key: "enProceso", label: "En proceso", value: "en_proceso" },
  { key: "completado", label: "Completado", value: "completado" },
  { key: "cancelado", label: "Cancelado", value: "cancelado" },
];
