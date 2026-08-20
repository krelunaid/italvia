import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

export function ScoresRow({
  match,
  documents,
  remote,
  compact = false,
}: {
  match: number;
  documents: number;
  remote: number;
  compact?: boolean;
}) {
  const { t } = useLang();
  return (
    <div className={cn("grid grid-cols-3", compact ? "gap-2" : "gap-3")}>
      <Score label={t("match")} value={`${match}/100`} bar={match} />
      <Score label={t("docs")} value={`${documents}/10`} bar={documents * 10} />
      <Score label={t("remote")} value={`${remote}/100`} bar={remote} />
    </div>
  );
}

function Score({ label, value, bar }: { label: string; value: string; bar: number }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-faint">{label}</p>
      <p className="font-display text-lg font-semibold tabular-nums text-navy">{value}</p>
      <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-terracotta" style={{ width: `${Math.max(6, Math.min(100, bar))}%` }} />
      </div>
    </div>
  );
}
