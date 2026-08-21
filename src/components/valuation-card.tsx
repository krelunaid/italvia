import { formatEur } from "@/lib/money";
import { useLang } from "@/lib/i18n";
import type { Valuation } from "@/lib/valuation";
import { cn } from "@/lib/utils";

export function ValuationCard({
  valuation,
  seller,
  audience,
}: {
  valuation: Valuation;
  seller: string;
  audience: "buyer" | "desk";
}) {
  const { tx, locale } = useLang();
  const stance =
    valuation.stance === "below"
      ? tx("Cena poniżej wyceny", "Prezzo sotto la stima")
      : valuation.stance === "above"
        ? tx("Cena powyżej wyceny", "Prezzo sopra la stima")
        : tx("Cena w widełkach wyceny", "Prezzo in linea con la stima");
  const span = Math.max(valuation.high - valuation.low, 1);
  const askPct = Math.max(0, Math.min(100, ((valuation.asking - valuation.low) / span) * 100));
  const midPct = Math.max(0, Math.min(100, ((valuation.mid - valuation.low) / span) * 100));

  return (
    <section className={cn("rounded-xl p-5", audience === "desk" ? "bg-ivory-deep" : "bg-paper")}>
      <p className="text-[11px] tracking-[0.16em] text-faint uppercase">
        {tx("Wycena ITALVIA", "Valutazione ITALVIA")}
      </p>
      <p className="mt-1 font-display text-2xl text-navy">{stance}</p>
      <p className="mt-1 text-sm text-muted">
        {tx("Widełki", "Forchetta")} {formatEur(valuation.low, false, locale)} – {formatEur(valuation.high, false, locale)}
      </p>
      <p className="text-sm text-navy">
        {tx("Środek", "Centro")} {formatEur(valuation.mid, false, locale)} · {formatEur(valuation.eurPerSqm, false, locale)}/m²
      </p>

      <div className="relative mt-5 h-2 rounded-full bg-line">
        <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sage" style={{ left: `${midPct}%` }} />
        <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta" style={{ left: `${askPct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-faint">
        <span>{tx("Cena ogłoszenia", "Prezzo chiesto")}</span>
        <span className="tabular-nums text-navy">{formatEur(valuation.asking, false, locale)}</span>
      </div>
      <p className="mt-1 text-[11px] text-muted">
        {valuation.deltaPct === 0
          ? tx("Równo ze środkiem wyceny.", "Allineato al centro della stima.")
          : valuation.deltaPct < 0
            ? tx(`${Math.abs(valuation.deltaPct)}% poniżej środka.`, `${Math.abs(valuation.deltaPct)}% sotto il centro.`)
            : tx(`${valuation.deltaPct}% powyżej środka.`, `${valuation.deltaPct}% sopra il centro.`)}
      </p>

      {valuation.reasons.length ? (
        <ul className="mt-4 space-y-1 text-xs text-muted">
          {valuation.reasons.map((r) => (
            <li key={r.it}>
              {r.pct > 0 ? "+" : ""}
              {r.pct}% · {audience === "desk" ? r.it : tx(r.pl, r.it)}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-faint">
        {audience === "desk"
          ? `Stima interna dai comparabili della selezione (${valuation.compsCount} confronti). Non è una perizia. Il venditore ${seller} decide se il compratore la vede.`
          : tx(
              `Sprzedawca ${seller} zgodził się pokazać tę wycenę. To szacunek z porównywalnych domów w selekcji (${valuation.compsCount}), nie operat szacunkowy ani wycena rzeczoznawcy.`,
              `Il venditore ${seller} ha scelto di mostrare questa stima. È un calcolo sui comparabili della selezione (${valuation.compsCount}), non una perizia.`,
            )}
      </p>
    </section>
  );
}
