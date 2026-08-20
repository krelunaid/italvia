import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { PROPERTIES } from "@/data/properties";
import { asBuyerProfile, useProfile } from "@/lib/hooks";
import { PropertyCard } from "@/components/property-card";
import { AuthSlot } from "@/components/auth-slot";
import { AgentLive } from "@/components/agent-live";
import { AppHeader } from "@/components/app-header";
import { firstName, greetingIt, greetingPl } from "@/lib/utils";
import { formatEur } from "@/lib/money";
import { matchScore } from "@/lib/score";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { ArrowRight, Search } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/home")({ component: Home });

const COLLECTIONS = [
  { id: "sea", pl: "Nad morzem", it: "Vicino al mare", img: "/homes/scalea.jpg" },
  { id: "ready", pl: "Gotowe do zamieszkania", it: "Pronti da abitare", img: "/homes/viareggio.jpg" },
  { id: "under150", pl: "Do 150 000 €", it: "Entro 150.000 €", img: "/homes/catania.jpg" },
  { id: "investment", pl: "Dobra inwestycja", it: "Buon investimento", img: "/homes/catania.jpg" },
  { id: "airport", pl: "Blisko lotniska", it: "Vicino all’aeroporto", img: "/homes/sirmione.jpg" },
  { id: "agent", pl: "Wybrane przez agenta", it: "Scelte dall’agente", img: "/homes/tropea.jpg" },
] as const;

function Home() {
  const { user, profile, loading, authPending } = useProfile();
  const { lang, t, tx, locale } = useLang();
  const bp = asBuyerProfile(profile);

  if (authPending || loading) {
    return <div className="grid min-h-[60vh] place-items-center text-muted">{tx("Ładuję Twój projekt…", "Carico il tuo progetto…")}</div>;
  }
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;
  if (profile.role === "agent") return <Navigate to="/desk" />;

  const ranked = [...PROPERTIES].sort((a, b) => matchScore(bp, b) - matchScore(bp, a)).slice(0, 4);
  const name = firstName(user.displayName ?? profile.displayName, lang === "it" ? "ospite" : "Marek");
  const greeting = lang === "it" ? greetingIt() : greetingPl();

  return (
    <div>
      <AppHeader trailing={<AuthSlot />} />

      <section className="px-5 pb-2">
        <p className="text-sm text-muted">
          {greeting}, {name}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight text-navy">{t("findHome")}</h1>
        <p className="font-display text-lg italic text-faint">{t("tagline")}</p>
        <Link
          to="/search"
          className="mt-4 flex h-12 items-center gap-3 rounded-lg border border-line bg-paper px-4 text-sm text-muted"
        >
          <Search className="size-4" />
          {t("filter")}
        </Link>
      </section>

      <section className="px-5 pt-5">
        <AgentLive compact />
      </section>

      {profile ? (
        <Link to="/profile" className="mx-5 mt-5 block rounded-xl bg-navy px-5 py-4 text-paper">
          <p className="text-[11px] uppercase tracking-[0.18em] text-sand">{t("yourProject")}</p>
          <p className="mt-2 font-display text-2xl leading-snug">
            {profile.condition === "ready"
              ? tx("Apartament gotowy do zamieszkania", "Appartamento pronto da abitare")
              : tx("Dom do wykończenia", "Casa da finire")}
          </p>
          <p className="mt-1 text-sm text-paper/75">
            {profile.budgetEur ? `${tx("Do", "Fino a")} ${formatEur(profile.budgetEur, false, locale)}` : ""}
            {profile.setting === "sea" && profile.seaMaxKm ? ` · max ${profile.seaMaxKm} km ${tx("od morza", "dal mare")}` : ""}
            {profile.minRooms ? ` · ${profile.minRooms} ${tx("pokoje", "locali")}` : ""}
            {profile.wantsTerrace ? tx(" i taras", " e terrazzo") : ""}
          </p>
        </Link>
      ) : null}

      <section className="mt-8 px-5">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.id}
              to="/search"
              search={{ c: c.id }}
              className="relative h-36 w-44 shrink-0 overflow-hidden rounded-lg"
            >
              <img src={c.img} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-navy/35" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-medium text-paper">{lang === "it" ? c.it : c.pl}</p>
                <p className="text-[11px] text-paper/70">{lang === "it" ? c.pl : c.it}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 px-5 pb-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl text-navy">{t("selectedForYou")}</h2>
          <Link to="/search" className="flex items-center gap-1 text-sm text-terracotta">
            {t("all")} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-5">
          {ranked.map((p) => (
            <PropertyCard key={p.id} property={p} profile={bp} featured />
          ))}
        </div>
      </section>
    </div>
  );
}

const copyTaglinePl = "Twój bezpieczny dom we Włoszech";
const copyTaglineIt = "La tua casa sicura in Italia";
