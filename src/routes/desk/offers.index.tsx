import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listDeskOffers } from "@/lib/server/offers";
import { getProperty } from "@/data/properties";
import { STATUS_IT, KIND_IT } from "@/lib/offer-labels";
import { formatEur } from "@/lib/money";

export const Route = createFileRoute("/desk/offers/")({ component: DeskOffers });

function DeskOffers() {
  const q = useQuery({ queryKey: ["desk-offers"], queryFn: () => listDeskOffers() });
  const offers = q.data ?? [];
  const inbox = offers.filter((o) => ["sent", "countered", "ready", "signed", "deposit_pending", "receipt_uploaded"].includes(o.status));

  return (
    <div className="px-5 py-6">
      <h1 className="font-display text-3xl text-navy">Offerte</h1>
      <p className="text-sm text-muted">Informale, ufficiale, caparra — tre piani, mai un carrello.</p>
      <p className="mt-2 text-sm text-navy">{inbox.length} da trattare</p>
      <ul className="mt-6 space-y-3">
        {offers.map((o) => {
          const p = getProperty(o.propertyId);
          return (
            <li key={o.id}>
              <Link to="/desk/offers/$id" params={{ id: o.id }} className="block rounded-xl bg-paper p-4">
                <p className="text-xs text-faint">
                  {KIND_IT[o.kind]} · {STATUS_IT[o.status] ?? o.status}
                </p>
                <p className="font-display text-xl text-navy">
                  {o.buyerName ?? "Compratore"} · {p?.city}
                </p>
                <p className="text-sm tabular-nums text-muted">
                  {formatEur(o.offerEur)} contro {formatEur(o.askingEur)} · caparra {formatEur(o.depositEur)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      {offers.length === 0 ? <p className="mt-8 text-sm text-muted">Nessuna offerta. Arriveranno dalla scheda compratore.</p> : null}
    </div>
  );
}
