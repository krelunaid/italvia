import { useEffect, useState } from "react";
import { hoursLeft } from "@/lib/offer-stage";
import { LEGAL } from "@/data/legal";

export function Countdown72({ deadline }: { deadline: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!deadline) return null;
  const end = new Date(deadline).getTime();
  const ms = Math.max(0, end - now);
  const expired = ms <= 0;
  const h = Math.floor(ms / 36e5);
  const m = Math.floor((ms % 36e5) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  const left = hoursLeft(deadline) ?? 0;
  const pct = expired ? 0 : Math.min(1, left / 72);
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = `${c * pct} ${c}`;

  return (
    <div className="rounded-xl bg-navy px-5 py-5 text-paper">
      <p className="text-xs tracking-[0.18em] text-sand uppercase">72 godziny · pieniądze stoją</p>
      <div className="mt-4 flex items-center gap-5">
        <svg viewBox="0 0 96 96" className="size-24 shrink-0" aria-hidden>
          <circle cx="48" cy="48" r={r} fill="none" stroke="#2a3d63" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="#c45c3e"
            strokeWidth="8"
            strokeDasharray={dash}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
          />
        </svg>
        <div>
          {expired ? (
            <p className="font-display text-3xl">Czas minął</p>
          ) : (
            <p className="font-display text-4xl tabular-nums">
              {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
            </p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-paper/75">{LEGAL.frozenPl}</p>
        </div>
      </div>
    </div>
  );
}
