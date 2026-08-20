import { cn } from "@/lib/utils";
import { planeOf } from "@/lib/offer-stage";
import type { Offer } from "@/lib/server/offers";

const PLANES = [
  { n: 1 as const, it: "Proponi un prezzo", pl: "Cena", hint: "Nie wiąże" },
  { n: 2 as const, it: "Proposta ufficiale", pl: "Dokument", hint: "eIDAS" },
  { n: 3 as const, it: "Versa la caparra", pl: "Pieniądze", hint: "SEPA" },
];

export function PlaneTrack({ offer, className }: { offer: Offer | null; className?: string }) {
  const plane = planeOf(offer);
  const closed = offer && ["withdrawn", "declined", "refused", "expired"].includes(offer.status);
  return (
    <ol className={cn("grid grid-cols-3 gap-1", className)}>
      {PLANES.map((p) => {
        const done = !closed && plane > p.n;
        const current = !closed && plane === p.n && Boolean(offer);
        return (
          <li
            key={p.n}
            className={cn(
              "rounded-md px-2 py-2.5 text-center",
              done && "bg-sage-soft",
              current && "bg-navy text-paper",
              !done && !current && "bg-paper text-muted",
            )}
          >
            <span className={cn("block text-[10px] tracking-[0.14em] uppercase", current ? "text-sand" : "text-faint")}>
              {p.n}. {p.pl}
            </span>
            <span className={cn("mt-0.5 block text-[11px]", current ? "text-paper/80" : "text-faint")}>{p.hint}</span>
          </li>
        );
      })}
    </ol>
  );
}
