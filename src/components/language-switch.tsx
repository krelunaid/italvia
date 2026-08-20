import type { PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { useLang, writeLang, type Lang } from "@/lib/i18n";

export function LanguageSwitch({
  light = false,
  compact = false,
  className,
}: {
  light?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { lang, setLang, t } = useLang();

  function pick(next: Lang, e: PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    writeLang(next);
    setLang(next);
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "relative z-50 inline-flex rounded-full p-0.5",
        light ? "bg-navy/55 ring-1 ring-paper/25 backdrop-blur-sm" : "bg-ivory-deep ring-1 ring-line",
        className,
      )}
    >
      {(["pl", "it"] as const).map((code) => {
        const active = lang === code;
        const full = code === "pl" ? "Polski" : "Italiano";
        return (
          <button
            key={code}
            type="button"
            onPointerDown={(e) => pick(code, e)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              writeLang(code);
              setLang(code);
            }}
            aria-pressed={active}
            aria-label={full}
            title={full}
            className={cn(
              "rounded-full font-medium uppercase tracking-[0.12em] transition-colors",
              compact ? "min-h-10 px-2.5 text-[11px]" : "min-h-11 px-3.5 text-xs",
              active
                ? light
                  ? "bg-paper text-navy"
                  : "bg-navy text-paper"
                : light
                  ? "text-paper/80 hover:text-paper"
                  : "text-muted hover:text-navy",
            )}
          >
            {compact ? code : full}
          </button>
        );
      })}
    </div>
  );
}
