import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LanguageSwitch } from "@/components/language-switch";
import { cn } from "@/lib/utils";

export function AppHeader({
  light = false,
  trailing,
  className,
  padded = true,
}: {
  light?: boolean;
  trailing?: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <header className={cn("relative z-50 flex items-center justify-between gap-3", padded && "px-5 py-4", className)}>
      <Logo light={light} />
      <div className="flex items-center gap-2">
        <LanguageSwitch light={light} />
        {trailing}
      </div>
    </header>
  );
}
