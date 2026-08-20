import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PROPERTIES, type Condition, type Setting } from "@/data/properties";
import { asBuyerProfile, useProfile } from "@/lib/hooks";
import { PropertyCard } from "@/components/property-card";
import { matchScore } from "@/lib/score";
import { AppHeader } from "@/components/app-header";
import { useLang } from "@/lib/i18n";

type Search = { c?: string };

export const Route = createFileRoute("/_app/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    c: typeof s.c === "string" ? s.c : undefined,
  }),
  component: SearchPage,
});

function SearchPage() {
  const { c } = Route.useSearch();
  const { profile } = useProfile();
  const { t, tx, locale } = useLang();
  const bp = asBuyerProfile(profile);
  const [maxPrice, setMaxPrice] = useState(250000);
  const [setting, setSetting] = useState<Setting | "all">("all");
  const [condition, setCondition] = useState<Condition | "all">("all");
  const [readyOnly, setReadyOnly] = useState(c === "ready");

  const list = useMemo(() => {
    return PROPERTIES.filter((p) => {
      if (c && c !== "all" && !p.collections.includes(c as never)) return false;
      if (p.priceEur > maxPrice) return false;
      if (setting !== "all" && p.setting !== setting) return false;
      if (condition !== "all" && p.condition !== condition) return false;
      if (readyOnly && p.condition !== "ready") return false;
      return true;
    }).sort((a, b) => matchScore(bp, b) - matchScore(bp, a));
  }, [c, maxPrice, setting, condition, readyOnly, bp]);

  const settings: { id: Setting | "all"; pl: string; it: string }[] = [
    { id: "all", pl: "Wszystkie", it: "Tutte" },
    { id: "sea", pl: "Morze", it: "Mare" },
    { id: "city", pl: "Miasto", it: "Città" },
    { id: "lake", pl: "Jezioro", it: "Lago" },
    { id: "countryside", pl: "Wieś", it: "Campagna" },
    { id: "mountain", pl: "Góry", it: "Montagna" },
  ];

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} trailing={<Link to="/home" className="text-sm text-muted">Home</Link>} />
      <h1 className="mt-6 font-display text-3xl text-navy">{t("selection")}</h1>
      <p className="text-sm text-muted">
        {list.length} {tx("nieruchomości prowadzonych przez agenta", "immobili seguiti dall’agente")}
      </p>

      <div className="mt-5 space-y-4 rounded-xl bg-paper p-4">
        <label className="block text-xs uppercase tracking-wider text-faint">
          {tx("Cena do", "Prezzo fino a")} {maxPrice.toLocaleString(locale)} €
        </label>
        <input
          type="range"
          min={80000}
          max={250000}
          step={5000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-terracotta"
        />
        <div className="flex flex-wrap gap-2">
          {settings.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSetting(s.id)}
              className={`rounded-full px-3 py-1.5 text-xs ${setting === s.id ? "bg-navy text-paper" : "bg-ivory-deep text-navy"}`}
            >
              {tx(s.pl, s.it)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={readyOnly} onChange={(e) => setReadyOnly(e.target.checked)} className="accent-terracotta" />
          {tx("Tylko gotowe do zamieszkania", "Solo pronti da abitare")}
        </label>
      </div>

      <div className="mt-6 grid gap-5">
        {list.map((p) => (
          <PropertyCard key={p.id} property={p} profile={bp} />
        ))}
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            {tx("Nic nie pasuje do filtrów — zluzuj budżet albo stan.", "Niente corrisponde — allarga budget o stato.")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
