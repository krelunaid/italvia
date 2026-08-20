import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Heart, MessageCircle, Route, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang, type CopyKey } from "@/lib/i18n";

const ITEMS: { to: "/home" | "/saved" | "/journey" | "/messages" | "/profile"; key: CopyKey; icon: typeof Compass }[] = [
  { to: "/home", key: "navDiscover", icon: Compass },
  { to: "/saved", key: "navSaved", icon: Heart },
  { to: "/journey", key: "navJourney", icon: Route },
  { to: "/messages", key: "navMessages", icon: MessageCircle },
  { to: "/profile", key: "navProfile", icon: UserRound },
];

export function BuyerNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLang();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-sm">
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {ITEMS.map((item) => {
          const active = pathname === item.to || (item.to !== "/home" && pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px]",
                  active ? "text-terracotta" : "text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
