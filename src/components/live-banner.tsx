import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { getMyLive, peekLive } from "@/lib/server/live";
import { useLang } from "@/lib/i18n";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function LiveBanner() {
  const { tx } = useLang();
  const { user } = useCurrentUserState();
  const q = useQuery({
    queryKey: ["live-peek", user?.id ?? "anon"],
    queryFn: () => (user ? getMyLive() : peekLive()),
    refetchInterval: 4000,
  });
  const live = q.data;
  if (!live) return null;

  const href = user ? `/live/${live.id}` : "/login";

  return (
    <Link to={href} className="flex items-center gap-3 bg-terracotta px-4 py-2.5 text-paper">
      <span className="relative grid size-9 place-items-center rounded-full bg-paper/15">
        <Radio className="size-4" />
        <span className="absolute top-1 right-1 size-2 rounded-full bg-paper rec-dot" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] tracking-[0.16em] uppercase">
          {live.audience === "selected"
            ? tx("Zaproszenie na taras", "Invito sul terrazzo")
            : tx("Na żywo z tarasu", "In diretta dal terrazzo")}
        </span>
        <span className="block truncate text-sm">
          {tx(`Chiara pokazuje ${live.city}`, `Chiara mostra ${live.city}`)}
          {live.chatEnabled ? "" : tx(" · bez czatu", " · senza chat")}
        </span>
      </span>
      <span className="text-xs font-medium tracking-wide uppercase">{tx("Wejdź", "Entra")}</span>
    </Link>
  );
}
