import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProfile } from "@/lib/hooks";
import { saveProfile, type Profile } from "@/lib/server/italvia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/app-header";
import { firstName } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { formatEur } from "@/lib/money";
import { useLang } from "@/lib/i18n";
import { readGate } from "@/lib/gate";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const PURPOSES = [
  { id: "vacation", pl: "Wakacje", it: "Casa per le vacanze" },
  { id: "relocation", pl: "Przeprowadzka", it: "Trasferimento" },
  { id: "investment", pl: "Inwestycja", it: "Investimento" },
  { id: "retirement", pl: "Emerytura", it: "Pensione" },
];
const SETTINGS = [
  { id: "sea", pl: "Morze", it: "Mare" },
  { id: "city", pl: "Miasto", it: "Città" },
  { id: "countryside", pl: "Wieś", it: "Campagna" },
  { id: "lake", pl: "Jezioro", it: "Lago" },
  { id: "mountain", pl: "Góry", it: "Montagna" },
];
const AIRPORTS = [
  { id: "SUF", pl: "Lamezia Terme" },
  { id: "BRI", pl: "Bari" },
  { id: "CTA", pl: "Catania" },
  { id: "PSA", pl: "Piza" },
  { id: "VRN", pl: "Werona" },
  { id: "FCO", pl: "Rzym Fiumicino" },
];
const CITIES = ["Warszawa", "Kraków", "Wrocław", "Gdańsk", "Poznań", "Katowice"];

function Onboarding() {
  const { user, isPending } = useCurrentUserState();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { lang, t, tx, locale } = useLang();

  const [step, setStep] = useState(() => (readGate() === "agent" ? 0 : 1));
  const [role, setRole] = useState<"buyer" | "agent">(() => (readGate() === "agent" ? "agent" : "buyer"));
  const [purpose, setPurpose] = useState(profile?.purpose ?? "vacation");
  const [budget, setBudget] = useState(profile?.budgetEur ?? 150000);
  const [cash, setCash] = useState(profile?.cashAvailableEur ?? 40000);
  const [financing, setFinancing] = useState(profile?.financing ?? "own");
  const [setting, setSetting] = useState(profile?.setting ?? "sea");
  const [condition, setCondition] = useState(profile?.condition ?? "ready");
  const [airport, setAirport] = useState(profile?.preferredAirport ?? "SUF");
  const [city, setCity] = useState(profile?.polishCity ?? "Warszawa");
  const [periods, setPeriods] = useState(profile?.visitPeriods ?? "wiosna / jesień");
  const [rental, setRental] = useState(profile?.rentalInterest ?? "personal");
  const [rooms, setRooms] = useState(profile?.minRooms ?? 2);
  const [terrace, setTerrace] = useState(profile?.wantsTerrace ?? true);
  const [seaKm, setSeaKm] = useState(profile?.seaMaxKm ?? 5);
  const [busy, setBusy] = useState(false);

  const name = firstName(user?.displayName, lang === "it" ? "ospite" : "Marek");
  const steps = role === "agent" ? 1 : 6;

  const draft = useMemo(
    () =>
      ({
        role,
        displayName: user?.displayName ?? name,
        purpose,
        budgetEur: budget,
        cashAvailableEur: cash,
        financing,
        setting,
        condition,
        preferredAirport: airport,
        polishCity: city,
        visitPeriods: periods,
        rentalInterest: rental,
        minRooms: rooms,
        wantsTerrace: terrace,
        seaMaxKm: setting === "sea" ? seaKm : null,
        onboarded: true,
      }) satisfies Omit<Profile, "userId">,
    [role, user?.displayName, name, purpose, budget, cash, financing, setting, condition, airport, city, periods, rental, rooms, terrace, seaKm],
  );

  if (isPending || loading) {
    return <div className="grid min-h-dvh place-items-center bg-ivory text-muted">{tx("Przygotowuję rozmowę…", "Preparo il colloquio…")}</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (profile?.onboarded) {
    return <Navigate to={profile.role === "agent" ? "/desk" : "/home"} />;
  }

  async function finish() {
    setBusy(true);
    try {
      await saveProfile({ data: draft });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      await navigate({ to: role === "agent" ? "/desk" : "/home" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col bg-ivory px-5 py-6">
      <AppHeader padded={false} />
      <div className="mt-6 h-1 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-terracotta transition-[width] duration-300" style={{ width: `${((role === "agent" ? 1 : step) / steps) * 100}%` }} />
      </div>

      {step === 0 ? (
        <Screen title={`${lang === "it" ? "Buongiorno" : "Dzień dobry"}, ${name}`} sub={tx("Kim jesteś w ITALVIA?", "Chi sei in ITALVIA?")}>
          <Choice
            active={role === "buyer"}
            onClick={() => setRole("buyer")}
            title={tx("Kupuję dom", "Compro casa")}
            sub={tx("Interfejs po polsku i włosku — Ty wybierasz", "Interfaccia polacco e italiano — scegli tu")}
          />
          <Choice
            active={role === "agent"}
            onClick={() => setRole("agent")}
            title={tx("Jestem agentem", "Sono l’agente")}
            sub={tx("ITALVIA Desk po włosku", "ITALVIA Desk in italiano")}
          />
          <Nav
            onBack={null}
            onNext={() => (role === "agent" ? void finish() : setStep(1))}
            next={role === "agent" ? tx("Otwórz Desk", "Apri il Desk") : t("next")}
            busy={busy}
          />
        </Screen>
      ) : null}

      {step === 1 ? (
        <Screen title={tx("Po co chcesz kupić?", "Perché vuoi comprare?")} sub={tx("Dlaczego szukasz domu we Włoszech", "Perché cerchi casa in Italia")}>
          <div className="grid grid-cols-2 gap-3">
            {PURPOSES.map((p) => (
              <Choice key={p.id} active={purpose === p.id} onClick={() => setPurpose(p.id)} title={lang === "it" ? p.it : p.pl} sub={lang === "it" ? p.pl : p.it} />
            ))}
          </div>
          <Nav onBack={null} onNext={() => setStep(2)} />
        </Screen>
      ) : null}

      {step === 2 ? (
        <Screen title={tx("Budżet", "Budget")} sub={tx("W euro, z przeliczeniem na złote orientacyjnie", "In euro, con cambio orientativo in zloty")}>
          <p className="font-display text-4xl text-navy">{formatEur(budget, false, locale)}</p>
          <input
            type="range"
            min={70000}
            max={350000}
            step={5000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-4 w-full accent-terracotta"
          />
          <label className="mt-6 block text-sm text-muted">{tx("Gotówka dostępna od razu", "Liquidità disponibile subito")}</label>
          <Input type="number" value={cash} onChange={(e) => setCash(Number(e.target.value))} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Choice active={financing === "own"} onClick={() => setFinancing("own")} title={tx("Kapitał własny", "Capitale proprio")} />
            <Choice active={financing === "mortgage"} onClick={() => setFinancing("mortgage")} title={tx("Z finansowaniem", "Con finanziamento")} />
          </div>
          <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </Screen>
      ) : null}

      {step === 3 ? (
        <Screen title={tx("Gdzie i w jakim stanie", "Dove e in che stato")} sub={tx("Miejsce, które czujesz — i czy ma być gotowe", "Il luogo che senti — e se deve essere pronto")}>
          <div className="grid grid-cols-2 gap-3">
            {SETTINGS.map((s) => (
              <Choice key={s.id} active={setting === s.id} onClick={() => setSetting(s.id)} title={lang === "it" ? s.it : s.pl} />
            ))}
          </div>
          {setting === "sea" ? (
            <>
              <p className="mt-5 text-sm text-muted">
                {tx("Maksymalnie od morza:", "Massimo dal mare:")} {seaKm} km
              </p>
              <input type="range" min={1} max={20} value={seaKm} onChange={(e) => setSeaKm(Number(e.target.value))} className="w-full accent-terracotta" />
            </>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Choice active={condition === "ready"} onClick={() => setCondition("ready")} title={tx("Gotowe", "Pronto")} sub={tx("Do zamieszkania", "Da abitare")} />
            <Choice active={condition === "renovate"} onClick={() => setCondition("renovate")} title={tx("Do remontu", "Da ristrutturare")} />
          </div>
          <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} />
        </Screen>
      ) : null}

      {step === 4 ? (
        <Screen title={tx("Podróż", "Viaggio")} sub={tx("Skąd startujesz i którędy lądujesz", "Da dove parti e dove atterri")}>
          <p className="text-sm text-muted">{tx("Miasto w Polsce", "Città in Polonia")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Choice key={c} compact active={city === c} onClick={() => setCity(c)} title={c} />
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">{tx("Preferowane lotnisko", "Aeroporto preferito")}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {AIRPORTS.map((a) => (
              <Choice key={a.id} compact active={airport === a.id} onClick={() => setAirport(a.id)} title={a.pl} />
            ))}
          </div>
          <label className="mt-5 block text-sm text-muted">{tx("Kiedy możesz oglądać", "Quando puoi visitare")}</label>
          <Input value={periods} onChange={(e) => setPeriods(e.target.value)} />
          <Nav onBack={() => setStep(3)} onNext={() => setStep(5)} />
        </Screen>
      ) : null}

      {step === 5 ? (
        <Screen title={tx("Jak chcesz z niego korzystać", "Come vuoi usarla")} sub={tx("Najem turystyczny albo wyłącznie swoje", "Locazione turistica oppure solo tua")}>
          <Choice
            active={rental === "tourist"}
            onClick={() => setRental("tourist")}
            title={tx("Też pod najem", "Anche in affitto")}
            sub={tx("Chcę analizować jako inwestycję", "Voglio leggerla come investimento")}
          />
          <Choice
            active={rental === "personal"}
            onClick={() => setRental("personal")}
            title={tx("Tylko dla nas", "Solo per noi")}
            sub={tx("Bez scenariusza najmu", "Senza scenario di locazione")}
          />
          <p className="mt-5 text-sm text-muted">
            {tx("Minimum pokoi:", "Minimo locali:")} {rooms}
          </p>
          <input type="range" min={1} max={5} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} className="w-full accent-terracotta" />
          <button
            type="button"
            onClick={() => setTerrace((v) => !v)}
            className={`mt-4 w-full rounded-lg border px-4 py-3 text-left ${terrace ? "border-terracotta bg-paper" : "border-line bg-paper"}`}
          >
            {terrace ? tx("Z tarasem — tak", "Con terrazzo — sì") : tx("Taras niewymagany", "Terrazzo non richiesto")}
          </button>
          <Nav onBack={() => setStep(4)} onNext={() => setStep(6)} />
        </Screen>
      ) : null}

      {step === 6 ? (
        <Screen title={t("yourProject")} sub={tx("Tak agent zobaczy Cię od pierwszego kontaktu", "Così l’agente ti vede dal primo contatto")}>
          <div className="rounded-xl bg-paper p-5 shadow-[var(--shadow-card)]">
            <ul className="space-y-2 text-navy">
              <li className="font-display text-2xl">
                {condition === "ready" ? tx("Gotowe do zamieszkania", "Pronto da abitare") : tx("Do wykończenia", "Da finire")}
              </li>
              <li>
                {tx("Do", "Fino a")} {formatEur(budget, false, locale)}
              </li>
              {setting === "sea" ? (
                <li>
                  {tx("Maksymalnie", "Massimo")} {seaKm} km {tx("od morza", "dal mare")}
                </li>
              ) : (
                <li>{lang === "it" ? SETTINGS.find((s) => s.id === setting)?.it : SETTINGS.find((s) => s.id === setting)?.pl}</li>
              )}
              <li>
                {tx("Wygodny dojazd z", "Arrivo comodo da")} {city}
              </li>
              <li>
                {rooms} {rooms === 1 ? tx("pokój", "locale") : tx("pokoje", "locali")}
                {terrace ? tx(" i taras", " e terrazzo") : ""}
              </li>
            </ul>
          </div>
          <Nav onBack={() => setStep(5)} onNext={() => void finish()} next={tx("Pokaż domy", "Mostra le case")} busy={busy} />
        </Screen>
      ) : null}
    </main>
  );
}

function Screen({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col pt-8">
      <h1 className="font-display text-3xl font-semibold text-navy">{title}</h1>
      <p className="mt-1 text-sm text-muted">{sub}</p>
      <div className="mt-6 flex flex-1 flex-col gap-3">{children}</div>
    </div>
  );
}

function Choice({
  title,
  sub,
  active,
  onClick,
  compact,
}: {
  title: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border text-left transition-colors ${compact ? "px-3 py-2" : "px-4 py-4"} ${
        active ? "border-terracotta bg-paper text-navy" : "border-line bg-paper/60 text-navy"
      }`}
    >
      <span className="block font-medium">{title}</span>
      {sub ? <span className="mt-0.5 block text-xs text-muted">{sub}</span> : null}
    </button>
  );
}

function Nav({
  onBack,
  onNext,
  next,
  busy,
}: {
  onBack: (() => void) | null;
  onNext: () => void;
  next?: string;
  busy?: boolean;
}) {
  const { t, tx } = useLang();
  return (
    <div className="mt-auto flex gap-3 pt-8 pb-4">
      {onBack ? (
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          {tx("Wstecz", "Indietro")}
        </Button>
      ) : null}
      <Button type="button" className="flex-1" onClick={onNext} disabled={busy}>
        {busy ? tx("Zapisuję…", "Salvo…") : next ?? t("next")}
      </Button>
    </div>
  );
}
