import { useCallback, useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeasonStory } from "@/data/life";
import { useLang } from "@/lib/i18n";

export function SeasonTwin({
  summer,
  winter,
  story,
  className,
}: {
  summer: string;
  winter: string;
  story: SeasonStory;
  className?: string;
}) {
  const { lang, tx } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(48);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPct(Math.max(6, Math.min(94, next)));
  }, []);

  return (
    <div className={cn("overflow-hidden rounded-xl bg-navy", className)}>
      <div
        ref={box}
        className="relative aspect-[3/2] cursor-ew-resize select-none touch-none"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) move(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <img src={summer} alt={tx("Sierpień", "Agosto")} className="absolute inset-0 size-full object-cover" />
        <img
          src={winter}
          alt={tx("Styczeń", "Gennaio")}
          className="absolute inset-0 size-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        />
        <div className="absolute inset-y-0 z-10 w-px bg-paper" style={{ left: `${pct}%` }}>
          <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-paper/80 bg-navy text-paper">
            <ChevronsLeftRight className="size-4" />
          </span>
        </div>
        <p className="absolute top-3 left-3 rounded-full bg-navy/70 px-3 py-1 text-[11px] tracking-[0.16em] text-paper uppercase">
          {tx("Styczeń", "Gennaio")}
        </p>
        <p className="absolute top-3 right-3 rounded-full bg-navy/70 px-3 py-1 text-[11px] tracking-[0.16em] text-paper uppercase">
          {tx("Sierpień", "Agosto")}
        </p>
      </div>
      <div className="px-4 py-4">
        <p className="font-display text-xl leading-snug text-paper">{lang === "it" ? story.honestyIt : story.honestyPl}</p>
        <p className="mt-2 text-sm leading-relaxed text-sand">{lang === "it" ? story.winterIt : story.winterPl}</p>
        <p className="mt-1 text-xs italic text-paper/55">{lang === "it" ? story.summerIt : story.summerPl}</p>
      </div>
    </div>
  );
}

export function SeasonToggle({
  value,
  onChange,
}: {
  value: "summer" | "winter";
  onChange: (v: "summer" | "winter") => void;
}) {
  const { tx } = useLang();
  return (
    <div className="inline-flex rounded-full bg-navy/70 p-1 text-[11px] tracking-wide text-paper backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange("summer")}
        className={cn("rounded-full px-3 py-1.5", value === "summer" ? "bg-paper text-navy" : "text-paper/80")}
      >
        {tx("Sierpień", "Agosto")}
      </button>
      <button
        type="button"
        onClick={() => onChange("winter")}
        className={cn("rounded-full px-3 py-1.5", value === "winter" ? "bg-paper text-navy" : "text-paper/80")}
      >
        {tx("Styczeń", "Gennaio")}
      </button>
    </div>
  );
}
