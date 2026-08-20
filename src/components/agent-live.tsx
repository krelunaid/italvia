import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Video } from "lucide-react";
import { AGENT_TODAY } from "@/data/life";
import { getMyLive, peekLive } from "@/lib/server/live";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AgentLive({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { lang, tx } = useLang();
  const { user } = useCurrentUserState();
  const q = useQuery({
    queryKey: ["live-peek", user?.id ?? "anon"],
    queryFn: () => (user ? getMyLive() : peekLive()),
    refetchInterval: 4000,
  });
  const live = q.data;

  if (live) {
    const dest = user
      ? ({ to: "/live/$id" as const, params: { id: live.id } })
      : ({ to: "/login" as const, params: undefined });
    return (
      <Link
        to={dest.to}
        params={dest.params}
        className={cn("flex items-center gap-3 rounded-xl bg-terracotta p-3 text-paper", className)}
      >
        <span className="relative shrink-0">
          <img src={AGENT_TODAY.photo} alt="" className="size-12 rounded-full object-cover" />
          <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-terracotta bg-paper rec-dot" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] tracking-[0.16em] uppercase">
            Live · {live.city}
            {live.chatEnabled ? "" : tx(" · bez czatu", " · senza chat")}
          </span>
          <span className={cn("mt-0.5 block leading-snug", compact ? "text-sm" : "font-display text-lg")}>
            {tx("Chiara jest na tarasie. Wejdź — zaproszenie jest aktywne.", "Chiara è sul terrazzo. Entra — l’invito è attivo.")}
          </span>
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-paper">
          <Video className="size-4" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/homes/$id"
      params={{ id: AGENT_TODAY.propertyId }}
      className={cn("flex items-center gap-3 rounded-xl bg-navy p-3 text-paper", className)}
    >
      <span className="relative shrink-0">
        <img src={AGENT_TODAY.photo} alt="" className="size-12 rounded-full object-cover" />
        <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-navy bg-sage" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] tracking-[0.16em] text-sand uppercase">
          {tx("Teraz", "Ora")} · {AGENT_TODAY.city}
        </span>
        <span className={cn("mt-0.5 block leading-snug", compact ? "text-sm" : "font-display text-lg")}>
          {lang === "it" ? AGENT_TODAY.lineIt : AGENT_TODAY.linePl}
        </span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-terracotta text-paper">
        <Video className="size-4" />
      </span>
    </Link>
  );
}
