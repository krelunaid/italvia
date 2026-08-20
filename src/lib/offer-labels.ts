import type { Lang } from "@/lib/i18n";

export const STATUS_PL: Record<string, string> = {
  sent: "Wysłana, nie wiąże",
  countered: "Kontroferta właściciela",
  declined: "Odrzucona",
  withdrawn: "Wycofana",
  draft: "Szkic agenta",
  ready: "Do podpisu",
  signed: "Podpisana — 72 h na sprzedającego",
  accepted: "Przyjęta",
  refused: "Sprzedający odmówił",
  expired: "Wygasła (brak przyjęcia)",
  deposit_pending: "Czeka na caparrę",
  receipt_uploaded: "Bonifico zgłoszony",
  under_contract: "Sotto contratto",
};

export const STATUS_IT: Record<string, string> = {
  sent: "Inviata, non vincola",
  countered: "Controfferta del proprietario",
  declined: "Rifiutata",
  withdrawn: "Ritirata",
  draft: "Bozza agente",
  ready: "Da firmare",
  signed: "Firmata — 72 h al venditore",
  accepted: "Accettata",
  refused: "Il venditore ha rifiutato",
  expired: "Scaduta (nessuna accettazione)",
  deposit_pending: "In attesa della caparra",
  receipt_uploaded: "Bonifico segnalato",
  under_contract: "Sotto contratto",
};

export const KIND_PL = { informal: "Oferta nieformalna", official: "Proposta ufficiale" };
export const KIND_IT = { informal: "Offerta informale", official: "Proposta ufficiale" };

export const PAY_PL: Record<string, string> = {
  none: "Brak ruchu pieniędzy",
  instructed: "Dane do bonifico gotowe",
  receipt_uploaded: "Paragon zgłoszony",
  verified: "Wpływ potwierdzony",
};

export const PAY_IT: Record<string, string> = {
  none: "Nessun movimento di denaro",
  instructed: "Dati bonifico pronti",
  receipt_uploaded: "Ricevuta segnalata",
  verified: "Accredito confermato",
};

export const INSTALL_PL = {
  caparra: "Caparra confirmatoria",
  acconto2: "Drugi acconto",
  balance: "Saldo przy rogito",
} as const;

export const INSTALL_IT = {
  caparra: "Caparra confirmatoria",
  acconto2: "Secondo acconto",
  balance: "Saldo al rogito",
} as const;

export function statusLabel(status: string, lang: Lang) {
  return (lang === "it" ? STATUS_IT : STATUS_PL)[status] ?? status;
}

export function kindLabel(kind: "informal" | "official", lang: Lang) {
  return (lang === "it" ? KIND_IT : KIND_PL)[kind];
}
