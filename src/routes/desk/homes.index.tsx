import { createFileRoute, Link } from "@tanstack/react-router";
import { PROPERTIES, completedChecks } from "@/data/properties";
import { formatEur } from "@/lib/money";

export const Route = createFileRoute("/desk/homes/")({ component: DeskHomes });

function DeskHomes() {
  return (
    <div className="px-5 py-6">
      <h1 className="font-display text-3xl text-navy">Immobili</h1>
      <p className="text-sm text-muted">Inseriti una volta in italiano. Il polacco si approva, non si pubblica da solo.</p>
      <ul className="mt-6 space-y-3">
        {PROPERTIES.map((p) => (
          <li key={p.id}>
            <Link to="/desk/homes/$id" params={{ id: p.id }} className="flex gap-3 rounded-xl bg-paper p-3">
              <img src={p.images[0]} alt="" className="h-20 w-28 rounded-md object-cover" />
              <div className="min-w-0">
                <p className="font-medium text-navy">{p.titleIt}</p>
                <p className="text-sm text-muted">
                  {p.city} · {formatEur(p.priceEur)}
                </p>
                <p className="text-xs text-faint">Dossier {completedChecks(p)}/10</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
