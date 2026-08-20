import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { PROPERTIES, completedChecks } from "@/data/properties";
import { estimatePurchase } from "@/lib/costs";
import { estimateLifeFromPoland } from "@/lib/life-cost";
import { seasonOf } from "@/data/life";
import { formatEur } from "@/lib/money";
import { asBuyerProfile, useCompare, useProfile } from "@/lib/hooks";
import { matchScore, remoteScore } from "@/lib/score";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/compare")({ component: Compare });

function Compare() {
  const { user, profile, authPending, loading } = useProfile();
  const cmp = useCompare();
  const bp = asBuyerProfile(profile);
  const { t, tx, locale } = useLang();

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  const homes = PROPERTIES.filter((p) => cmp.data?.includes(p.id)).slice(0, 4);
  if (homes.length < 2) {
    return (
      <div className="px-5 py-8">
        <AppHeader padded={false} />
        <p className="mt-8 text-navy">
          {tx("Dodaj co najmniej dwa domy do porównania z karty nieruchomości.", "Aggiungi almeno due case dal foglio immobile.")}
        </p>
        <Button asChild className="mt-4">
          <Link to="/search">{t("selection")}</Link>
        </Button>
      </div>
    );
  }

  const conditionOf = (id: string) => {
    const p = PROPERTIES.find((x) => x.id === id)!;
    if (p.condition === "ready") return tx("Gotowe", "Pronto");
    if (p.condition === "light") return tx("Lekki remont", "Lavori leggeri");
    return tx("Remont", "Ristrutturazione");
  };

  const rows: { label: string; value: (id: string) => string }[] = [
    { label: tx("Cena", "Prezzo"), value: (id) => formatEur(PROPERTIES.find((p) => p.id === id)!.priceEur, false, locale) },
    {
      label: tx("Koszt całkowity", "Costo complessivo"),
      value: (id) => formatEur(estimatePurchase(PROPERTIES.find((p) => p.id === id)!).totalMid, false, locale),
    },
    {
      label: tx("Morze", "Mare"),
      value: (id) => {
        const p = PROPERTIES.find((x) => x.id === id)!;
        return p.seaKm == null ? "—" : `${p.seaKm} km`;
      },
    },
    { label: tx("Lotnisko", "Aeroporto"), value: (id) => `${PROPERTIES.find((p) => p.id === id)!.airport.minutes} min` },
    { label: t("docs"), value: (id) => `${completedChecks(PROPERTIES.find((p) => p.id === id)!)}/10` },
    { label: t("match"), value: (id) => `${matchScore(bp, PROPERTIES.find((p) => p.id === id)!)}/100` },
    { label: t("remote"), value: (id) => `${remoteScore(PROPERTIES.find((p) => p.id === id)!)}/100` },
    {
      label: tx("Prace", "Lavori"),
      value: (id) => {
        const p = PROPERTIES.find((x) => x.id === id)!;
        return p.renovationMax === 0
          ? tx("Brak", "Nessuno")
          : `${formatEur(p.renovationMin, false, locale)}–${formatEur(p.renovationMax, false, locale)}`;
      },
    },
    { label: tx("Wspólnota / rok", "Condominio / anno"), value: (id) => formatEur(PROPERTIES.find((p) => p.id === id)!.condoAnnual, false, locale) },
    { label: tx("Stan", "Stato"), value: conditionOf },
    {
      label: tx("Zimą", "D’inverno"),
      value: (id) => {
        const s = seasonOf(id);
        return s?.winterLives ? tx("Miasto żyje", "La città vive") : tx("Cisza poza sezonem", "Silenzio fuori stagione");
      },
    },
    {
      label: tx("Utrzymanie / mies.", "Tenuta / mese"),
      value: (id) => {
        const life = estimateLifeFromPoland(PROPERTIES.find((p) => p.id === id)!);
        return `${formatEur(life.monthMin, false, locale)}–${formatEur(life.monthMax, false, locale)}`;
      },
    },
  ];

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <h1 className="mt-6 font-display text-3xl text-navy">{tx("Porównanie", "Confronto")}</h1>
      <p className="text-sm text-muted">
        {tx("Nie „który najładniejszy”, tylko który naprawdę do Ciebie pasuje.", "Non «il più bello», ma quello che ti sta davvero.")}
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-ivory p-2 text-left text-faint font-medium"> </th>
              {homes.map((h) => (
                <th key={h.id} className="p-2 text-left">
                  <Link to="/homes/$id" params={{ id: h.id }} className="block">
                    <img src={h.images[0]} alt="" className="mb-2 h-20 w-full rounded-md object-cover" />
                    <span className="font-display text-base text-navy">{h.city}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th className="sticky left-0 bg-ivory p-2 text-left text-xs font-medium text-muted">{row.label}</th>
                {homes.map((h) => (
                  <td key={h.id} className="p-2 tabular-nums text-navy">
                    {row.value(h.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
