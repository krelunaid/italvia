export const EUR_PLN = 4.32;
export const RATE_DATE = "19.08.2026";

export function formatEur(n: number, compact = false, locale = "pl-PL") {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
  return compact ? formatted.replace(/\s/g, " ") : formatted;
}

export function formatPln(n: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function eurToPln(eur: number) {
  return Math.round(eur * EUR_PLN);
}
