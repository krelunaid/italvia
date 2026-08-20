import type { Property } from "@/data/properties";
import { estimateLifeFromPoland } from "@/lib/life-cost";
import { formatEur, formatPln, eurToPln } from "@/lib/money";
import { useLang } from "@/lib/i18n";

export function LifeFromPoland({ property }: { property: Property }) {
  const { lang, tx, locale } = useLang();
  const life = estimateLifeFromPoland(property);
  if (!life.yearMid) return null;

  return (
    <div className="mt-6 rounded-xl border border-line bg-paper p-5">
      <p className="text-xs tracking-[0.18em] text-faint uppercase">
        {tx("Utrzymanie z Polski", "Tenuta dalla Polonia")}
      </p>
      <p className="mt-1 font-display text-2xl text-navy">
        {formatEur(life.monthMin, false, locale)}–{formatEur(life.monthMax, false, locale)}
        <span className="text-base text-muted"> {tx("/ miesiąc", "/ mese")}</span>
      </p>
      <p className="text-sm text-muted">
        {tx("ok.", "circa")} {formatPln(eurToPln(life.yearMid))} {tx("rocznie", "all’anno")} · {life.visitsPerYear}{" "}
        {tx("przyloty", "arrivi")} · {life.emptyMonths} {tx("miesięcy pustych", "mesi vuoti")}
      </p>
      <ul className="mt-4 divide-y divide-line">
        {life.lines.map((line) => (
          <li key={line.key} className="flex items-center justify-between py-2 text-sm">
            <span className="text-navy">{lang === "it" ? line.labelIt : line.labelPl}</span>
            <span className="tabular-nums text-navy">
              {formatEur(line.year, false, locale)}/{tx("rok", "anno")}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-faint">
        {tx(
          "Szacunek dla domu trzymanego z Polski, nie dla stałego zamieszkania. Loty — taryfy ostrożne, nie promocje. To nie jest oferta ubezpieczenia ani zarządzania.",
          "Stima per una casa tenuta dalla Polonia, non per residenza permanente. Voli — tariffe prudenti, non promozioni. Non è un’offerta di assicurazione o gestione.",
        )}
      </p>
    </div>
  );
}
