import type { Property } from "@/data/properties";

export type CostLine = {
  key: string;
  labelPl: string;
  labelIt: string;
  min: number;
  max: number;
  yearly?: boolean;
};

export function estimatePurchase(p: Property) {
  const agency = Math.round(p.priceEur * 0.03 * 1.22);
  const taxesMin = Math.round(p.priceEur * 0.022);
  const taxesMax = Math.round(p.priceEur * 0.055);
  const notaryMin = 1700 + Math.round(p.priceEur * 0.009);
  const notaryMax = 2400 + Math.round(p.priceEur * 0.013);
  const translatorMin = 650;
  const translatorMax = 1200;
  const diligenceMin = 1400;
  const diligenceMax = 2600;
  const renoMin = p.renovationMin;
  const renoMax = p.renovationMax;
  const furnitureMin = p.furnished === "included" ? 350 : p.furnished === "partial" ? 1800 : 4500;
  const furnitureMax = p.furnished === "included" ? 800 : p.furnished === "partial" ? 5500 : 12000;
  const utilitiesMin = 380;
  const utilitiesMax = 720;

  const lines: CostLine[] = [
    { key: "price", labelPl: "Cena nieruchomości", labelIt: "Prezzo dell’immobile", min: p.priceEur, max: p.priceEur },
    { key: "agency", labelPl: "Prowizja agencji (3% + VAT)", labelIt: "Provvigione agenzia (3% + IVA)", min: agency, max: agency },
    { key: "tax", labelPl: "Szacunek podatków", labelIt: "Stima imposte", min: taxesMin, max: taxesMax },
    { key: "notary", labelPl: "Notariusz", labelIt: "Notaio", min: notaryMin, max: notaryMax },
    { key: "translate", labelPl: "Tłumaczenia i tłumacz", labelIt: "Traduzioni e interprete", min: translatorMin, max: translatorMax },
    { key: "check", labelPl: "Weryfikacja techniczna i prawna", labelIt: "Verifica tecnica e legale", min: diligenceMin, max: diligenceMax },
    { key: "reno", labelPl: "Ewentualny remont", labelIt: "Eventuale ristrutturazione", min: renoMin, max: renoMax },
    { key: "furnish", labelPl: "Urządzenie i uruchomienie", labelIt: "Arredo e attivazione utenze", min: furnitureMin + utilitiesMin, max: furnitureMax + utilitiesMax },
    { key: "condo", labelPl: "Wspólnota (rocznie)", labelIt: "Condominio (annuo)", min: p.condoAnnual, max: p.condoAnnual, yearly: true },
  ];

  const extraMin = agency + taxesMin + notaryMin + translatorMin + diligenceMin + renoMin + furnitureMin + utilitiesMin;
  const extraMax = agency + taxesMax + notaryMax + translatorMax + diligenceMax + renoMax + furnitureMax + utilitiesMax;

  return {
    lines,
    extraMin,
    extraMax,
    totalMin: p.priceEur + extraMin,
    totalMax: p.priceEur + extraMax,
    totalMid: p.priceEur + Math.round((extraMin + extraMax) / 2),
    yearly: p.condoAnnual + 900,
  };
}
