import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useProfile } from "@/lib/hooks";
import { listActivity, listDocuments } from "@/lib/server/italvia";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { formatEur } from "@/lib/money";
import { FileText, Lock, Shield } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, profile, authPending, loading } = useProfile();
  const { t, tx, locale } = useLang();
  const docs = useQuery({ queryKey: ["docs", user?.id], queryFn: () => listDocuments(), enabled: Boolean(user) });
  const log = useQuery({ queryKey: ["activity", user?.id], queryFn: () => listActivity(), enabled: Boolean(user) });

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <h1 className="mt-6 font-display text-3xl text-navy">{profile.displayName ?? user.displayName}</h1>
      <p className="text-sm text-muted">{user.primaryEmail}</p>

      <section className="mt-6 rounded-xl bg-paper p-5">
        <p className="text-xs uppercase tracking-wider text-faint">{t("yourProject")}</p>
        <ul className="mt-2 space-y-1 text-navy">
          <li>{purposeLabel(profile.purpose, tx)}</li>
          <li>{profile.budgetEur ? `${tx("Budżet", "Budget")} ${formatEur(profile.budgetEur, false, locale)}` : null}</li>
          <li>
            {settingLabel(profile.setting, tx)} · {profile.condition === "ready" ? tx("gotowe", "pronto") : tx("do prac", "da lavori")}
          </li>
          <li>
            {profile.polishCity} → {profile.preferredAirport}
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-2xl text-navy">
          <Lock className="size-5 text-terracotta" />
          {tx("Cassaforte dokumentów", "Cassaforte documenti")}
        </h2>
        <ul className="mt-3 divide-y divide-line rounded-xl bg-paper">
          {(docs.data ?? []).map((d) => (
            <li key={d.id} className="flex items-start gap-3 px-4 py-3">
              <FileText className="mt-0.5 size-4 text-muted" />
              <div>
                <p className="text-sm text-navy">{d.title}</p>
                <p className="text-[11px] text-faint">
                  {d.lang.toUpperCase()} ·{" "}
                  {d.translation_kind === "auto"
                    ? tx("tłumaczenie automatyczne", "traduzione automatica")
                    : d.translation_kind === "professional"
                      ? tx("tłumaczenie profesjonalne", "traduzione professionale")
                      : tx("oryginał", "originale")}
                  {d.locked ? tx(" · zablokowany podpis", " · firma bloccata") : ""}
                </p>
                {d.summary ? <p className="mt-1 text-xs text-muted">{d.summary}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-3">
        <Button asChild variant="outline">
          <Link to="/offers">{tx("Oferty, propozycje, caparra", "Offerte, proposte, caparra")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/services">{tx("Moja casa in Italia — po zakupie", "La mia casa in Italia — dopo l’acquisto")}</Link>
        </Button>
        {profile.role === "agent" ? (
          <Button asChild variant="outline">
            <Link to="/desk">{tx("Otwórz ITALVIA Desk", "Apri ITALVIA Desk")}</Link>
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => void signOut("/")}>
          {t("signOut")}
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-sm font-medium text-navy">
          <Shield className="size-4" />
          {tx("Rejestr aktywności", "Registro attività")}
        </h2>
        <ul className="mt-2 space-y-1 text-xs text-faint">
          {(log.data ?? []).slice(0, 12).map((a) => (
            <li key={a.id}>
              {String(a.created_at).replace("T", " ").slice(0, 16)} · {a.action}
              {a.meta ? ` · ${a.meta}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function purposeLabel(p: string | null, tx: (pl: string, it: string) => string) {
  if (p === "vacation") return tx("Wakacje", "Casa per le vacanze");
  if (p === "relocation") return tx("Przeprowadzka", "Trasferimento");
  if (p === "investment") return tx("Inwestycja", "Investimento");
  if (p === "retirement") return tx("Emerytura", "Pensione");
  return p ?? "";
}

function settingLabel(s: string | null, tx: (pl: string, it: string) => string) {
  if (s === "sea") return tx("Morze", "Mare");
  if (s === "city") return tx("Miasto", "Città");
  if (s === "countryside") return tx("Wieś", "Campagna");
  if (s === "lake") return tx("Jezioro", "Lago");
  if (s === "mountain") return tx("Góry", "Montagna");
  return s ?? "";
}
