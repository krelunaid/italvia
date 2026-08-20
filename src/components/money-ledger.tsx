import type { Offer } from "@/lib/server/offers";
import { formatEur } from "@/lib/money";
import { remainingBalance } from "@/lib/offer-stage";
import { cn } from "@/lib/utils";

function mark(status: string) {
  if (status === "verified") return { pl: "Potwierdzone", tone: "text-sage" };
  if (status === "receipt" || status === "receipt_uploaded") return { pl: "Zgłoszone", tone: "text-terracotta" };
  if (status === "instructed") return { pl: "Do przelewu", tone: "text-navy" };
  return { pl: "Nie rusza", tone: "text-faint" };
}

export function MoneyLedger({ offer }: { offer: Offer }) {
  const rows = [
    { k: "Caparra confirmatoria", amount: offer.depositEur, status: offer.paymentStatus },
    ...(offer.secondAccontoEur
      ? [{ k: "Secondo acconto", amount: offer.secondAccontoEur, status: offer.secondAccontoStatus }]
      : []),
    { k: "Saldo al rogito", amount: remainingBalance(offer), status: offer.balanceStatus },
  ];
  return (
    <div className="rounded-xl border border-line bg-paper p-5">
      <p className="text-xs tracking-[0.16em] text-faint uppercase">Księga wpłat · nie konto ITALVIA</p>
      <ul className="mt-3 space-y-3">
        {rows.map((r) => {
          const m = mark(r.status);
          return (
            <li key={r.k} className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <div>
                <p className="text-sm text-navy">{r.k}</p>
                <p className={cn("text-[11px]", m.tone)}>{m.pl}</p>
              </div>
              <p className="font-display text-2xl tabular-nums text-navy">{formatEur(r.amount)}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
