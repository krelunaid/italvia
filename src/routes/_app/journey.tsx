import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JOURNEY } from "@/data/journey";
import { getJourney, advanceJourney } from "@/lib/server/italvia";
import { useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/journey")({ component: Journey });

function Journey() {
  const { user, profile, authPending, loading } = useProfile();
  const qc = useQueryClient();
  const { lang, t, tx } = useLang();
  const q = useQuery({
    queryKey: ["journey", user?.id],
    queryFn: () => getJourney(),
    enabled: Boolean(user),
  });

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  const map = new Map((q.data ?? []).map((s) => [s.step_id, s]));

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <h1 className="mt-6 font-display text-3xl text-navy">{tx("Proces zakupu", "Percorso d’acquisto")}</h1>
      <p className="text-sm text-muted">{t("notaryFree")}</p>
      <ol className="mt-8 space-y-0">
        {JOURNEY.map((step, i) => {
          const row = map.get(step.id);
          const status = row?.status ?? (i === 0 ? "done" : "pending");
          return (
            <li key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full text-xs",
                    status === "done" && "bg-sage text-paper",
                    status === "current" && "bg-terracotta text-paper",
                    status === "pending" && "bg-line text-muted",
                  )}
                >
                  {status === "done" ? <Check className="size-4" /> : i + 1}
                </span>
                {i < JOURNEY.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
              </div>
              <div className="pb-8">
                <p className="font-medium text-navy">{lang === "it" ? step.labelIt : step.labelPl}</p>
                <p className="text-xs text-faint">{lang === "it" ? step.labelPl : step.labelIt}</p>
                <p className="mt-1 text-sm text-muted">
                  {tx("Działa:", "Agisce:")} {lang === "it" ? step.actorIt : step.actorPl}
                </p>
                {status === "current" && step.id === "offer" ? (
                  <Button asChild size="sm" className="mt-3">
                    <Link to="/offers">{tx("Otwórz oferty", "Apri le offerte")}</Link>
                  </Button>
                ) : status === "current" ? (
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={async () => {
                      await advanceJourney({ data: step.id });
                      await qc.invalidateQueries({ queryKey: ["journey"] });
                    }}
                  >
                    {tx("Oznacz jako zrobione", "Segna come fatto")}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="rounded-xl bg-paper p-4 text-sm text-muted">
        {tx("Następny spokojny krok:", "Il prossimo passo calmo:")}{" "}
        <Link to="/messages" className="text-terracotta">
          {tx("napisz do Chiary", "scrivi a Chiara")}
        </Link>{" "}
        {tx("albo", "oppure")}{" "}
        <Link to="/search" className="text-terracotta">
          {tx("dopisz domy do selekcji", "aggiungi case alla selezione")}
        </Link>
        .
      </div>
    </div>
  );
}
