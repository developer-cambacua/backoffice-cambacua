interface Header {
  label: string;
  key: string;
}

export const headers: Header[] = [
  { label: "Departamento", key: "departamento.nombre" },
  { label: "Email", key: "huesped.email" },
  { label: "Nombre completo huésped ", key: "nombre_completo" },
  { label: "Nombre huésped ", key: "huesped.nombre" },
  { label: "Apellido huésped ", key: "huesped.apellido" },
  { label: "Teléfono huésped", key: "huesped.telefono" },
  { label: "Fecha de carga", key: "created_at" },
  { label: "Cantidad de Huéspedes", key: "cantidad_huespedes" },
  { label: "Fecha Ingreso", key: "fecha_ingreso" },
  { label: "Fecha Egreso", key: "fecha_egreso" },
  { label: "Número Reserva", key: "numero_reserva" },
  { label: "Aplicación de Reserva", key: "app_reserva" },
  { label: "Check In", key: "check_in" },
  { label: "Check Out", key: "check_out" },
  { label: "Valor Comisión App", key: "valor_comision_app" },
  { label: "Estado Reserva", key: "estado_reserva" },
  { label: "Valor Reserva", key: "valor_reserva" },
  { label: "IVA", key: "iva" },
  { label: "Impuesto Municipal", key: "impuesto_municipal" },
  { label: "Cantidad Huésped Adicional", key: "cantidad_huesped_adicional" },
  { label: "Valor Huésped Adicional", key: "valor_huesped_adicional" },
  { label: "Valor Cochera", key: "valor_cochera" },
  { label: "Fecha de Pago", key: "fecha_de_pago" },
  { label: "Quién Cobró", key: "quien_cobro" },
  { label: "Responsable Check In", key: "responsable_check_in" },
  { label: "Responsable Check Out", key: "responsable_check_out" },
  { label: "Valor Dólar Oficial", key: "valor_dolar_oficial" },
  { label: "Valor Dólar Blue", key: "valor_dolar_blue" },
  { label: "Medio de Pago", key: "medio_de_pago" },
  { label: "Moneda del Pago", key: "moneda_del_pago" },
  { label: "Extra Check", key: "extra_check" },
  { label: "Media Estadia", key: "media_estadia" },
  {
    label: "¿Hubo Check In Especial?",
    key: "check_in_especial",
  },
  { label: "Valor Viático", key: "valor_viatico" },
  {
    label: "¿Hubo Check Out Especial?",
    key: "check_out_especial",
  },
  { label: "Destino Viático", key: "destino_viatico" },
  { label: "Responsables de Limpieza", key: "detalle_limpieza" },
  { label: "Total a cobrar", key: `total_a_cobrar` },
];

export const formatearResponsablesParaCSV = (reservas: any[]) => {
  return reservas.map((reserva) => {
    const responsablesLimpieza = (reserva.responsables_limpieza || [])
      .map((r: any) => {
        const nombre = r.empleado?.nombre ?? "";
        const apellido = r.empleado?.apellido ?? "";
        const ingreso = r.hora_ingreso ?? "-";
        const egreso = r.hora_egreso ?? "-";
        const tiempo = r.tiempo_limpieza ?? "-";
        return `${nombre} ${apellido} (${ingreso}hs a ${egreso}hs, Total: ${tiempo}hs)`;
      })
      .join(" | ");

    return {
      ...reserva,
      nombre_completo: `${reserva.huesped?.nombre ?? ""} ${
        reserva.huesped?.apellido ?? ""
      }`,
      responsable_check_in: `${reserva.responsable_check_in?.nombre ?? ""} ${
        reserva.responsable_check_in?.apellido ?? ""
      }`,
      responsable_check_out: `${reserva.responsable_check_out?.nombre ?? ""} ${
        reserva.responsable_check_out?.apellido ?? ""
      }`,
      detalle_limpieza: responsablesLimpieza || "-",
    };
  });
};
