import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { PROPERTIES } from "@/data/properties";
import { asBuyerProfile, useCompare, useFavorites, useProfile } from "@/lib/hooks";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AppHeader } from "@/components/app-header";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/saved")({ component: Saved });

function Saved() {
  const { user, profile, authPending, loading } = useProfile();
  const favs = useFavorites();
  const cmp = useCompare();
  const bp = asBuyerProfile(profile);
  const { t, tx } = useLang();

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  const homes = PROPERTIES.filter((p) => favs.data?.includes(p.id));
  const compareCount = cmp.data?.length ?? 0;

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <h1 className="mt-6 font-display text-3xl text-navy">{t("saved")}</h1>
      <p className="text-sm text-muted">
        {tx("Domy, które chcesz porównać albo zobaczyć na żywo.", "Case da confrontare o vedere dal vivo.")}
      </p>
      <div className="mt-4 flex gap-2">
        <Button asChild variant={compareCount ? "default" : "outline"} disabled={!compareCount}>
          <Link to="/compare">
            {t("compare")} ({compareCount}/4)
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/trip">{tx("Dzień wizyt", "Giornata visite")}</Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-5">
        {homes.map((p) => (
          <PropertyCard key={p.id} property={p} profile={bp} />
        ))}
        {homes.length === 0 ? (
          <div className="rounded-xl bg-paper px-5 py-10 text-center">
            <p className="text-navy">{tx("Jeszcze nic nie zapisałeś.", "Non hai ancora salvato nulla.")}</p>
            <Link to="/search" className="mt-3 inline-block text-sm text-terracotta">
              {tx("Przejrzyj selekcję", "Sfoglia la selezione")}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
