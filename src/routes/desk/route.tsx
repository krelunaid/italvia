import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { Building2, CalendarDays, FilePen, LayoutDashboard, Radio, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { AuthSlot } from "@/components/auth-slot";
import { LanguageSwitch } from "@/components/language-switch";
import { cn } from "@/lib/utils";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProfile } from "@/lib/hooks";
import { setMyRole } from "@/lib/server/italvia";
import { readGate } from "@/lib/gate";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/desk")({ component: DeskLayout });

const NAV = [
  { to: "/desk", label: "Oggi" as const, icon: LayoutDashboard },
  { to: "/desk/live", label: "Terrazzo" as const, icon: Radio },
  { to: "/desk/offers", label: "Offerte" as const, icon: FilePen },
  { to: "/desk/leads", label: "Clienti" as const, icon: Users },
  { to: "/desk/homes", label: "Immobili" as const, icon: Building2 },
  { to: "/desk/calendar", label: "Agenda" as const, icon: CalendarDays },
] as const;

function DeskLayout() {
  const { user, isPending } = useCurrentUserState();
  const { profile, loading } = useProfile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (isPending || loading || !user) return;
    if (profile?.role === "agent") return;
    if (readGate() !== "agent") return;
    let alive = true;
    setPromoting(true);
    void setMyRole({ data: "agent" }).then(async () => {
      await qc.invalidateQueries({ queryKey: ["profile"] });
      if (alive) setPromoting(false);
    });
    return () => {
      alive = false;
    };
  }, [isPending, loading, user, profile?.role, qc]);

  if (isPending || loading || promoting) {
    return <div className="grid min-h-dvh place-items-center bg-ivory text-muted">Caricamento desk…</div>;
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  if (profile?.role !== "agent") return <Navigate to="/login" search={{ as: "agent" }} />;

  return (
    <div className="min-h-dvh bg-ivory md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line bg-navy px-4 py-4 text-paper md:min-h-dvh md:border-b-0 md:border-r md:border-navy-soft">
        <Logo light />
        <p className="mt-1 text-[11px] tracking-wider text-sand uppercase">Desk · italiano</p>
        <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col">
          {NAV.map((n) => {
            const active = n.to === "/desk" ? pathname === "/desk" : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm",
                  active ? "bg-paper/15 text-paper" : "text-paper/70",
                )}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center justify-between gap-3 md:hidden">
          <LanguageSwitch light compact />
          <AuthSlot light />
        </div>
        <div className="mt-6 hidden md:block">
          <LanguageSwitch light className="mb-4" />
          <AuthSlot light />
          <Link to="/home" className="mt-3 block text-xs text-sand">
            Vista compratore
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
