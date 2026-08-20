import { useState } from "react";
import { Check } from "lucide-react";
import type { Offer } from "@/lib/server/offers";
import type { Property } from "@/data/properties";
import { CONDITIONS, DEPOSIT_KINDS, LEGAL } from "@/data/legal";
import { formatEur } from "@/lib/money";
import { cn } from "@/lib/utils";

type Draft = {
  askingEur: number;
  offerEur: number;
  depositEur: number;
  depositKind: "caparra" | "acconto" | "escrow";
  validUntil: string;
  deedBy: string;
  financing: "cash" | "mortgage";
  furniture: boolean;
  conditions: string[];
  notesPl?: string;
  mortgageEur?: number | null;
};

export function OfferRecap({
  property,
  draft,
  defaultLang = "pl",
}: {
  property: Property;
  draft: Draft;
  defaultLang?: "pl" | "it";
}) {
  const [lang, setLang] = useState<"pl" | "it">(defaultLang);
  const pl = lang === "pl";
  const dep = DEPOSIT_KINDS.find((d) => d.id === draft.depositKind)!;

  return (
    <article className="rounded-xl border border-line bg-paper p-5">
      <div className="flex gap-1 rounded-lg bg-ivory p-1">
        <button
          type="button"
          className={cn("flex-1 rounded-md py-2 text-sm", pl ? "bg-navy text-paper" : "text-muted")}
          onClick={() => setLang("pl")}
        >
          Polski
        </button>
        <button
          type="button"
          className={cn("flex-1 rounded-md py-2 text-sm", !pl ? "bg-navy text-paper" : "text-muted")}
          onClick={() => setLang("it")}
        >
          Italiano
        </button>
      </div>

      <p className="mt-4 text-xs tracking-[0.16em] text-faint uppercase">
        {pl ? "Oferta nieformalna · nie wiąże" : "Offerta informale · non vincola"}
      </p>
      <h2 className="mt-1 font-display text-2xl text-navy">{pl ? "Złóż ofertę" : "Fai un’offerta"}</h2>
      <p className="text-sm text-muted">
        {property.titlePl} · {property.city}
      </p>

      <dl className="mt-5 space-y-3">
        <Line k={pl ? "Cena ogłoszenia" : "Prezzo richiesto"} v={formatEur(draft.askingEur)} />
        <Line k={pl ? "Twoja oferta" : "La tua offerta"} v={formatEur(draft.offerEur)} big />
        <Line k={pl ? "Caparra proponowana" : "Caparra proposta"} v={formatEur(draft.depositEur)} />
        <Line k={pl ? "Kwalifikacja (po podpisie)" : "Qualificazione (dopo firma)"} v={pl ? dep.pl : dep.it} />
        <Line k={pl ? "Oferta ważna do" : "Offerta valida fino al"} v={draft.validUntil} />
        <Line k={pl ? "Rogito pożądany do" : "Rogito desiderato entro"} v={draft.deedBy} />
        <Line
          k={pl ? "Płatność ceny" : "Mezzi"}
          v={
            draft.financing === "mortgage"
              ? `${pl ? "Kredyt" : "Mutuo"}${draft.mortgageEur ? ` ${formatEur(draft.mortgageEur)}` : ""}`
              : pl
                ? "Środki własne"
                : "Denaro proprio"
          }
        />
      </dl>

      <p className="mt-5 text-xs tracking-[0.14em] text-faint uppercase">{pl ? "Warunki" : "Condizioni"}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-navy">
        {draft.conditions.map((id) => {
          const c = CONDITIONS.find((x) => x.id === id);
          return (
            <li key={id} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-sage" />
              {pl ? c?.pl : c?.it}
            </li>
          );
        })}
        {draft.furniture && !draft.conditions.includes("furniture") ? (
          <li className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-sage" />
            {pl ? "Arredamento z ogłoszenia w cenie" : "Arredamento dell’annuncio incluso"}
          </li>
        ) : null}
        {draft.conditions.length === 0 ? (
          <li className="text-danger">{pl ? "Brak warunków — wyższe ryzyko." : "Nessuna condizione — rischio più alto."}</li>
        ) : null}
      </ul>

      {draft.notesPl ? (
        <p className="mt-4 text-sm text-muted">
          {pl ? "Prośby" : "Richieste"}: {draft.notesPl}
        </p>
      ) : null}

      <p className="mt-5 rounded-md bg-ivory-deep px-3 py-2 text-sm text-navy">
        {pl
          ? "Płatność caparry: bonifico SEPA po przyjęciu przez sprzedającego."
          : "Pagamento della caparra: bonifico SEPA dopo l’accettazione."}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted">{pl ? LEGAL.caparraQualifyPl : LEGAL.caparraQualifyIt}</p>
      <p className="mt-2 text-xs text-faint">{pl ? LEGAL.informalBannerPl : LEGAL.informalBannerIt}</p>
    </article>
  );
}

export function draftFromOffer(offer: Offer): Draft {
  return {
    askingEur: offer.askingEur,
    offerEur: offer.offerEur,
    depositEur: offer.depositEur,
    depositKind: offer.depositKind,
    validUntil: offer.validUntil,
    deedBy: offer.deedBy ?? "",
    financing: offer.financing,
    furniture: offer.furniture,
    conditions: offer.conditions.split(",").filter(Boolean),
    notesPl: offer.notesPl ?? undefined,
    mortgageEur: offer.mortgageEur,
  };
}

function Line({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
      <dt className="text-xs text-faint">{k}</dt>
      <dd className={cn("text-right text-navy", big ? "font-display text-3xl tabular-nums" : "text-sm tabular-nums")}>{v}</dd>
    </div>
  );
}
