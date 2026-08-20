import type { Property } from "@/data/properties";
import { completedChecks } from "@/data/properties";
import { estimatePurchase } from "@/lib/costs";

export type BuyerProfile = {
  purpose?: string | null;
  budgetEur?: number | null;
  cashAvailableEur?: number | null;
  financing?: string | null;
  setting?: string | null;
  condition?: string | null;
  preferredAirport?: string | null;
  polishCity?: string | null;
  visitPeriods?: string | null;
  rentalInterest?: string | null;
  minRooms?: number | null;
  wantsTerrace?: boolean | null;
  seaMaxKm?: number | null;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function matchScore(profile: BuyerProfile | null | undefined, p: Property) {
  if (!profile) return 62;
  const parts: number[] = [];

  if (profile.purpose) {
    parts.push(p.bestFor.includes(profile.purpose as never) ? 96 : 48);
  }
  if (profile.budgetEur) {
    const mid = estimatePurchase(p).totalMid;
    if (mid <= profile.budgetEur) parts.push(98);
    else if (mid <= profile.budgetEur * 1.12) parts.push(78);
    else if (mid <= profile.budgetEur * 1.25) parts.push(52);
    else parts.push(28);
  }
  if (profile.setting) {
    parts.push(p.setting === profile.setting ? 97 : profile.setting === "sea" && p.seaKm !== null && p.seaKm <= 8 ? 70 : 40);
  }
  if (profile.condition) {
    if (profile.condition === "ready") parts.push(p.condition === "ready" ? 96 : p.condition === "light" ? 64 : 22);
    else parts.push(p.condition === "renovate" ? 90 : 72);
  }
  if (profile.seaMaxKm != null && profile.seaMaxKm > 0) {
    if (p.seaKm == null) parts.push(profile.setting === "sea" ? 20 : 70);
    else parts.push(p.seaKm <= profile.seaMaxKm ? 97 : p.seaKm <= profile.seaMaxKm * 1.6 ? 60 : 30);
  }
  if (profile.minRooms) {
    parts.push(p.rooms >= profile.minRooms ? 94 : 40);
  }
  if (profile.wantsTerrace) {
    parts.push(p.terrace ? 95 : 35);
  }
  if (profile.rentalInterest === "tourist") {
    parts.push(p.bestFor.includes("investment") ? 90 : 55);
  }
  if (profile.preferredAirport) {
    const code = profile.preferredAirport.toUpperCase();
    parts.push(p.airport.code === code || p.airport.minutes <= 60 ? 88 : 58);
  }

  if (parts.length === 0) return 62;
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  return clamp(avg);
}

export function remoteScore(p: Property) {
  let n = 55;
  if (p.condition === "ready") n += 18;
  else if (p.condition === "light") n += 6;
  else n -= 14;
  if (p.localManagement) n += 12;
  if (p.elevator || p.floor === "parter + 1" || p.floor === "1") n += 6;
  if (p.parking) n += 4;
  if (p.yearRoundServices) n += 6;
  if (p.airport.minutes <= 40) n += 6;
  else if (p.airport.minutes > 90) n -= 8;
  if (p.condoAnnual > 0 && p.condoAnnual < 1500) n += 3;
  if (!p.yearRoundServices) n -= 6;
  return clamp(n);
}

export function italviaScores(profile: BuyerProfile | null | undefined, p: Property) {
  return {
    match: matchScore(profile, p),
    documents: completedChecks(p),
    remote: remoteScore(p),
  };
}
