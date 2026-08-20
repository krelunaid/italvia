import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileCheck2, Wallet, Waypoints } from "lucide-react";
import { PROPERTIES } from "@/data/properties";
import { SEASONS } from "@/data/life";
import { formatEur } from "@/lib/money";
import { AuthSlot } from "@/components/auth-slot";
import { Button } from "@/components/ui/button";
import { SeasonTwin } from "@/components/season-twin";
import { AgentLive } from "@/components/agent-live";
import { AppHeader } from "@/components/app-header";
import { useProfile } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user, profile, loading } = useProfile();
  const { lang, t, tx, locale } = useLang();
  const featured = PROPERTIES.filter((p) => ["scalea", "tropea", "catania"].includes(p.id));
  const scalea = PROPERTIES.find((p) => p.id === "scalea")!;

  let ctaLabel = tx("Zacznij swój projekt", "Inizia il tuo progetto");
  if (loading) ctaLabel = "…";
  else if (user) ctaLabel = tx("Wejdź do projektu", "Entra nel progetto");

  return (
    <main className="bg-ivory">
      <section className="relative min-h-[100dvh] overflow-hidden bg-navy">
        <video
          className="pointer-events-none absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/homes/hero.jpg"
        >
          <source src="/homes/hero-loop.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-navy via-navy/50 to-navy/20" />
        <AppHeader light trailing={<AuthSlot light />} className="relative z-50 px-5 py-5" padded={false} />
        <div className="relative z-10 mx-auto flex min-h-[78dvh] max-w-3xl flex-col justify-end px-5 pb-16">
          <p className="text-xs uppercase tracking-[0.22em] text-sand">
            {tx("Concierge Italia — Polska", "Concierge Italia — Polonia")}
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] text-paper md:text-7xl">
            {tx("Sierpień kłamie.", "Agosto mente.")}
            <br />
            {tx("Styczeń mówi prawdę.", "Gennaio dice la verità.")}
          </h1>
          <p className="mt-4 font-display text-xl italic text-paper/80">{t("tagline")}</p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-paper/85">
            {tx(
              "Nie katalog tysięcy ogłoszeń. Osobisty agent, koszt całkowity, dossier i droga od pierwszej myśli do kluczy — w Twoim języku, z zimą w kadrze.",
              "Non un catalogo di migliaia di annunci. Agente personale, costo complessivo, dossier e il percorso dalla prima idea alle chiavi — nella tua lingua, con l’inverno in quadro.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaButton label={ctaLabel} user={Boolean(user)} onboarded={Boolean(profile?.onboarded)} role={profile?.role} />
            <Button asChild size="lg" variant="outline" className="border-paper/40 bg-transparent text-paper hover:bg-paper/10">
              <Link to="/homes/$id" params={{ id: "scalea" }}>
                {tx("Zobacz Scaleę w styczniu", "Vedi Scalea a gennaio")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-faint">
          {tx("Jedyna rzecz, której portale nie pokazują", "L’unica cosa che i portali non mostrano")}
        </p>
        <h2 className="mt-3 font-display text-4xl text-navy">
          {tx("Ten sam dom. Dwie pory roku.", "La stessa casa. Due stagioni.")}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          {tx(
            "Polacy oglądają Włochy w sierpniu i kupują na styczeń. Przeciągnij kreskę. To nie filtr — to uczciwość.",
            "Si visita l’Italia ad agosto e si compra per gennaio. Trascina la linea. Non è un filtro — è onestà.",
          )}
        </p>
        <div className="mt-8">
          <SeasonTwin summer={scalea.images[0]} winter={SEASONS.scalea.winterImage!} story={SEASONS.scalea} />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-faint">
          {tx("Trzy rzeczy, które naprawdę zmieniają zakup", "Tre cose che cambiano davvero l’acquisto")}
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Pillar
            icon={Wallet}
            title={tx("Koszt całkowity", "Costo complessivo")}
            body={tx(
              "Nie tylko cena z ogłoszenia. Prowizja, podatki, notariusz, tłumacz, wspólnota, loty z Polski i ostrożny bufor.",
              "Non solo il prezzo dell’annuncio. Provvigione, imposte, notaio, interprete, condominio, voli dalla Polonia e un buffer prudente.",
            )}
          />
          <Pillar
            icon={FileCheck2}
            title={tx("Dossier bezpieczeństwa", "Dossier di sicurezza")}
            body={tx(
              "Dziesięć kontroli. Zielone tylko wtedy, gdy agent, geometra, notariusz albo adwokat potwierdzi dokument.",
              "Dieci verifiche. Verde solo quando agente, geometra, notaio o avvocato conferma il documento.",
            )}
          />
          <Pillar
            icon={Waypoints}
            title={tx("Prowadzony proces", "Percorso guidato")}
            body={tx(
              "Od profilu do kluczy. Widzisz, kto działa, czego brakuje i co jest następne. Notariusza wybierasz Ty.",
              "Dal profilo alle chiavi. Vedi chi agisce, cosa manca e il passo successivo. Il notaio lo scegli tu.",
            )}
          />
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-faint">
                {tx("Agent, nie aplikacja", "Agente, non applicazione")}
              </p>
              <h2 className="mt-2 font-display text-4xl text-navy">Chiara Moretti</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
                {tx(
                  "Nie piszesz do czatu. Piszysz do kobiety, która dziś stoi na tarasie w Kalabrii. Video-wizyta, dossier, notaio, tłumacz — w jednym wątku, w Twoim języku.",
                  "Non scrivi a una chat. Scrivi a una donna che oggi è sul terrazzo in Calabria. Video-visita, dossier, notaio, interprete — in un solo filo, nella tua lingua.",
                )}
              </p>
            </div>
            <img src="/homes/chiara.jpg" alt="Chiara Moretti" className="aspect-[3/4] w-full rounded-xl object-cover md:max-w-[280px]" />
          </div>
          <div className="mt-8">
            <AgentLive />
          </div>
        </div>
      </section>

      <section className="bg-paper pb-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-navy">
                {tx("Selekcja, nie hipermarket", "Selezione, non ipermercato")}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                {tx(
                  "Osiem domów prowadzonych osobiście. Żadnych skopiowanych ogłoszeń z portali.",
                  "Otto case seguite di persona. Nessun annuncio copiato dai portali.",
                )}
              </p>
            </div>
            <Link to="/login" className="hidden items-center gap-1 text-sm text-terracotta md:flex">
              {tx("Wejdź", "Entra")} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featured.map((p) => (
              <Link key={p.id} to="/homes/$id" params={{ id: p.id }} className="group overflow-hidden rounded-xl">
                <div className="aspect-[3/2] overflow-hidden">
                  <img src={p.images[0]} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="bg-ivory-deep px-4 py-3">
                  <p className="font-display text-lg text-navy">{lang === "it" ? p.titleIt : p.titlePl}</p>
                  <p className="text-sm text-muted">
                    {p.city} · {formatEur(p.priceEur, false, locale)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-10 text-center">
        <p className="font-display text-2xl text-navy">ITALVIA</p>
        <p className="mt-1 text-sm text-muted">Chiara Moretti · concierge immobiliare</p>
        <p className="mt-4 text-xs text-faint">
          {tx(
            "Obywatele UE kupują we Włoszech na tych samych zasadach co Włosi. Proces jest inny — i właśnie to prowadzimy.",
            "I cittadini UE comprano in Italia con gli stessi diritti degli italiani. Il processo è diverso — ed è questo che accompagniamo.",
          )}
        </p>
      </footer>
    </main>
  );
}

function CtaButton({
  label,
  user,
  onboarded,
  role,
}: {
  label: string;
  user: boolean;
  onboarded: boolean;
  role?: string;
}) {
  if (!user) {
    return (
      <Button asChild size="lg">
        <Link to="/login">{label}</Link>
      </Button>
    );
  }
  if (!onboarded) {
    return (
      <Button asChild size="lg">
        <Link to="/onboarding">{label}</Link>
      </Button>
    );
  }
  if (role === "agent") {
    return (
      <Button asChild size="lg">
        <Link to="/desk">{label}</Link>
      </Button>
    );
  }
  return (
    <Button asChild size="lg">
      <Link to="/home">{label}</Link>
    </Button>
  );
}

function Pillar({ icon: Icon, title, body }: { icon: typeof Wallet; title: string; body: string }) {
  return (
    <article className="rounded-xl bg-paper p-6 shadow-[var(--shadow-card)]">
      <Icon className="size-5 text-terracotta" />
      <h3 className="mt-4 font-display text-2xl text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}
