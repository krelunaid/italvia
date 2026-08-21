import { PROPERTIES, type Property } from "@/data/properties";

export type ValuationStance = "below" | "inline" | "above";

export type ValuationReason = { pl: string; it: string; pct: number };

export type Valuation = {
  propertyId: string;
  asking: number;
  sqm: number;
  eurPerSqm: number;
  low: number;
  mid: number;
  high: number;
  deltaEur: number;
  deltaPct: number;
  stance: ValuationStance;
  compsCount: number;
  reasons: ValuationReason[];
};

const REGION_SQM: Record<string, number> = {
  Calabria: 1580,
  Puglia: 1880,
  Sicilia: 1680,
  Liguria: 2850,
  Toscana: 3050,
  Lombardia: 3550,
  Abruzzo: 1420,
};

function roundEur(n: number) {
  return Math.round(n / 500) * 500;
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

function energyAdj(cls: string): ValuationReason | null {
  const c = cls.trim().toUpperCase();
  if (c === "A" || c === "A4" || c === "A3") return { pct: 5, pl: "Klasa energetyczna wysoka", it: "Classe energetica alta" };
  if (c === "B") return { pct: 3, pl: "Klasa energetyczna B", it: "Classe energetica B" };
  if (c === "F" || c === "G") return { pct: -5, pl: `Klasa energetyczna ${c}`, it: `Classe energetica ${c}` };
  return null;
}

export function valueProperty(p: Property): Valuation {
  const peers = PROPERTIES.filter((x) => x.id !== p.id && x.region === p.region);
  const peerSqm = peers.map((x) => x.priceEur / x.sqm);
  const baseSqm = peerSqm.length >= 1 ? median(peerSqm) : (REGION_SQM[p.region] ?? 1700);

  const reasons: ValuationReason[] = [];
  if (p.setting === "sea" && p.seaKm != null) {
    if (p.seaKm <= 0.5) reasons.push({ pct: 11, pl: "Morze w zasięgu spaceru", it: "Mare a piedi" });
    else if (p.seaKm <= 2) reasons.push({ pct: 6, pl: "Blisko morza", it: "Vicino al mare" });
    else if (p.seaKm > 8) reasons.push({ pct: -4, pl: "Dalej od morza", it: "Più lontano dal mare" });
  }
  if (p.terrace) reasons.push({ pct: 5, pl: "Taras", it: "Terrazzo" });
  if (p.garden) reasons.push({ pct: 4, pl: "Ogród", it: "Giardino" });
  if (p.parking) reasons.push({ pct: 3, pl: "Parking", it: "Parcheggio" });
  if (p.condition === "light") reasons.push({ pct: -8, pl: "Lekki remont", it: "Lavori leggeri" });
  if (p.condition === "renovate") reasons.push({ pct: -16, pl: "Do remontu", it: "Da ristrutturare" });
  if (p.condition === "ready") reasons.push({ pct: 3, pl: "Gotowe do zamieszkania", it: "Abitabile subito" });
  if (!p.elevator && p.floor !== "1" && p.floor !== "parter" && p.floor !== "terra") {
    reasons.push({ pct: -3, pl: "Bez windy", it: "Senza ascensore" });
  }
  if (p.yearRoundServices) reasons.push({ pct: 3, pl: "Usługi zimą", it: "Servizi d’inverno" });
  else reasons.push({ pct: -6, pl: "Miasto sezonowe", it: "Paese stagionale" });
  const energy = energyAdj(p.energyClass);
  if (energy) reasons.push(energy);
  if (p.localManagement) reasons.push({ pct: 2, pl: "Zarządzanie na miejscu", it: "Gestione in loco" });

  const factor = reasons.reduce((acc, r) => acc * (1 + r.pct / 100), 1);
  const eurPerSqm = Math.round(baseSqm * factor);
  const mid = roundEur(eurPerSqm * p.sqm);
  const spread = peerSqm.length >= 3 ? 0.08 : 0.11;
  const low = roundEur(mid * (1 - spread));
  const high = roundEur(mid * (1 + spread));
  const deltaEur = p.priceEur - mid;
  const deltaPct = mid ? Math.round((deltaEur / mid) * 100) : 0;
  const stance: ValuationStance =
    p.priceEur < low ? "below" : p.priceEur > high ? "above" : "inline";

  return {
    propertyId: p.id,
    asking: p.priceEur,
    sqm: p.sqm,
    eurPerSqm,
    low,
    mid,
    high,
    deltaEur,
    deltaPct,
    stance,
    compsCount: peerSqm.length,
    reasons,
  };
}
