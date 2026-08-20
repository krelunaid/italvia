import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listMyOffers } from "@/lib/server/offers";
import { getProperty } from "@/data/properties";
import { kindLabel, statusLabel } from "@/lib/offer-labels";
import { formatEur } from "@/lib/money";
import { useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AppHeader } from "@/components/app-header";
import { PlaneTrack } from "@/components/plane-track";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/offers/")({ component: OffersList });

function OffersList() {
  const { user, profile, authPending, loading } = useProfile();
  const { lang, t, tx, locale } = useLang();
  const q = useQuery({ queryKey: ["offers", user?.id], queryFn: () => listMyOffers(), enabled: Boolean(user) });

  if (authPending || loading) return <div className="grid min-h-[40vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  const offers = q.data ?? [];

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <h1 className="mt-6 font-display text-3xl text-navy">{tx("Oferty i caparra", "Offerte e caparra")}</h1>
      <p className="text-sm text-muted">
        {tx("Trzy rzeczy osobno: cena, dokument, pieniądze. Nigdy koszyk sklepu.", "Tre cose separate: prezzo, documento, denaro. Mai un carrello.")}
      </p>
      <PlaneTrack offer={offers[0] ?? null} className="mt-4" />
      <ul className="mt-6 space-y-3">
        {offers.map((o) => {
          const p = getProperty(o.propertyId);
          return (
            <li key={o.id}>
              <Link to="/offers/$id" params={{ id: o.id }} className="block rounded-xl bg-paper p-4">
                <p className="text-xs text-faint">
                  {kindLabel(o.kind, lang)} · {statusLabel(o.status, lang)}
                </p>
                <p className="font-display text-xl text-navy">{p?.city ?? o.propertyId}</p>
                <p className="text-sm tabular-nums text-muted">
                  {formatEur(o.offerEur, false, locale)} · {o.depositKind} {formatEur(o.depositEur, false, locale)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
      {offers.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          {tx("Nie ma jeszcze oferty. Wejdź w dom i wybierz", "Non c’è ancora un’offerta. Entra in una casa e scegli")}{" "}
          <Link to="/search" className="text-terracotta">
            {tx("Złóż ofertę", "Fai un’offerta")}
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
