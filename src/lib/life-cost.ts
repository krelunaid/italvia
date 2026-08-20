import type { Property } from "@/data/properties";
import { LIFE_COST, type LifeCostInput } from "@/data/life";

export function estimateLifeFromPoland(p: Property, input?: LifeCostInput) {
  const d = input ?? LIFE_COST[p.id];
  if (!d) {
    return {
      monthMin: 0,
      monthMax: 0,
      yearMin: 0,
      yearMax: 0,
      yearMid: 0,
      lines: [] as { key: string; labelPl: string; labelIt: string; year: number }[],
      visitsPerYear: 0,
      emptyMonths: 0,
      flightRoundEur: 0,
    };
  }

  const utilities = d.utilitiesMonth * 12;
  const heating = d.heatingWinterMonth * d.winterMonths;
  const caretaker = d.caretakerMonth * 12;
  const flights = d.flightRoundEur * d.visitsPerYear;
  const internet = d.internetMonth * 12;
  const condo = p.condoAnnual;

  const lines = [
    { key: "util", labelPl: "Media i prąd", labelIt: "Utenze", year: utilities },
    { key: "heat", labelPl: "Ogrzewanie zimą", labelIt: "Riscaldamento invernale", year: heating },
    { key: "net", labelPl: "Internet", labelIt: "Internet", year: internet },
    { key: "condo", labelPl: "Wspólnota", labelIt: "Condominio", year: condo },
    { key: "care", labelPl: "Opiekun w nieobecności", labelIt: "Custode in assenza", year: caretaker },
    {
      key: "fly",
      labelPl: `Loty z Polski × ${d.visitsPerYear}`,
      labelIt: `Voli dalla Polonia × ${d.visitsPerYear}`,
      year: flights,
    },
  ];

  const year = lines.reduce((s, l) => s + l.year, 0);
  const yearMin = Math.round(year * 0.9);
  const yearMax = Math.round(year * 1.15);

  return {
    monthMin: Math.round(yearMin / 12),
    monthMax: Math.round(yearMax / 12),
    yearMin,
    yearMax,
    yearMid: year,
    lines,
    visitsPerYear: d.visitsPerYear,
    emptyMonths: d.emptyMonths,
    flightRoundEur: d.flightRoundEur,
  };
}
