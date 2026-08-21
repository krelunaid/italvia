import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PROPERTIES, completedChecks } from "@/data/properties";
import { formatEur } from "@/lib/money";
import { getValuationFlags } from "@/lib/server/valuation";
import { valueProperty } from "@/lib/valuation";

export const Route = createFileRoute("/desk/homes/")({ component: DeskHomes });

function DeskHomes() {
  const flags = useQuery({ queryKey: ["val-flags"], queryFn: () => getValuationFlags() });
  return (
    <div className="px-5 py-6">
      <h1 className="font-display text-3xl text-navy">Immobili</h1>
      <p className="text-sm text-muted">
        Inseriti una volta in italiano. Il venditore decide se il cliente vede la valutazione automatica.
      </p>
      <ul className="mt-6 space-y-3">
        {PROPERTIES.map((p) => {
          const v = valueProperty(p);
          const shown = flags.data?.[p.id] === true;
          return (
            <li key={p.id}>
              <Link to="/desk/homes/$id" params={{ id: p.id }} className="flex gap-3 rounded-xl bg-paper p-3">
                <img src={p.images[0]} alt="" className="h-20 w-28 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="font-medium text-navy">{p.titleIt}</p>
                  <p className="text-sm text-muted">
                    {p.city} · {formatEur(p.priceEur)} · stima {formatEur(v.mid)}
                  </p>
                  <p className="text-xs text-faint">
                    Dossier {completedChecks(p)}/10 · {shown ? "valutazione visibile al cliente" : "valutazione riservata"}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
