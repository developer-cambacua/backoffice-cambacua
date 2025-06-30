export interface ITotalReserva {
  reservaBase: string;
  extraCheck: string;
  extraHuesped: string;
  mediaEstadia: string;
  cochera: string;
}

export type TReservaArgs = {
  montoCobrado: string | undefined;
  cantidadExtraHuespedes: string | undefined;
  valorHuespedAdicional: string | undefined;
  valorCochera: string | undefined;
  fichaLavadero: string | undefined;
  extraCheck: string | undefined;
  mediaEstadia: string | undefined;
};

export type TSubtotalDescuentosArgs = {
  subtotal: string | undefined;
  iva: string | undefined;
  impuestoMunicipal: string | undefined;
  comisionApp: string | undefined;
};
