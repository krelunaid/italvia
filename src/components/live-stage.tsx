import { Lock, Radio, User, Users } from "lucide-react";
import { AGENT_TODAY } from "@/data/life";
import { tourOf, type TourSpot } from "@/data/live-tour";
import type { LivePeek } from "@/lib/server/live";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LiveStage({
  peek,
  spot,
  className,
}: {
  peek: LivePeek;
  spot: TourSpot;
  className?: string;
}) {
  const { lang, tx } = useLang();
  return (
    <div className={cn("relative overflow-hidden bg-navy text-paper", className)}>
      <img key={spot.id} src={spot.image} alt="" className="absolute inset-0 size-full object-cover kenburns" />
      <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/35 to-navy/15" />

      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-terracotta px-3 text-[11px] font-medium tracking-[0.16em] uppercase">
          <span className="size-2 rounded-full bg-paper rec-dot" />
          Live
        </span>
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-navy/70 px-3 text-[11px] tracking-wide backdrop-blur-sm">
          {peek.audience === "selected" ? <User className="size-3.5" /> : <Users className="size-3.5" />}
          {peek.audience === "selected"
            ? tx("Zaproszenie wybrane", "Invito selezionato")
            : tx(`${peek.watching} ogląda`, `${peek.watching} in visione`)}
        </span>
        {peek.chatEnabled ? null : (
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-navy/70 px-3 text-[11px] tracking-wide backdrop-blur-sm">
            <Lock className="size-3.5" />
            {tx("Bez czatu", "Senza chat")}
          </span>
        )}
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <img src={AGENT_TODAY.photo} alt="" className="size-11 rounded-full object-cover ring-2 ring-paper/80" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-5">
        <p className="text-[11px] tracking-[0.2em] text-sand uppercase">
          {tx("Chiara · taras", "Chiara · terrazzo")} · {peek.city}
        </p>
        <h2 className="font-display text-3xl leading-tight md:text-4xl">
          {lang === "it" ? spot.labelIt : spot.labelPl}
        </h2>
        <div
          className={cn(
            "inline-flex min-h-8 items-center rounded-full px-3 text-[11px] font-medium tracking-[0.14em] uppercase",
            spot.inSale ? "bg-sage text-paper" : "bg-danger text-paper",
          )}
        >
          {spot.inSale
            ? tx("Wchodzi w sprzedaż", "Entra in vendita")
            : tx("Nie wchodzi w sprzedaż", "Non entra in vendita")}
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-paper/85">
          {lang === "it" ? spot.noteIt : spot.notePl}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-sand">
          <Lock className="size-3.5" />
          {peek.chatEnabled
            ? tx(
                "Bez czatu grupowego. Pytania tylko prywatnie do Chiary.",
                "Niente chat di gruppo. Domande solo in privato a Chiara.",
              )
            : tx("Czat wyłączony. Tylko oglądasz.", "Chat spenta. Solo visione.")}
        </p>
      </div>
    </div>
  );
}

export function SpotStrip({
  propertyId,
  currentId,
  onPick,
  disabled,
}: {
  propertyId: string;
  currentId: string;
  onPick?: (id: string) => void;
  disabled?: boolean;
}) {
  const { lang, tx } = useLang();
  const tour = tourOf(propertyId);
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tour.map((s) => {
        const active = s.id === currentId;
        return (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onPick?.(s.id)}
            className={cn(
              "relative h-20 w-28 shrink-0 overflow-hidden rounded-md",
              active ? "ring-2 ring-terracotta" : "ring-1 ring-paper/15",
              disabled && "cursor-default",
            )}
          >
            <img src={s.image} alt="" className="size-full object-cover" />
            <span className="absolute inset-0 bg-navy/35" />
            <span
              className={cn(
                "absolute top-1.5 left-1.5 size-2 rounded-full",
                s.inSale ? "bg-sage" : "bg-danger",
              )}
            />
            <span className="absolute inset-x-0 bottom-0 truncate px-1.5 pb-1 text-[10px] text-paper">
              {lang === "it" ? s.labelIt : s.labelPl}
            </span>
          </button>
        );
      })}
      <p className="sr-only">
        {tx("Zielony: w sprzedaży. Czerwony: poza transakcją.", "Verde: in vendita. Rosso: fuori vendita.")}
      </p>
    </div>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-terracotta", className)}>
      <Radio className="size-3.5" />
      <span className="size-1.5 rounded-full bg-terracotta rec-dot" />
    </span>
  );
}
