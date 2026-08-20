import { useState } from "react";
import { counterparty } from "@/data/sellers";
import { LEGAL } from "@/data/legal";
import { formatEur } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { EpcQr } from "@/components/epc-qr";
import { toast } from "sonner";

const KIND_LABEL: Record<string, string> = {
  caparra: "CAPARRA CONFIRMATORIA",
  acconto: "ACCONTO PREZZO",
  acconto2: "SECONDO ACCONTO",
  escrow: "DEPOSITO NOTAIO",
  balance: "SALDO ROGITO",
};

export function SepaSlip({
  propertyId,
  offerId,
  amount,
  depositKind,
  heading,
}: {
  propertyId: string;
  offerId: string;
  amount: number;
  depositKind: string;
  heading?: string;
}) {
  const c = counterparty(propertyId);
  const tag = KIND_LABEL[depositKind] ?? "CAPARRA CONFIRMATORIA";
  const causal = `${tag} ITALVIA-${offerId.slice(0, 8).toUpperCase()}`;
  const lines = [
    { k: "Odbiorca", v: c.notary },
    { k: "Bank", v: c.bank },
    { k: "IBAN", v: c.iban },
    { k: "BIC", v: c.bic },
    { k: "Kwota", v: formatEur(amount) },
    { k: "Tytuł / causale", v: causal },
  ];

  function copy(text: string, label: string) {
    void navigator.clipboard.writeText(text);
    toast(`${label} skopiowane`);
  }

  return (
    <div className="rounded-xl bg-navy px-5 py-5 text-paper">
      <p className="text-xs tracking-[0.18em] text-sand uppercase">{heading ?? "Bonifico SEPA — nie karta"}</p>
      <p className="mt-2 font-display text-2xl">{formatEur(amount)}</p>
      <p className="mt-2 text-sm text-paper/80">{LEGAL.noCartPl}</p>
      <p className="mt-1 text-xs text-paper/60">
        Sprzedający: {c.seller}. Środki idą na konto wskazane przez notariusza, nie do ITALVIA.
      </p>
      <p className="mt-2 text-xs text-sand">{LEGAL.sepaWhyPl}</p>
      <div className="mt-4">
        <EpcQr bic={c.bic} name={c.notary} iban={c.iban} amountEur={amount} causal={causal} />
      </div>
      <dl className="mt-4 space-y-2">
        {lines.map((l) => (
          <div key={l.k} className="flex items-start justify-between gap-3 border-t border-paper/15 pt-2">
            <div>
              <dt className="text-[11px] text-sand">{l.k}</dt>
              <dd className="break-all text-sm">{l.v}</dd>
            </div>
            <button type="button" className="shrink-0 text-xs text-sand" onClick={() => copy(l.v, l.k)}>
              Kopiuj
            </button>
          </div>
        ))}
      </dl>
      <Button
        variant="outline"
        className="mt-4 w-full border-paper/30 bg-transparent text-paper hover:bg-paper/10"
        onClick={() => {
          copy(lines.map((l) => `${l.k}: ${l.v}`).join("\n"), "Dane");
          toast("Wklej w aplikacji banku. ITALVIA nie otwiera Twojego konta.");
        }}
      >
        Kopiuj całość do banku
      </Button>
    </div>
  );
}

export function ReceiptForm({
  onSubmit,
  busy,
  label,
}: {
  onSubmit: (ref: string, date: string) => void;
  busy: boolean;
  label?: string;
}) {
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <form
      className="mt-4 space-y-3 rounded-xl border border-line bg-paper p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(ref, date);
      }}
    >
      <p className="text-sm text-navy">
        {label ?? "Po wykonaniu przelewu zgłoś referencję. Agent potwierdza wpływ — aplikacja nie widzi Twojego banku."}
      </p>
      <label className="block text-xs text-faint">CRO / referencja bonifico</label>
      <input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        className="h-11 w-full rounded-md border border-line bg-ivory px-3 text-sm"
        placeholder="np. 12345678901"
      />
      <label className="block text-xs text-faint">Data przelewu</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-11 w-full rounded-md border border-line bg-ivory px-3 text-sm"
      />
      <Button type="submit" className="w-full" disabled={busy}>
        Zgłoś przelew
      </Button>
    </form>
  );
}
