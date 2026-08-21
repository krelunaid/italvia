import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProperty } from "@/data/properties";
import { approveCopy, generateListingCopy, getCopy } from "@/lib/server/italvia";
import { getDeskValuation, setShowValuation } from "@/lib/server/valuation";
import { ValuationCard } from "@/components/valuation-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { completedChecks } from "@/data/properties";
import { formatEur } from "@/lib/money";

export const Route = createFileRoute("/desk/homes/$id")({ component: DeskHomeDetail });

function DeskHomeDetail() {
  const { id } = Route.useParams();
  const p = getProperty(id);
  const qc = useQueryClient();
  const copy = useQuery({ queryKey: ["copy", id], queryFn: () => getCopy({ data: id }) });
  const valQ = useQuery({ queryKey: ["desk-val", id], queryFn: () => getDeskValuation({ data: id }) });
  const [busy, setBusy] = useState(false);
  const [toggling, setToggling] = useState(false);

  if (!p) return <p className="p-8">Immobile non in selezione.</p>;
  const val = valQ.data;

  async function setShow(show: boolean) {
    setToggling(true);
    try {
      await setShowValuation({ data: { propertyId: id, show } });
      await qc.invalidateQueries({ queryKey: ["desk-val", id] });
      await qc.invalidateQueries({ queryKey: ["buyer-val", id] });
      await qc.invalidateQueries({ queryKey: ["val-flags"] });
      toast(show ? "Il compratore vedrà la valutazione." : "Valutazione nascosta al compratore.");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="px-5 py-6">
      <Link to="/desk/homes" className="text-sm text-muted">
        Immobili
      </Link>
      <h1 className="mt-2 font-display text-3xl text-navy">{p.titleIt}</h1>
      <p className="text-sm text-muted">
        {p.city} · {formatEur(p.priceEur)} · dossier {completedChecks(p)}/10
      </p>
      <img src={p.images[0]} alt="" className="mt-4 h-52 w-full rounded-xl object-cover" />
      <p className="mt-4 text-sm leading-relaxed text-navy">{p.descriptionIt}</p>

      <section className="mt-8 rounded-xl bg-paper p-5">
        <p className="text-[11px] tracking-[0.16em] text-faint uppercase">Venditore</p>
        <h2 className="mt-1 font-display text-2xl text-navy">{val?.seller ?? "Proprietario"}</h2>
        <p className="mt-1 text-sm text-muted">
          L’app calcola una valutazione automatica. Il venditore sceglie se il cliente polacco la vede. Non è una perizia.
        </p>

        {val?.valuation ? <div className="mt-4"><ValuationCard valuation={val.valuation} seller={val.seller} audience="desk" /></div> : null}

        <p className="mt-5 text-sm font-medium text-navy">Mostrare la valutazione al compratore?</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={toggling}
            onClick={() => void setShow(true)}
            className={`rounded-lg border px-3 py-4 text-left ${val?.show ? "border-terracotta bg-ivory" : "border-line bg-paper"}`}
          >
            <span className="block text-sm font-medium text-navy">Sì, farla vedere</span>
            <span className="mt-1 block text-[11px] text-muted">Il cliente vede le widełki in scheda</span>
          </button>
          <button
            type="button"
            disabled={toggling}
            onClick={() => void setShow(false)}
            className={`rounded-lg border px-3 py-4 text-left ${val && !val.show ? "border-terracotta bg-ivory" : "border-line bg-paper"}`}
          >
            <span className="block text-sm font-medium text-navy">No, tenerla riservata</span>
            <span className="mt-1 block text-[11px] text-muted">Solo tu e il venditore la vedete</span>
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-paper p-5">
        <h2 className="font-display text-2xl text-navy">Testi da approvare</h2>
        <p className="text-sm text-muted">L’app prepara polacco e post social. Pubblichi solo tu.</p>
        <div className="mt-4 flex gap-2">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await generateListingCopy({ data: id });
                await qc.invalidateQueries({ queryKey: ["copy", id] });
                toast("Bozza pronta.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Scrivo…" : "Prepara testi"}
          </Button>
          <Button
            variant="sage"
            disabled={!copy.data || copy.data.approved}
            onClick={async () => {
              await approveCopy({ data: id });
              await qc.invalidateQueries({ queryKey: ["copy", id] });
              toast("Approvato.");
            }}
          >
            Approva
          </Button>
        </div>
        {copy.data ? (
          <div className="mt-4 space-y-3 text-sm">
            <Block k="Tytuł PL" v={copy.data.title_pl} />
            <Block k="Opis PL" v={copy.data.body_pl} />
            <Block k="Facebook" v={copy.data.facebook_it} />
            <Block k="Instagram" v={copy.data.instagram_it} />
            <p className="text-xs text-faint">{copy.data.approved ? "Approvato" : "In attesa di approvazione"}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Nessuna bozza ancora.</p>
        )}
      </section>
    </div>
  );
}

function Block({ k, v }: { k: string; v: string | null }) {
  if (!v) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-faint">{k}</p>
      <p className="whitespace-pre-wrap text-navy">{v}</p>
    </div>
  );
}
