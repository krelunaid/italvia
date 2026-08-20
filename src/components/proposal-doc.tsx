import type { Offer } from "@/lib/server/offers";
import type { Property } from "@/data/properties";
import { CONDITIONS, DEPOSIT_KINDS, LEGAL } from "@/data/legal";
import { counterparty } from "@/data/sellers";
import { formatEur } from "@/lib/money";
import { remainingBalance } from "@/lib/offer-stage";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProposalDoc({ offer, property, buyerName }: { offer: Offer; property: Property; buyerName: string }) {
  const [lang, setLang] = useState<"pl" | "it">("pl");
  const c = counterparty(property.id);
  const dep = DEPOSIT_KINDS.find((d) => d.id === offer.depositKind)!;
  const conds = offer.conditions.split(",").filter(Boolean);
  const pl = lang === "pl";
  const saldo = remainingBalance(offer);

  return (
    <article className="rounded-xl border border-line bg-paper p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <svg viewBox="0 0 72 72" className="size-14 shrink-0" aria-hidden>
          <circle cx="36" cy="36" r="34" fill="#1C2C4A" />
          <circle cx="36" cy="36" r="28" fill="none" stroke="#C45C3E" strokeWidth="2" />
          <text x="36" y="32" textAnchor="middle" fill="#FBF8F1" fontFamily="Georgia, serif" fontSize="10">
            ITALVIA
          </text>
          <text x="36" y="46" textAnchor="middle" fill="#D9C4A8" fontFamily="Georgia, serif" fontSize="8">
            PROPOSTA
          </text>
        </svg>
        <div className="flex flex-1 gap-1 rounded-lg bg-ivory p-1">
          <button
            type="button"
            className={cn("flex-1 rounded-md py-2 text-sm", pl ? "bg-navy text-paper" : "text-muted")}
            onClick={() => setLang("pl")}
          >
            Polski — zrozumienie
          </button>
          <button
            type="button"
            className={cn("flex-1 rounded-md py-2 text-sm", !pl ? "bg-navy text-paper" : "text-muted")}
            onClick={() => setLang("it")}
          >
            Italiano — valore
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-danger">{pl ? LEGAL.officialBannerPl : LEGAL.officialBannerIt}</p>
      <h2 className="mt-4 font-display text-2xl text-navy">
        {pl ? "Propozycja nabycia nieruchomości" : "Proposta di acquisto immobiliare"}
      </h2>
      <p className="text-xs text-faint">ITALVIA-{offer.id.slice(0, 8).toUpperCase()}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <Row k={pl ? "Kupujący" : "Promissario acquirente"} v={buyerName} />
        <Row k={pl ? "Sprzedający" : "Promittente venditore"} v={c.seller} />
        <Row
          k={pl ? "Nieruchomość" : "Immobile"}
          v={`${property.titleIt} — ${property.city}, ${property.region}, ${property.sqm} m², cat. ${property.cadastralCategory}`}
        />
        <Row k={pl ? "Cena żądana" : "Prezzo richiesto"} v={formatEur(offer.askingEur)} />
        <Row k={pl ? "Cena oferty" : "Prezzo proposto"} v={formatEur(offer.offerEur)} />
        <Row k={pl ? "Kwalifikacja wpłaty" : "Qualificazione della somma"} v={pl ? dep.pl : dep.it} />
        <Row k={pl ? "Kwota caparry / depozytu" : "Importo"} v={formatEur(offer.depositEur)} />
        {offer.secondAccontoEur ? (
          <Row k={pl ? "Drugi acconto (preliminare)" : "Secondo acconto"} v={formatEur(offer.secondAccontoEur)} />
        ) : null}
        <Row k={pl ? "Saldo przy rogito" : "Saldo al rogito"} v={formatEur(saldo)} />
        <Row k={pl ? "Oferta ważna do" : "Validità"} v={offer.validUntil} />
        <Row k={pl ? "Rogito do" : "Rogito entro"} v={offer.deedBy ?? "—"} />
        <Row
          k={pl ? "Płatność ceny" : "Pagamento"}
          v={
            offer.financing === "mortgage"
              ? `${pl ? "Częściowo kredyt" : "In parte mutuo"}${offer.mortgageEur ? ` ${formatEur(offer.mortgageEur)}` : ""}`
              : pl
                ? "Środki własne"
                : "Mezzi propri"
          }
        />
        <Row k={pl ? "Prowizja agencji" : "Provvigione"} v="3% + IVA, deklarowana, poza tą sumą" />
        <Row
          k={pl ? "Sposób zapłaty caparry" : "Modalità caparra"}
          v={pl ? "Bonifico SEPA na konto notariusza, po przyjęciu" : "Bonifico SEPA sul conto del notaio, dopo accettazione"}
        />
      </dl>
      <p className="mt-4 text-sm font-medium text-navy">{pl ? "Warunki zawieszające" : "Condizioni sospensive"}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">
        {conds.map((id) => {
          const cnd = CONDITIONS.find((x) => x.id === id);
          return <li key={id}>{pl ? cnd?.pl : cnd?.it}</li>;
        })}
        {conds.length === 0 ? (
          <li>{pl ? "Brak — wyższe ryzyko dla kupującego." : "Nessuna — rischio più alto per l’acquirente."}</li>
        ) : null}
      </ul>
      <p className="mt-4 text-sm font-medium text-navy">{pl ? "Niewykonanie" : "Inadempimento"}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{pl ? dep.hintPl : dep.hintIt}</p>
      <p className="mt-3 text-xs leading-relaxed text-faint">
        {pl
          ? "Płatność caparry: bonifico SEPA na konto wskazane przez notariusza, dopiero po przyjęciu i zawiadomieniu. ITALVIA nie przechowuje środków. Notariusza wybierasz Ty. Sprzedający ma 72 godziny na przyjęcie po Twoim podpisie. Model przygotowany z myślą o kontroli notariusza — nie zastępuje aktu."
          : "Pagamento della caparra: bonifico SEPA sul conto indicato dal notaio, solo dopo accettazione e comunicazione. ITALVIA non custodisce fondi. Il notaio lo scegli tu. Il venditore ha 72 ore per accettare dopo la tua firma. Modello pensato per il controllo del notaio — non sostituisce l’atto."}
      </p>
      {offer.amlProfession ? (
        <p className="mt-3 text-xs text-faint">
          AML: {offer.amlProfession}
          {offer.amlCf ? ` · CF/PESEL ${offer.amlCf}` : ""} · {offer.amlResidence}
        </p>
      ) : null}
      {offer.signedAt ? (
        <div className="mt-4 rounded-md bg-sage-soft px-3 py-3 text-sm text-navy">
          <p>
            {pl ? "Podpisano" : "Firmato"}: {offer.signedName} · {String(offer.signedAt).slice(0, 16).replace("T", " ")}
          </p>
          {offer.signatureHash ? (
            <p className="mt-1 font-mono text-[11px] text-faint">
              {pl ? "Odcisk" : "Impronta"} {offer.signatureHash}
            </p>
          ) : null}
          {offer.identityOk ? (
            <p className="mt-1 text-[11px] text-sage">{pl ? "Identyfikacja eIDAS zapisana." : "Identificazione eIDAS registrata."}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1.5">
      <dt className="text-faint">{k}</dt>
      <dd className="text-right text-navy">{v}</dd>
    </div>
  );
}
