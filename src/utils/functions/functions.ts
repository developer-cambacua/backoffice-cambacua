import { apps } from "@/constants/appsReserva";
import { ITotalReserva } from "@/types/paymentTypes";

export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

export const formatTimestamp = (timestamp: string | null) => {
  if (!timestamp) return "-";

  const date = new Date(timestamp);

  const formattedDate = date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formattedTime = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // return { date: formattedDate, time: formattedTime };
  return `${formattedDate} - ${formattedTime}`;
};

export const formatTimestampDay = (timestamp: string | null) => {
  if (!timestamp) return "-";

  const date = new Date(timestamp);

  const formattedDate = date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // return { date: formattedDate, time: formattedTime };
  return `${formattedDate}`;
};

export const ajustarFechaUTC = (
  fechaLocal: string | Date,
  offset: number
): string => {
  const fecha = new Date(fechaLocal);
  const utcFecha = new Date(fecha.getTime() - offset * 60 * 60 * 1000);
  return utcFecha.toISOString();
};

export const formatUserRole = (role: string) => {
  const roleMapping: { [key: string]: string } = {
    superAdmin: "Super admin",
    admin: "Admin",
    propietario: "Propietario",
    appOwner: "App owner",
    limpieza: "Limpieza",
    dev: "Dev",
  };

  return roleMapping[role] || "Desconocido";
};

export function stringToFloat(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function stringToInt(value: string): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

export const checkStatusReserva = (status: string, numeroReserva: string) => {
  if (status === "reservado") {
    return `/reservas/carga-2/${encodeURIComponent(numeroReserva)}`;
  } else if (status === "en_proceso") {
    return `/reservas/carga-3/${encodeURIComponent(numeroReserva)}`;
  } else {
    return "/reservas";
  }
};

export const getChangedFields = (original: any, updated: any) => {
  const changes: Record<string, any> = {};
  for (const key in updated) {
    if (updated[key] !== original[key]) {
      changes[key] = updated[key];
    }
  }
  return changes;
};

export const getAppReserva = (appValue: string): string => {
  const app = apps.find((app) => app.value === appValue);
  return app ? app.label : "No encontrado";
};

export const formatCurrencyToUsd = (value: number): string => {
  if (isNaN(value)) {
    return "Error, verificá los datos.";
  }
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
  return formatter.format(value);
};

export const formatCurrencyToArs = (value: number): string => {
  if (isNaN(value)) {
    return "Error, verificá los datos.";
  }
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
  return formatter.format(value);
};

export const formatCurrencyToEur = (value: number): string => {
  if (isNaN(value)) {
    return "Error, verificá los datos.";
  }
  const formatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
  return formatter.format(value);
};

export const calcularTotalReserva = ({
  reservaBase,
  extraCheck,
  extraHuesped,
  mediaEstadia,
  cochera,
}: ITotalReserva): number => {
  const toNumber = (value: string | undefined): number => {
    const validValue = value ?? "0";
    return Number(validValue) || 0;
  };
  const total =
    toNumber(reservaBase) +
    toNumber(extraCheck) +
    toNumber(extraHuesped) +
    toNumber(mediaEstadia) +
    toNumber(cochera);

  return total;
};

export const calculateDaysBetween = (
  startDate: string | undefined,
  endDate: string | undefined
) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays;
};

export const sanitizeData = (data: any) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ])
  );
};

export const renameFile = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
};

export function calculateTimeDifference(
  ingreso: string,
  egreso: string
): string {
  const [horaIngreso, minutoIngreso] = ingreso.split(":").map(Number);
  const [horaEgreso, minutoEgreso] = egreso.split(":").map(Number);

  if (
    isNaN(horaIngreso) ||
    isNaN(minutoIngreso) ||
    isNaN(horaEgreso) ||
    isNaN(minutoEgreso) ||
    horaIngreso < 0 ||
    horaIngreso > 23 ||
    minutoIngreso < 0 ||
    minutoIngreso > 59 ||
    horaEgreso < 0 ||
    horaEgreso > 23 ||
    minutoEgreso < 0 ||
    minutoEgreso > 59
  ) {
    throw new Error("Las horas y minutos ingresados no son válidos.");
  }

  const ahora = new Date();
  const fechaIngreso = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
    horaIngreso,
    minutoIngreso
  );
  let fechaEgreso = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
    horaEgreso,
    minutoEgreso
  );

  if (fechaEgreso < fechaIngreso) {
    fechaEgreso.setDate(fechaEgreso.getDate() + 1);
  }

  const diferenciaMs = fechaEgreso.getTime() - fechaIngreso.getTime();

  const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
  const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${horas}:${minutos.toString().padStart(2, "0")}`;
}

export const calcularCantidadReservas = (
  reservas: { fecha_ingreso: string }[]
) => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const conteoPorMes: Record<string, number> = {};

  reservas.forEach((reserva) => {
    const fecha = new Date(reserva.fecha_ingreso);
    const mes = meses[fecha.getUTCMonth()]; // Extrae el nombre del mes

    conteoPorMes[mes] = (conteoPorMes[mes] || 0) + 1;
  });

  return Object.entries(conteoPorMes).map(([mes, cantidad]) => ({
    mes,
    cantidad,
  }));
};

interface Reserva {
  id: number;
  fecha_ingreso: string;
}

export const calcularCambioPorcentual = (
  reservas: Reserva[]
): number | undefined => {
  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const anioActual = now.getFullYear();

  const mesAnterior = mesActual === 1 ? 12 : mesActual - 1;
  const anioAnterior = mesActual === 1 ? anioActual - 1 : anioActual;

  const reservasActuales = reservas.filter((reserva) => {
    const fecha = new Date(reserva.fecha_ingreso);
    return (
      fecha.getMonth() + 1 === mesActual && fecha.getFullYear() === anioActual
    );
  }).length;

  const reservasAnteriores = reservas.filter((reserva) => {
    const fecha = new Date(reserva.fecha_ingreso);
    return (
      fecha.getMonth() + 1 === mesAnterior &&
      fecha.getFullYear() === anioAnterior
    );
  }).length;

  if (reservasAnteriores === 0) return reservasActuales > 0 ? 100 : 0;

  return ((reservasActuales - reservasAnteriores) / reservasAnteriores) * 100;
};

export const calcularCambioPorcentualAnual = (
  reservas: Reserva[]
): number | undefined => {
  const now = new Date();
  const anioActual = now.getFullYear();
  const anioAnterior = anioActual - 1;

  const reservasActuales = reservas.filter((reserva) => {
    const fecha = new Date(reserva.fecha_ingreso);
    return fecha.getFullYear() === anioActual;
  }).length;

  const reservasAnteriores = reservas.filter((reserva) => {
    const fecha = new Date(reserva.fecha_ingreso);
    return fecha.getFullYear() === anioAnterior;
  }).length;

  if (reservasAnteriores === 0) return reservasActuales > 0 ? 100 : 0;

  return ((reservasActuales - reservasAnteriores) / reservasAnteriores) * 100;
};

interface IHeader {
  label: string;
  key: string;
}

export const transformData = <T>(data: T[], headers: IHeader[]) =>
  data.map((item) => {
    const flattenedItem: Record<string, string | number> = {};
    headers.forEach(({ key }) => {
      const value = key
        .split(".")
        .reduce((acc: any, part) => acc?.[part], item);
      flattenedItem[key] = value ?? "-"; // Asigna '-' si el valor es null o undefined
    });
    return flattenedItem;
  });

/* Esto es para sumar las horas de limpieza, después hay que reconvertir a formato hora de nuevo asi no queda, por ej: 2:85hs en vez de 3hs y pico*/
export const parseTiempoLimpieza = (tiempo: string): number => {
  if (!tiempo) return 0;
  const [h, m] = tiempo.split(":").map(Number);
  return h + m / 60;
};

export const decimalAHorasMinutos = (horasDecimales: number) => {
  const horas = Math.floor(horasDecimales);
  const minutos = Math.round((horasDecimales - horas) * 60);
  return `${horas}:${minutos.toString().padStart(2, "0")}`;
};

export const years = Array.from(
  { length: new Date().getFullYear() - 2024 + 1 },
  (_, i) => ({
    key: `${2024 + i}`,
    label: `${2024 + i}`,
    value: `${2024 + i}`,
  })
);

export const months = Array.from({ length: 12 }, (_, i) => {
  const monthName = new Intl.DateTimeFormat("es-AR", {
    month: "long",
  }).format(new Date(2000, i, 1));
  return {
    key: `${i + 1}`,
    label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    value: `${i + 1}`,
  };
});

export function generarNumeroReserva(): string {
  const random = crypto.getRandomValues(new Uint32Array(1))[0];
  return `R${random.toString().padStart(9, "0")}`;
}

export function normalizarHoraInput(value: string | null): string | null {
  if (!value) return null;
  const limpio = value.trim();

  if (!limpio) return null;

  if (limpio.includes(":")) {
    const [hhRaw, mmRaw = ""] = limpio.split(":");
    const hh = hhRaw.padStart(2, "0").slice(0, 2);
    const mm = mmRaw.padEnd(2, "0").slice(0, 2);
    return `${hh}:${mm}`;
  }

  const soloNumeros = limpio.replace(/\D/g, "");
  if (soloNumeros.length <= 2) return `${soloNumeros.padStart(2, "0")}:00`;

  const hh = soloNumeros.slice(0, 2).padStart(2, "0");
  const mm = soloNumeros.slice(2, 4).padEnd(2, "0");
  return `${hh}:${mm}`;
}

export function esHoraValida(value: string | null): boolean {
  if (!value) return false;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const [_, hh, mm] = match;
  const h = parseInt(hh, 10);
  const m = parseInt(mm, 10);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}
