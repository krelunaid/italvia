import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDeskSnapshot, updateLeadStage } from "@/lib/server/italvia";
import { formatEur } from "@/lib/money";

export const Route = createFileRoute("/desk/leads")({ component: Leads });

const STAGES = [
  { id: "new", label: "Nuovo" },
  { id: "profile", label: "Profilato" },
  { id: "shortlist", label: "Immobili" },
  { id: "video", label: "Video" },
  { id: "trip", label: "Viaggio" },
  { id: "offer", label: "Proposta" },
  { id: "due", label: "Verifiche" },
  { id: "prelim", label: "Preliminare" },
  { id: "keys", label: "Rogito" },
  { id: "after", label: "Post" },
];

function Leads() {
  const q = useQuery({ queryKey: ["desk"], queryFn: () => getDeskSnapshot() });
  const qc = useQueryClient();
  const leads = q.data?.leads ?? [];

  return (
    <div className="px-5 py-6">
      <h1 className="font-display text-3xl text-navy">Pipeline</h1>
      <p className="text-sm text-muted">Ogni cliente ha già un progetto, non una domanda vuota.</p>
      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const col = leads.filter((l) => l.stage === s.id || (s.id === "profile" && l.stage === "profilato"));
          return (
            <div key={s.id} className="w-56 shrink-0">
              <p className="text-xs uppercase tracking-wider text-faint">
                {s.label} · {col.length}
              </p>
              <div className="mt-2 space-y-2">
                {col.map((l) => (
                  <article key={l.id} className="rounded-lg bg-paper p-3">
                    <p className="text-sm font-medium text-navy">{l.name}</p>
                    <p className="text-xs text-muted">
                      {l.polish_city} · {l.budget_eur ? formatEur(l.budget_eur) : "—"}
                    </p>
                    <p className="mt-1 text-xs text-faint">{l.notes}</p>
                    <select
                      className="mt-2 w-full rounded-md border border-line bg-ivory px-2 py-1 text-xs"
                      value={l.stage}
                      onChange={async (e) => {
                        await updateLeadStage({ data: { id: l.id, stage: e.target.value } });
                        await qc.invalidateQueries({ queryKey: ["desk"] });
                      }}
                    >
                      {STAGES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
