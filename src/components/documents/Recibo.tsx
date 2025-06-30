"use client";

import { jsPDF } from "jspdf";
import {
  formatCurrencyToArs,
  formatCurrencyToEur,
  formatCurrencyToUsd,
} from "@/utils/functions/functions";

interface PropsPDF {
  title: string;
  classNames?: string;
  numero_reserva?: any;
  valorReserva?: any;
  extraCheck?: any;
  extraHuesped?: any;
  mediaEstadia?: any;
  valorCochera?: any;
  medioDePago?: any;
  monedaDePago?: any;
  total?: any;
}

export function SummaryPDF({
  title,
  classNames,
  numero_reserva,
  valorReserva,
  extraCheck,
  extraHuesped,
  mediaEstadia,
  valorCochera,
  medioDePago,
  monedaDePago,
  total,
}: PropsPDF) {
  const formatters: Record<string, (value: number) => string> = {
    ARS: formatCurrencyToArs,
    USD: formatCurrencyToUsd,
    EUR: formatCurrencyToEur,
  };
  const formatter = formatters[monedaDePago];

  const totalReserva = formatter(total);

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 80;

    const imageUrl = `/cambacua.png`;
    doc.addImage(imageUrl, "PNG", 20, 20, 24, 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Resumen de la operación", 20, 50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Reserva N°: ${numero_reserva}`, 20, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Información de la reserva:", 20, 70);

    const fields = [
      { label: "Valor reserva", value: valorReserva, prefix: "$ " },
      { label: "Extra Check", value: extraCheck, prefix: "$ " },
      { label: "Extra Huesped", value: extraHuesped, prefix: "$ " },
      { label: "Media Estadia", value: mediaEstadia, prefix: "$ " },
      { label: "Valor Cochera", value: valorCochera, prefix: "$ " },
      {
        label: "Medio de pago",
        value: medioDePago,
        transform: (value: string) => value.toLowerCase(),
      },
      { label: "Moneda de pago", value: monedaDePago },
    ];
    fields.forEach((field) => {
      if (field.value || field.value === 0) {
        const valueWithPrefix = field.prefix
          ? `${field.prefix}${field.value}`
          : field.value;
        doc.text(`${field.label}: ${valueWithPrefix}`, 30, y);
        y += 10;
      }
    });

    doc.setFont("helvetica", "bold");
    if (total && total > 0) {
      doc.text(`Total a cobrar: ${totalReserva}`, 20, y);
    }

    doc.save(`resumen_operacion_${numero_reserva}.pdf`);
  };

  return (
    <button
      className={
        classNames ? classNames : "inline-flex text-secondary-900 hover:text-secondary-400"
      }
      onClick={generatePDF}>
      {title}
    </button>
  );
}
