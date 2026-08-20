import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { getDeskSnapshot } from "@/lib/server/italvia";
import { listDeskOffers } from "@/lib/server/offers";
import { getStudioLive } from "@/lib/server/live";
import { PROPERTIES, completedChecks } from "@/data/properties";
import { formatEur } from "@/lib/money";
import { STATUS_IT } from "@/lib/offer-labels";

export const Route = createFileRoute("/desk/")({ component: DeskHome });

function DeskHome() {
  const q = useQuery({ queryKey: ["desk"], queryFn: () => getDeskSnapshot() });
  const offersQ = useQuery({ queryKey: ["desk-offers"], queryFn: () => listDeskOffers() });
  const liveQ = useQuery({ queryKey: ["live-studio"], queryFn: () => getStudioLive(), refetchInterval: 4000 });
  const leads = q.data?.leads ?? [];
  const visits = q.data?.visits ?? [];
  const offers = offersQ.data ?? [];
  const liveOffers = offers.filter((o) =>
    ["sent", "countered", "ready", "signed", "deposit_pending", "receipt_uploaded"].includes(o.status),
  );
  const fresh = leads.filter((l) => l.stage === "new");
  const hot = leads.filter((l) => ["video", "trip", "offer"].includes(l.stage));
  const stalled = leads.filter(
    (l) => l.stage !== "new" && (l.stage === "shortlist" || (l.last_touch ?? "").includes("dni")),
  );
  const weakDocs = PROPERTIES.filter((p) => completedChecks(p) < 8);
  const live = liveQ.data;

  return (
    <div className="px-5 py-6">
      <p className="text-xs uppercase tracking-[0.2em] text-faint">ITALVIA Desk</p>
      <h1 className="font-display text-3xl text-navy">Buongiorno, Chiara</h1>
      <p className="text-sm text-muted">Contatti polacchi già qualificati — non “quanto costa?”.</p>

      <Link
        to="/desk/live"
        className="mt-6 flex items-center gap-3 rounded-xl bg-navy px-4 py-4 text-paper"
      >
        <span className="grid size-11 place-items-center rounded-full bg-terracotta">
          <Radio className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] tracking-[0.16em] text-sand uppercase">
            {live ? "In diretta ora" : "Dal terrazzo"}
          </span>
          <span className="mt-0.5 block font-display text-xl leading-snug">
            {live
              ? `Stai mostrando ${live.peek.city} · ${live.peek.audience === "all" ? "tutti" : "invito scelto"}`
              : "Vai in diretta e manda l’invito"}
          </span>
        </span>
      </Link>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Nuovi contatti" value={String(fresh.length)} />
        <Stat label="Offerte vive" value={String(liveOffers.length)} />
        <Stat label="Video-visite" value={String(visits.length)} />
        <Stat label="Dossier aperti" value={String(weakDocs.length)} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl text-navy">Da fare oggi</h2>
        <ul className="mt-3 space-y-2">
          {liveOffers.slice(0, 3).map((o) => (
            <Task key={o.id} title={`Offerta ${STATUS_IT[o.status] ?? o.status}`} sub={`${o.buyerName ?? "Compratore"} · ${formatEur(o.offerEur)}`} />
          ))}
          {fresh.slice(0, 3).map((l) => (
            <Task key={l.id} title={`Chiamare ${l.name}`} sub={`${l.polish_city} · ${l.budget_eur ? formatEur(l.budget_eur) : ""}`} />
          ))}
          {visits.slice(0, 2).map((v) => (
            <Task key={v.id} title="Video-visita" sub={`${v.property_id} · ${v.scheduled_at}`} />
          ))}
          {weakDocs.slice(0, 2).map((p) => (
            <Task key={p.id} title={`Chiudere dossier ${p.city}`} sub={`${completedChecks(p)}/10 controlli`} />
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-navy">Clienti più caldi</h2>
          <Link to="/desk/leads" className="text-sm text-terracotta">
            Pipeline
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-line rounded-xl bg-paper">
          {hot.concat(leads.slice(0, 2)).slice(0, 5).map((l) => (
            <li key={l.id} className="px-4 py-3">
              <p className="text-navy">{l.name}</p>
              <p className="text-xs text-muted">
                {l.polish_city} · {l.purpose} · {l.stage} · {l.last_touch}
              </p>
              <p className="mt-1 text-sm text-muted">{l.notes}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 pb-8">
        <h2 className="font-display text-2xl text-navy">Trattative ferme</h2>
        <ul className="mt-3 space-y-2">
          {stalled.map((l) => (
            <li key={l.id} className="rounded-lg border border-line bg-paper px-4 py-3 text-sm text-navy">
              {l.name} — {l.last_touch ?? "silenzio"} · {l.notes}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper p-4">
      <p className="text-[11px] uppercase tracking-wider text-faint">{label}</p>
      <p className="font-display text-3xl tabular-nums text-navy">{value}</p>
    </div>
  );
}

function Task({ title, sub }: { title: string; sub: string }) {
  return (
    <li className="rounded-lg bg-paper px-4 py-3">
      <p className="text-sm text-navy">{title}</p>
      <p className="text-xs text-muted">{sub}</p>
    </li>
  );
}
