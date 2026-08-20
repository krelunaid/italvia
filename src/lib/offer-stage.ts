import type { Offer } from "@/lib/server/offers";
import type { Lang } from "@/lib/i18n";

export const CLOSED = new Set(["withdrawn", "declined", "refused", "expired"]);

export function isOpenStatus(status: string) {
  return !CLOSED.has(status);
}

export function pickLiveOffer(offers: Offer[], propertyId: string) {
  const mine = offers.filter((o) => o.propertyId === propertyId);
  return mine.find((o) => isOpenStatus(o.status)) ?? mine[0] ?? null;
}

/** 1 informal price · 2 binding document · 3 money */
export function planeOf(offer: Offer | null): 1 | 2 | 3 {
  if (!offer || CLOSED.has(offer.status)) return 1;
  if (["deposit_pending", "accepted", "receipt_uploaded", "under_contract"].includes(offer.status)) return 3;
  if (offer.kind === "official" || offer.officialRequested) return 2;
  return 1;
}

export function hoursLeft(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(ms / 36e5));
}

export function remainingBalance(offer: Offer) {
  return Math.max(0, offer.offerEur - offer.depositEur - (offer.secondAccontoEur ?? 0));
}

export function registerTaxEur(amount: number) {
  return Math.round(amount * 0.005);
}

const STICKY: Record<string, { pl: string; it: string }> = {
  none: { pl: "Złóż ofertę", it: "Fai un’offerta" },
  sent: { pl: "Oferta wysłana", it: "Offerta inviata" },
  countered: { pl: "Oferta wysłana", it: "Offerta inviata" },
  ready: { pl: "Podpisz dokument", it: "Firma il documento" },
  signed: { pl: "Czeka sprzedający", it: "Attesa venditore" },
  deposit_pending: { pl: "Wpłać caparrę", it: "Versa la caparra" },
  accepted: { pl: "Wpłać caparrę", it: "Versa la caparra" },
  receipt_uploaded: { pl: "Bonifico zgłoszony", it: "Bonifico segnalato" },
  under_contract: { pl: "Sotto contratto", it: "Sotto contratto" },
  trattativa: { pl: "Trattativa", it: "Trattativa" },
};

export function stickyLabel(offer: Offer | null, lang: Lang = "pl"): string {
  if (!offer || CLOSED.has(offer.status)) return STICKY.none[lang];
  const row = STICKY[offer.status] ?? STICKY.trattativa;
  return row[lang];
}
