import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getInbox } from "@/lib/server/italvia";
import { useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AppHeader } from "@/components/app-header";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/messages/")({ component: Messages });

function Messages() {
  const { user, profile, authPending, loading } = useProfile();
  const { t, tx } = useLang();
  const q = useQuery({
    queryKey: ["inbox", user?.id],
    queryFn: () => getInbox(),
    enabled: Boolean(user),
  });

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  const items = q.data ?? [];

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <h1 className="mt-6 font-display text-3xl text-navy">{t("navMessages")}</h1>
      <p className="text-sm text-muted">
        {tx("Piszesz w swoim języku. Chiara czyta po włosku.", "Scrivi nella tua lingua. Chiara legge in italiano.")}
      </p>
      <ul className="mt-6 divide-y divide-line rounded-xl bg-paper">
        {items.map((c) => (
          <li key={c.id}>
            <Link to="/messages/$id" params={{ id: c.id }} className="block px-4 py-4">
              <p className="font-medium text-navy">{c.title ?? "Chiara Moretti"}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {c.last?.sender_role === "agent" ? c.last.body_translated ?? c.last.body_original : c.last?.body_original}
              </p>
            </Link>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted">{tx("Brak wątków.", "Nessuna conversazione.")}</li>
        ) : null}
      </ul>
    </div>
  );
}
