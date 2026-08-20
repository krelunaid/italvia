import { Plane } from "lucide-react";
import { weekendOf } from "@/data/life";
import { formatEur } from "@/lib/money";
import { useLang } from "@/lib/i18n";

function dayLine(s: string, lang: "pl" | "it") {
  if (lang !== "it") return s;
  return s.replaceAll("Piątek", "Venerdì").replaceAll("Sobota", "Sabato").replaceAll("Niedziela", "Domenica");
}

export function WeekendPlan({ propertyId }: { propertyId: string }) {
  const { lang, tx, locale } = useLang();
  const w = weekendOf(propertyId);
  if (!w) return null;

  return (
    <div className="rounded-xl bg-navy px-5 py-5 text-paper">
      <p className="flex items-center gap-2 text-xs tracking-[0.18em] text-sand uppercase">
        <Plane className="size-3.5" />
        {tx("Weekend z", "Weekend da")} {w.from}
      </p>
      <p className="mt-2 font-display text-2xl leading-snug">
        {tx("Dwa dni. Klucz. Agent. Lotniska.", "Due giorni. Chiave. Agente. Aeroporti.")}
      </p>
      <p className="mt-2 text-sm text-paper/75">
        {dayLine(w.outbound, lang)}
        <br />
        {dayLine(w.inbound, lang)}
      </p>
      <ol className="mt-4 space-y-2">
        {w.days.map((d) => (
          <li key={d.t} className="flex gap-3 text-sm">
            <span className="w-28 shrink-0 tabular-nums text-sand">{dayLine(d.t, lang)}</span>
            <span>{lang === "it" ? d.it : d.pl}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-paper/80">
        {tx("Loty", "Voli")} {formatEur(w.flightMin, false, locale)}–{formatEur(w.flightMax, false, locale)} ·{" "}
        {lang === "it" ? w.stayNoteIt : w.stayNotePl}
      </p>
    </div>
  );
}
