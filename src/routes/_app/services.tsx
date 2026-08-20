import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listServices, requestService } from "@/lib/server/italvia";
import { useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/services")({ component: Services });

const KINDS = [
  { id: "utilities", pl: "Utenze i internet", it: "Utenze e internet" },
  { id: "insurance", pl: "Ubezpieczenie", it: "Assicurazione" },
  { id: "cleaning", pl: "Sprzątanie", it: "Pulizie" },
  { id: "keys", pl: "Przechowanie kluczy", it: "Custodia chiavi" },
  { id: "checks", pl: "Okresowe kontrole", it: "Controlli periodici" },
  { id: "garden", pl: "Ogród i basen", it: "Giardino e piscina" },
  { id: "renovation", pl: "Remont", it: "Ristrutturazione" },
  { id: "furniture", pl: "Urządzenie", it: "Arredo" },
  { id: "tech", pl: "Technik lokalny", it: "Tecnico locale" },
  { id: "bills", pl: "Opłaty i przypomnienia", it: "Bollette e scadenze" },
  { id: "care", pl: "Opieka podczas nieobecności", it: "Cura in assenza" },
  { id: "rental", pl: "Przygotowanie pod najem", it: "Preparazione alla locazione" },
];

function Services() {
  const { user, profile, authPending, loading } = useProfile();
  const { lang, t, tx } = useLang();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["services", user?.id], queryFn: () => listServices(), enabled: Boolean(user) });

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <p className="mt-2 text-xs text-faint">
        <Link to="/profile">{t("navProfile")}</Link>
      </p>
      <h1 className="mt-4 font-display text-3xl text-navy">Moja casa in Italia</h1>
      <p className="text-sm text-muted">
        {tx("Po kluczach relacja się nie kończy. Tu prosisz o opiekę nad domem.", "Dopo le chiavi il rapporto continua. Qui chiedi la cura della casa.")}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            className="rounded-lg bg-paper px-3 py-4 text-left text-sm text-navy"
            onClick={async () => {
              await requestService({ data: { kind: k.id } });
              await qc.invalidateQueries({ queryKey: ["services"] });
              toast(tx("Zgłoszenie wysłane do Chiary.", "Richiesta inviata a Chiara."));
            }}
          >
            {lang === "it" ? k.it : k.pl}
          </button>
        ))}
      </div>
      <h2 className="mt-8 font-display text-xl text-navy">{tx("Twoje zgłoszenia", "Le tue richieste")}</h2>
      <ul className="mt-2 space-y-2">
        {(q.data ?? []).map((s) => (
          <li key={s.id} className="rounded-md bg-paper px-3 py-2 text-sm text-navy">
            {(lang === "it" ? KINDS.find((k) => k.id === s.kind)?.it : KINDS.find((k) => k.id === s.kind)?.pl) ?? s.kind} · {s.status}
          </li>
        ))}
      </ul>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/profile">{t("back")}</Link>
      </Button>
    </div>
  );
}
