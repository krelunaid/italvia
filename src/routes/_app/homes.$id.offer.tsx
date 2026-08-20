import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { getProperty } from "@/data/properties";
import { CONDITIONS, DEPOSIT_KINDS, LEGAL } from "@/data/legal";
import { createInformalOffer } from "@/lib/server/offers";
import { estimatePurchase } from "@/lib/costs";
import { formatEur } from "@/lib/money";
import { useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OfferRecap } from "@/components/offer-recap";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/homes/$id/offer")({ component: OfferComposer });

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function OfferComposer() {
  const { id } = Route.useParams();
  const property = getProperty(id);
  const { user, profile, authPending } = useProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const asking = property?.priceEur ?? 0;
  const [offerEur, setOfferEur] = useState(Math.round(asking * 0.95));
  const [depositEur, setDepositEur] = useState(Math.max(5000, Math.round(asking * 0.05)));
  const [depositKind, setDepositKind] = useState<"caparra" | "acconto" | "escrow">("caparra");
  const [validUntil, setValidUntil] = useState(plusDays(14));
  const [deedBy, setDeedBy] = useState(plusDays(120));
  const [financing, setFinancing] = useState<"cash" | "mortgage">("cash");
  const [mortgageEur, setMortgageEur] = useState(Math.round(asking * 0.6));
  const [furniture, setFurniture] = useState(false);
  const [conds, setConds] = useState<string[]>(["urban", "liens", "docs"]);
  const [notes, setNotes] = useState("");

  if (authPending) return <div className="grid min-h-[40vh] place-items-center text-muted">Ładuję…</div>;
  if (!user) return <RedirectToSignIn />;
  if (!property) {
    return (
      <div className="p-8">
        <p>Nie ma takiego domu.</p>
        <Link to="/home" className="text-terracotta">
          Wróć
        </Link>
      </div>
    );
  }

  const home = property;
  const costs = estimatePurchase(home);
  const dep = DEPOSIT_KINDS.find((d) => d.id === depositKind)!;
  const delta = offerEur - asking;
  const depPct = offerEur > 0 ? Math.round((depositEur / offerEur) * 1000) / 10 : 0;

  function toggleCond(id: string) {
    setConds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function goConditions() {
    if (financing === "mortgage" && !conds.includes("mortgage")) {
      setConds((c) => [...c, "mortgage"]);
    }
    setStep(1);
  }

  async function send() {
    setBusy(true);
    try {
      const conditions = [...conds];
      if (financing === "mortgage" && !conditions.includes("mortgage")) conditions.push("mortgage");
      const res = await createInformalOffer({
        data: {
          propertyId: home.id,
          offerEur,
          depositEur,
          depositKind,
          validUntil,
          deedBy,
          financing,
          furniture,
          conditions,
          notesPl: notes,
          mortgageEur: financing === "mortgage" ? mortgageEur : undefined,
        },
      });
      toast("Oferta poszła do Chiary. To nadal nie jest umowa.");
      await navigate({ to: "/offers/$id", params: { id: res.id } });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Nie udało się wysłać.");
    } finally {
      setBusy(false);
    }
  }

  const draft = {
    askingEur: asking,
    offerEur,
    depositEur,
    depositKind,
    validUntil,
    deedBy,
    financing,
    furniture,
    conditions: conds,
    notesPl: notes,
    mortgageEur: financing === "mortgage" ? mortgageEur : null,
  };

  return (
    <div className="px-5 py-4 pb-28">
      <Link to="/homes/$id" params={{ id: property.id }} className="text-sm text-muted">
        ← {property.city}
      </Link>
      <p className="mt-4 text-xs tracking-[0.18em] text-faint uppercase">
        {step === 0 ? "Krok 1 z 3 · nie wiąże" : step === 1 ? "Krok 2 z 3 · warunki" : "Krok 3 z 3 · podsumowanie"}
      </p>
      <h1 className="mt-1 font-display text-3xl text-navy">Złóż ofertę</h1>
      <p className="font-display italic text-faint">Fai un’offerta</p>
      <p className="mt-3 rounded-lg bg-ivory-deep px-3 py-2 text-sm text-navy">{LEGAL.informalBannerPl}</p>

      <p className="mt-5 text-sm text-muted">
        {property.titlePl} · ostrożny koszt {formatEur(costs.totalMid)}
      </p>

      {step === 0 ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-navy px-5 py-5 text-paper">
            <p className="text-xs tracking-[0.16em] text-sand uppercase">Prezzo richiesto</p>
            <p className="font-display text-4xl tabular-nums">{formatEur(asking)}</p>
          </div>

          <MoneyBlock label="Twoja oferta" value={offerEur} onChange={setOfferEur} big />
          <p className={cn("text-sm", delta < 0 ? "text-terracotta" : "text-sage")}>
            {delta === 0
              ? "Równo z ogłoszeniem."
              : `${formatEur(Math.abs(delta))} ${delta < 0 ? "poniżej" : "powyżej"} ogłoszenia.`}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-ivory-deep">
            <div
              className="h-full rounded-full bg-terracotta"
              style={{ width: `${Math.min(100, Math.max(8, (offerEur / asking) * 100))}%` }}
            />
          </div>

          <MoneyBlock label="Kwota, którą wpłaciłbyś po przyjęciu" value={depositEur} onChange={setDepositEur} min={1000} />
          <p className="text-xs text-faint">
            {depPct}% oferty. Nie teraz. Dopiero po podpisanej propozycji i akceptacji sprzedającego.
          </p>

          <div className="space-y-2">
            {DEPOSIT_KINDS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDepositKind(d.id)}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left",
                  depositKind === d.id ? "border-navy bg-paper" : "border-line bg-paper",
                )}
              >
                <p className="text-sm font-medium text-navy">{d.pl}</p>
                <p className="mt-1 text-xs text-muted">{d.hintPl}</p>
              </button>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-danger">{LEGAL.caparraWarningPl}</p>
          <Field label="Oferta ważna do">
            <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </Field>
          <Field label="Rogito do">
            <Input type="date" value={deedBy} onChange={(e) => setDeedBy(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cn("h-12 rounded-lg text-sm", financing === "cash" ? "bg-navy text-paper" : "bg-paper text-muted")}
              onClick={() => setFinancing("cash")}
            >
              Środki własne
            </button>
            <button
              type="button"
              className={cn("h-12 rounded-lg text-sm", financing === "mortgage" ? "bg-navy text-paper" : "bg-paper text-muted")}
              onClick={() => setFinancing("mortgage")}
            >
              Kredyt
            </button>
          </div>
          {financing === "mortgage" ? (
            <Field label="Kredyt, bez którego nie chcesz być związany">
              <Input type="number" value={mortgageEur} onChange={(e) => setMortgageEur(Number(e.target.value))} />
            </Field>
          ) : null}
          <Button className="w-full" onClick={goConditions}>
            Warunki
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-navy">Zaznacz to, bez czego nie chcesz być związany. Puste pole = wyższe ryzyko.</p>
          {CONDITIONS.map((c) => {
            const on = conds.includes(c.id);
            return (
              <label key={c.id} className="flex gap-3 rounded-lg bg-paper px-4 py-3 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleCond(c.id)}
                  className="mt-1 accent-terracotta"
                />
                <span>
                  {c.pl}
                  <span className="mt-1 block text-[11px] text-faint">{c.it}</span>
                </span>
              </label>
            );
          })}
          <label className="flex gap-3 rounded-lg bg-paper px-4 py-3 text-sm">
            <input type="checkbox" checked={furniture} onChange={(e) => setFurniture(e.target.checked)} className="accent-terracotta" />
            Meble z ogłoszenia wchodzą w cenę
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Prośby szczególne, po polsku. Chiara przetłumaczy."
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
              Wstecz
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)}>
              Podsumowanie
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 space-y-4">
          <OfferRecap property={property} draft={draft} />
          <p className="text-sm leading-relaxed text-muted">
            {formatEur(depositEur)} jako {dep.pl} — {LEGAL.caparraQualifyPl}
          </p>
          <p className="text-xs text-faint">
            Płatność nie rusza. Nie ma rezerwacji. Agent przekaże właścicielowi i wróci z odpowiedzią: przyjęcie, odmowa,
            kontroferta, wyższa caparra albo inna data rogito.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Wstecz
            </Button>
            <Button className="flex-1" onClick={() => void send()} disabled={busy}>
              Wyślij do agenta
            </Button>
          </div>
          {profile?.displayName ? <p className="text-center text-xs text-faint">{profile.displayName}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function MoneyBlock({
  label,
  value,
  onChange,
  big,
  min = 10000,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  big?: boolean;
  min?: number;
}) {
  return (
    <div className="rounded-xl bg-paper px-5 py-4">
      <p className="text-xs tracking-[0.16em] text-faint uppercase">{label}</p>
      <p className={cn("tabular-nums text-navy", big ? "font-display text-4xl" : "font-display text-3xl")}>
        {formatEur(value)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[-5000, -1000, 1000, 5000].map((d) => (
          <button
            key={d}
            type="button"
            className="h-11 rounded-md bg-ivory-deep px-3 text-sm text-navy"
            onClick={() => onChange(Math.max(min, value + d))}
          >
            {d > 0 ? "+" : ""}
            {d / 1000} tys.
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-faint">{label}</span>
      {children}
    </label>
  );
}
