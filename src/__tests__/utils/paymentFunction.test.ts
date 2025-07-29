import {
  calculateReservation,
  formatearADolar,
} from "@/utils/functions/paymentFunction";

interface ExchangeRates {
  dolarOficial: number;
  dolarBlue: number;
  conversionDolarEuro: number;
}

const mockRates: ExchangeRates = {
  dolarOficial: 1280,
  dolarBlue: 1310,
  conversionDolarEuro: 1.09,
};

describe("formatearADolar", () => {
  it("formatea con decimales si corresponde", () => {
    expect(formatearADolar(1234.56)).toBe("$1,234.56");
  });

  it("omite decimales si es entero", () => {
    expect(formatearADolar(1000)).toBe("$1,000");
  });
});

describe("calculateReservation", () => {
   it("Reserva por Booking, pagado con transferencia y en ARS a Tamara", () => {
    const result = calculateReservation("TRANSFERENCIA", "ARS", 100, mockRates, 1, "booking");
    expect(result).toBe((154_880));
  });

    it("EFECTIVO en ARS", () => {
    const result = calculateReservation("EFECTIVO", "ARS", 100, mockRates);
    expect(result).toBe(128000); // 100 * 1280
  });

  it("TARJETA en ARS", () => {
    const result = calculateReservation("TARJETA", "ARS", 100, mockRates);
    expect(result).toBe(167680); // 100 * 1280 * 1.31
  });

  it("TRANSFERENCIA en ARS con TAMARA", () => {
    const result = calculateReservation(
      "TRANSFERENCIA",
      "ARS",
      100,
      mockRates,
      1
    );
    expect(result).toBe(154880); // 100 * 1280 * 1.21
  });

  it("TRANSFERENCIA en ARS con MILAGROS", () => {
    const result = calculateReservation(
      "TRANSFERENCIA",
      "ARS",
      100,
      mockRates,
      2
    );
    expect(result).toBe(128000); // 100 * 1280
  });

  it("EFECTIVO en USD", () => {
    const result = calculateReservation("EFECTIVO", "USD", 100, mockRates);
    expect(result).toBeCloseTo((100 * 1280) / 1310, 2); // ≈ 97.71
  });

  it("EFECTIVO en EUR", () => {
    const result = calculateReservation("EFECTIVO", "EUR", 100, mockRates);
    expect(result).toBeCloseTo((100 * 1280) / 1310 / 1.09, 2); // ≈ 89.65
  });

  it("PAYPAL en USD", () => {
    const result = calculateReservation("PAYPAL", "USD", 100, mockRates);
    expect(result).toBeCloseTo(((100 * 1280) / 1310) * 1.2, 2); // ≈ 117.25
  });

  it("WISE en EUR", () => {
    const result = calculateReservation("WISE", "EUR", 100, mockRates);
    expect(result).toBeCloseTo(((100 * 1280) / 1310 / 1.09) * 1.15, 2); // ≈ 103.1
  });

  it("retorna 0 si no hay config coincidente", () => {
    const result = calculateReservation("PAYPAL", "EUR", 100, mockRates);
    expect(result).toBe(0);
  });
});
