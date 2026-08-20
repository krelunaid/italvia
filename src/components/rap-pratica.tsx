import type { Offer } from "@/lib/server/offers";
import { LEGAL } from "@/data/legal";
import { formatEur } from "@/lib/money";
import { registerTaxEur } from "@/lib/offer-stage";

export function RapPratica({ offer }: { offer: Offer }) {
  if (!offer.acceptedAt || !offer.registerDue) return null;
  const tax = registerTaxEur(offer.depositEur + (offer.secondAccontoEur ?? 0));
  const concluded = String(offer.acceptedAt).slice(0, 10);
  const status =
    offer.status === "under_contract"
      ? "Dokumenty w przygotowaniu — agencja składa RAP"
      : offer.status === "receipt_uploaded"
        ? "Czeka na potwierdzenie wpływu caparry"
        : "Po wpływie caparry agencja kompletuje RAP";

  return (
    <article className="rounded-xl border border-line bg-paper p-5">
      <div className="flex items-start gap-4">
        <svg viewBox="0 0 72 72" className="size-16 shrink-0" aria-hidden>
          <circle cx="36" cy="36" r="34" fill="#1C2C4A" />
          <circle cx="36" cy="36" r="28" fill="none" stroke="#D9C4A8" strokeWidth="2" />
          <text x="36" y="32" textAnchor="middle" fill="#FBF8F1" fontFamily="Georgia, serif" fontSize="9">
            RAP
          </text>
          <text x="36" y="46" textAnchor="middle" fill="#D9C4A8" fontFamily="Georgia, serif" fontSize="8">
            30 dni
          </text>
        </svg>
        <div className="min-w-0">
          <p className="text-xs tracking-[0.16em] text-faint uppercase">Agenzia delle Entrate</p>
          <h2 className="font-display text-2xl text-navy">Pratica RAP</h2>
          <p className="mt-1 text-sm text-muted">{LEGAL.rapLeadPl}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <Row k="Umowa zawarta" v={concluded} />
        <Row k="Rejestracja do" v={offer.registerDue} />
        <Row k="Odpowiedzialna" v="Agenzia ITALVIA — Chiara Nowak" />
        <Row k="Stan" v={status} />
        <Row k="Imposta 0,5% (orientacyjnie)" v={formatEur(tax)} />
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-faint">{LEGAL.registerPl}</p>
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
