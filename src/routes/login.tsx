import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/app-header";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useLang } from "@/lib/i18n";
import { rememberGate } from "@/lib/gate";
import { setMyRole } from "@/lib/server/italvia";
import { AGENT_EMAIL, AGENT_PASSWORD, resolveLoginEmail } from "@/lib/login-alias";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { as?: "agent" } =>
    s.as === "agent" ? { as: "agent" } : {},
  component: Login,
});

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { as } = Route.useSearch();
  const agent = as === "agent";
  const { t, tx } = useLang();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("italvia");
  const [password, setPassword] = useState(AGENT_PASSWORD);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    rememberGate(agent ? "agent" : "buyer");
  }, [agent]);

  async function enterAsAgent() {
    setBusy(true);
    setError(null);
    try {
      rememberGate("agent");
      await setMyRole({ data: "agent" });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      await navigate({ to: "/desk" });
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("Nie udało się", "Non riuscito"));
    } finally {
      setBusy(false);
    }
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const loginEmail = resolveLoginEmail(email);
      if (mode === "up") {
        const res = await authClient.signUp.email({ email: loginEmail, password, name: name || loginEmail.split("@")[0] });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email: loginEmail, password });
        if (res.error) throw new Error(res.error.message);
      }
      const asAgent = agent || loginEmail === AGENT_EMAIL;
      rememberGate(asAgent ? "agent" : "buyer");
      if (asAgent) {
        await setMyRole({ data: "agent" });
        await qc.invalidateQueries({ queryKey: ["profile"] });
        await navigate({ to: "/desk" });
      } else {
        await navigate({ to: "/onboarding" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("Nie udało się zalogować", "Accesso non riuscito"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-navy">
      <img src="/homes/hero.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-navy/55" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-end px-5 pb-10 pt-8">
        <AppHeader light padded={false} className="mb-auto" />
        <div className="rounded-xl bg-paper p-6 shadow-[var(--shadow-float)]">
          <p className="text-[11px] tracking-[0.18em] text-faint uppercase">ITALVIA</p>
          <p className="mt-2 font-display text-3xl font-semibold text-navy">
            {tx("Kto wchodzi?", "Chi entra?")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {tx(
              "Najpierw wybierz: klient albo agent. Potem wpisz italvia i hasło.",
              "Prima scegli: cliente oppure agente. Poi scrivi italvia e la password.",
            )}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              className={`rounded-lg border px-3 py-4 text-left ${
                !agent ? "border-terracotta bg-ivory" : "border-line bg-paper"
              }`}
            >
              <span className="block text-sm font-medium text-navy">{tx("Klient", "Cliente")}</span>
              <span className="mt-1 block text-[11px] text-muted">{tx("Kupuję dom", "Compro casa")}</span>
            </Link>
            <Link
              to="/login"
              search={{ as: "agent" }}
              className={`rounded-lg border px-3 py-4 text-left ${
                agent ? "border-terracotta bg-ivory" : "border-line bg-paper"
              }`}
            >
              <span className="block text-sm font-medium text-navy">{tx("Agent", "Agente")}</span>
              <span className="mt-1 block text-[11px] text-muted">ITALVIA Desk</span>
            </Link>
          </div>

          {user && !isPending ? (
            <div className="mt-5 rounded-lg bg-ivory-deep p-4">
              <p className="text-sm text-navy">
                {tx("Jesteś już zalogowany jako", "Sei già dentro come")}{" "}
                <strong>{user.displayName ?? user.primaryEmail}</strong>
              </p>
              {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
              <Button className="mt-3 w-full" disabled={busy} onClick={() => void (agent ? enterAsAgent() : navigate({ to: "/home" }))}>
                {busy
                  ? tx("Proszę czekać…", "Un attimo…")
                  : agent
                    ? tx("Wejdź do Desku agenta", "Entra nel Desk agente")
                    : tx("Wejdź jako klient", "Entra come cliente")}
              </Button>
            </div>
          ) : (
            <>
              {authEnabled ? (
                <div className="mt-5 space-y-2">
                  {GROK_PROVIDERS.map((p) => (
                    <Button
                      key={p.providerId}
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        rememberGate(agent ? "agent" : "buyer");
                        void signIn(p.providerId, { callbackURL: agent ? "/desk" : "/onboarding" });
                      }}
                    >
                      {tx("Kontynuuj z", "Continua con")} {p.label}
                    </Button>
                  ))}
                </div>
              ) : null}

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-faint">
                <span className="h-px flex-1 bg-line" />
                {tx("albo e-mail", "oppure e-mail")}
                <span className="h-px flex-1 bg-line" />
              </div>

              <form className="space-y-3" onSubmit={onEmail}>
                {mode === "up" ? (
                  <Input placeholder={tx("Imię i nazwisko", "Nome e cognome")} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                ) : null}
                <Input
                  type="text"
                  required
                  placeholder={tx("italvia albo e-mail", "italvia oppure e-mail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <Input
                  type="password"
                  required
                  minLength={8}
                  placeholder={tx("Hasło", "Password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                />
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy
                    ? tx("Proszę czekać…", "Un attimo…")
                    : agent
                      ? tx("Wejdź jako agent", "Entra come agente")
                      : mode === "up"
                        ? tx("Utwórz konto klienta", "Crea account cliente")
                        : t("signIn")}
                </Button>
              </form>
              <button type="button" className="mt-3 w-full text-center text-sm text-muted" onClick={() => setMode(mode === "up" ? "in" : "up")}>
                {mode === "up"
                  ? tx("Mam już konto — zaloguj się", "Ho già un account — accedi")
                  : tx("Nie mam konta — załóż je", "Non ho un account — crealo")}
              </button>
            </>
          )}

          <p className="mt-5 text-center text-xs text-faint">
            {tx("Utente", "Utente")} italvia · {tx("hasło", "password")} agente2026
            <span className="mx-2">·</span>
            <Link to="/" className="underline-offset-2 hover:underline">
              {tx("Wróć", "Indietro")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
