import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDeskSnapshot } from "@/lib/server/italvia";
import { getProperty } from "@/data/properties";

export const Route = createFileRoute("/desk/calendar")({ component: CalendarPage });

function CalendarPage() {
  const q = useQuery({ queryKey: ["desk"], queryFn: () => getDeskSnapshot() });
  const visits = q.data?.visits ?? [];

  return (
    <div className="px-5 py-6">
      <h1 className="font-display text-3xl text-navy">Agenda</h1>
      <p className="text-sm text-muted">Video-visite e giorni in Italia.</p>
      <ul className="mt-6 space-y-3">
        {visits.map((v) => {
          const p = getProperty(v.property_id);
          return (
            <li key={v.id} className="rounded-xl bg-paper p-4">
              <p className="text-xs uppercase tracking-wider text-faint">{v.status}</p>
              <p className="font-medium text-navy">{p?.titleIt ?? v.property_id}</p>
              <p className="text-sm text-muted">{v.scheduled_at}</p>
            </li>
          );
        })}
        {visits.length === 0 ? (
          <li className="rounded-xl bg-paper p-6 text-sm text-muted">
            Nessuna video-visita in coda. Quando un cliente prenota, compare qui.
          </li>
        ) : null}
        <li className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">
          Slot libero suggerito: venerdì 11:00 — Scalea, per Marek.
        </li>
      </ul>
    </div>
  );
}
