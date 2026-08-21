import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Calendar,
  Check,
  ChevronRight,
  Heart,
  Layers,
  MapPin,
  MessageCircle,
  Square,
  Video,
} from "lucide-react";
import { getProperty, type CheckStatus, type Property, completedChecks } from "@/data/properties";
import { AGENT_TODAY, seasonOf } from "@/data/life";
import { estimatePurchase } from "@/lib/costs";
import { EUR_PLN, RATE_DATE, eurToPln, formatEur, formatPln } from "@/lib/money";
import { italviaScores } from "@/lib/score";
import { asBuyerProfile, useCompare, useFavorites, useProfile } from "@/lib/hooks";
import { bookVisit, sendMessage, toggleCompare, toggleFavorite } from "@/lib/server/italvia";
import { Button } from "@/components/ui/button";
import { ScoresRow } from "@/components/scores";
import { FloorPlan } from "@/components/floor-plan";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SeasonTwin, SeasonToggle } from "@/components/season-twin";
import { AskChiara } from "@/components/ask-chiara";
import { VoiceStory } from "@/components/voice-story";
import { AgentLive } from "@/components/agent-live";
import { LifeFromPoland } from "@/components/life-from-poland";
import { WeekendPlan } from "@/components/weekend-plan";
import { DossierSeal } from "@/components/dossier-seal";
import { TrattativaPanel } from "@/components/trattativa-panel";
import { LanguageSwitch } from "@/components/language-switch";
import { listMyOffers } from "@/lib/server/offers";
import { pickLiveOffer, stickyLabel } from "@/lib/offer-stage";
import { useLang } from "@/lib/i18n";
import { BuyerValuation } from "@/components/buyer-valuation";

export const Route = createFileRoute("/_app/homes/$id/")({ component: PropertyPage });

const TABS = [
  { id: "home", pl: "Dom", it: "La casa" },
  { id: "place", pl: "Miejsce", it: "Dove si trova" },
  { id: "season", pl: "Sezon", it: "Stagione" },
  { id: "cost", pl: "Koszt", it: "Costo" },
  { id: "dossier", pl: "Dossier", it: "Sicurezza" },
  { id: "life", pl: "Życie", it: "Vita" },
] as const;

function PropertyPage() {
  const { id } = Route.useParams();
  const property = getProperty(id);
  const { user, profile } = useProfile();
  const { lang, t, tx, locale } = useLang();
  const favs = useFavorites();
  const cmp = useCompare();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("home");
  const [lifeMode, setLifeMode] = useState<"live" | "invest">("live");
  const [visitOpen, setVisitOpen] = useState(false);
  const [when, setWhen] = useState("2026-09-12T11:00");
  const [questions, setQuestions] = useState(
    tx("Proszę pokazać pod zlewem, otworzyć okno i ulicę pod balkonem.", "Mostra sotto il lavello, apri la finestra e la strada sotto il balcone."),
  );
  const [busy, setBusy] = useState(false);
  const [season, setSeason] = useState<"summer" | "winter">("summer");
  const offersQ = useQuery({
    queryKey: ["offers", user?.id],
    queryFn: () => listMyOffers(),
    enabled: Boolean(user),
  });

  if (!property) {
    return (
      <div className="p-8 text-center">
        <p>{tx("Nie ma takiego domu w selekcji.", "Questa casa non è in selezione.")}</p>
        <Link to="/home" className="mt-4 inline-block text-terracotta">
          {t("back")}
        </Link>
      </div>
    );
  }

  const home = property;
  const bp = asBuyerProfile(profile);
  const scores = italviaScores(bp, home);
  const costs = estimatePurchase(home);
  const saved = favs.data?.includes(home.id);
  const compared = cmp.data?.includes(home.id);
  const liveOffer = pickLiveOffer(offersQ.data ?? [], home.id);
  const cta = stickyLabel(liveOffer, lang);
  const seasonStory = seasonOf(home.id);
  const heroSrc = season === "winter" && seasonStory?.winterImage ? seasonStory.winterImage : home.images[0];
  const liveHere = AGENT_TODAY.propertyId === home.id;
  const title = lang === "it" ? home.titleIt : home.titlePl;
  const otherTitle = lang === "it" ? home.titlePl : home.titleIt;
  const description = lang === "it" ? home.descriptionIt : home.descriptionPl;

  async function onFav() {
    if (!user) return navigate({ to: "/login" });
    await toggleFavorite({ data: home.id });
    await qc.invalidateQueries({ queryKey: ["favorites"] });
  }
  async function onCmp() {
    if (!user) return navigate({ to: "/login" });
    const res = await toggleCompare({ data: home.id });
    if ("full" in res && res.full) toast(tx("Można porównać maksymalnie cztery domy.", "Si confrontano al massimo quattro case."));
    await qc.invalidateQueries({ queryKey: ["compare"] });
  }
  async function onMessage() {
    if (!user) return navigate({ to: "/login" });
    const res = await sendMessage({
      data: {
        propertyId: home.id,
        text: tx(`Chcę wiedzieć więcej o: ${home.titlePl} w ${home.city}.`, `Vorrei saperne di più su: ${home.titleIt} a ${home.city}.`),
      },
    });
    await navigate({ to: "/messages/$id", params: { id: res.conversationId } });
  }
  async function onVisit() {
    if (!user) return navigate({ to: "/login" });
    setBusy(true);
    try {
      await bookVisit({ data: { propertyId: home.id, scheduledAt: new Date(when).toISOString(), questions } });
      toast(tx("Video-wizyta zgłoszona. Chiara potwierdzi godzinę.", "Video-visita richiesta. Chiara conferma l’orario."));
      setVisitOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article>
      <div className="relative overflow-hidden bg-navy">
        <img src={heroSrc} alt="" className="h-[40vh] w-full object-cover kenburns md:h-[58vh]" />
        <div className="absolute inset-0 bg-linear-to-t from-navy via-navy/25 to-navy/10" />
        <Link
          to="/"
          className="absolute top-4 left-4 z-10 grid size-11 place-items-center rounded-full bg-paper/90 text-navy"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <LanguageSwitch light compact />
          <button
            type="button"
            onClick={() => void onFav()}
            className="grid size-11 place-items-center rounded-full bg-paper/90 text-navy"
            aria-label={t("save")}
          >
            <Heart className={cn("size-5", saved && "fill-terracotta text-terracotta")} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 px-5 pb-5">
          {seasonStory?.winterImage ? <SeasonToggle value={season} onChange={setSeason} /> : null}
          <p className="flex items-center gap-1 text-sm text-paper/80">
            <MapPin className="size-3.5" />
            {home.city}, {home.region}
            {season === "winter" ? tx(" · styczeń", " · gennaio") : tx(" · sierpień", " · agosto")}
          </p>
          <h1 className="font-display text-3xl font-semibold text-paper md:text-5xl">{title}</h1>
        </div>
      </div>

      <div className="px-5 pt-5">
        <p className="font-display text-lg italic text-faint">{otherTitle}</p>
        <div className="mt-3 flex items-baseline gap-3">
          <p className="font-display text-3xl tabular-nums text-navy">{formatEur(home.priceEur, false, locale)}</p>
          <p className="text-sm text-muted">
            {tx("ok.", "circa")} {formatPln(eurToPln(home.priceEur))}
          </p>
        </div>
        <BuyerValuation propertyId={home.id} variant="peek" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <VoiceStory propertyId={home.id} className="[&_button]:bg-navy [&_button]:text-paper" />
          <AskChiara propertyId={home.id} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5">
          <ScoresRow match={scores.match} documents={scores.documents} remote={scores.remote} />
        </div>
        {liveHere ? (
          <div className="mt-5">
            <AgentLive compact />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto px-5">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm",
              tab === tabItem.id ? "bg-navy text-paper" : "bg-paper text-muted",
            )}
          >
            {lang === "it" ? tabItem.it : tabItem.pl}
          </button>
        ))}
      </div>

      <div className="px-5 py-6">
        {tab === "home" ? <HomeTab property={home} /> : null}
        {tab === "place" ? <PlaceTab property={home} city={profile?.polishCity ?? "Warszawa"} /> : null}
        {tab === "season" ? <SeasonTab property={home} /> : null}
        {tab === "cost" ? <CostTab property={home} /> : null}
        {tab === "dossier" ? <DossierTab property={home} /> : null}
        {tab === "life" ? <LifeTab property={home} mode={lifeMode} setMode={setLifeMode} /> : null}
      </div>

      <div className="px-5 pb-6">
        <TrattativaPanel propertyId={home.id} askingEur={home.priceEur} signedIn={Boolean(user)} />
      </div>

      <div className="h-44" />
      <div className="fixed inset-x-0 bottom-20 z-20 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-faint">{tx("Koszt ostrożny", "Costo prudente")}</p>
            <p className="truncate font-medium tabular-nums text-navy">
              {formatEur(costs.totalMin, false, locale)}–{formatEur(costs.totalMax, false, locale)}
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => void onCmp()} aria-label={t("compare")}>
            <Layers className={cn("size-4", compared && "text-terracotta")} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => void onMessage()} aria-label={t("writeAgent")}>
            <MessageCircle className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setVisitOpen(true)} aria-label={t("videoVisit")}>
            <Video className="size-4" />
          </Button>
          {liveOffer ? (
            <Button asChild>
              <Link to="/offers/$id" params={{ id: liveOffer.id }}>
                {cta}
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/homes/$id/offer" params={{ id: home.id }}>
                {cta}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {visitOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-navy/40 p-4" onClick={() => setVisitOpen(false)}>
          <div className="w-full max-w-lg rounded-xl bg-paper p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl text-navy">{t("videoVisit")}</h2>
            <p className="mt-1 text-sm text-muted">
              {tx("Agent z telefonem. Możesz prosić: pokaż, otwórz, zejdź na ulicę.", "Agente col telefono. Puoi chiedere: mostra, apri, scendi in strada.")}
            </p>
            <label className="mt-4 block text-xs text-faint">{tx("Data i godzina", "Data e ora")}</label>
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            <label className="mt-3 block text-xs text-faint">{tx("Pytania", "Domande")}</label>
            <Textarea value={questions} onChange={(e) => setQuestions(e.target.value)} />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setVisitOpen(false)}>
                {t("cancel")}
              </Button>
              <Button className="flex-1" onClick={() => void onVisit()} disabled={busy}>
                {tx("Zarezerwuj", "Prenota")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function HomeTab({ property }: { property: Property }) {
  const { lang, tx } = useLang();
  const facts = [
    { icon: Square, label: `${property.sqm} m²` },
    { icon: BedDouble, label: `${property.rooms} ${tx("pokoje", "locali")}` },
    { icon: Bath, label: `${property.baths} ${tx("łazienki", "bagni")}` },
    { icon: Layers, label: `${tx("Piętro", "Piano")} ${property.floor}` },
  ];
  const conditionLabel =
    property.condition === "ready"
      ? tx("Gotowe", "Pronto")
      : property.condition === "light"
        ? tx("Lekki remont", "Lavori leggeri")
        : tx("Remont", "Ristrutturazione");
  const furnishedLabel =
    property.furnished === "included"
      ? tx("Umeblowane", "Arredato")
      : property.furnished === "partial"
        ? tx("Częściowo meble", "Arredo parziale")
        : tx("Bez mebli", "Vuoto");
  const warnings = lang === "it" ? property.warningsIt : property.warningsPl;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-2">
        {facts.map((f) => (
          <div key={f.label} className="rounded-lg bg-paper px-2 py-3 text-center">
            <f.icon className="mx-auto size-4 text-terracotta" />
            <p className="mt-1 text-[11px] text-navy">{f.label}</p>
          </div>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2 text-sm text-navy">
        <Li ok={property.terrace} label={tx("Taras", "Terrazzo")} />
        <Li ok={property.garden} label={tx("Ogród", "Giardino")} />
        <Li ok={property.parking} label={tx("Parking", "Parcheggio")} />
        <Li ok={property.elevator} label={tx("Winda", "Ascensore")} />
        <Li ok={property.condition === "ready"} label={conditionLabel} />
        <Li ok={property.furnished !== "none"} label={furnishedLabel} />
      </ul>
      <p className="flex items-center gap-2 text-sm text-muted">
        <Calendar className="size-4" />
        {tx("Dostępność:", "Disponibilità:")} {property.availableFrom}
      </p>
      <FloorPlan rooms={property.rooms} sqm={property.sqm} />
      <div className="flex gap-2 overflow-x-auto">
        {property.images.slice(1).map((src) => (
          <img key={src} src={src} alt="" className="h-40 w-56 shrink-0 rounded-lg object-cover" />
        ))}
      </div>
      {warnings.length ? (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Li({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 rounded-md bg-paper px-3 py-2">
      <Check className={cn("size-4", ok ? "text-sage" : "text-faint")} />
      {label}
    </li>
  );
}

function PlaceTab({ property, city }: { property: Property; city: string }) {
  const { lang, tx, locale } = useLang();
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${property.lng - 0.04}%2C${property.lat - 0.03}%2C${property.lng + 0.04}%2C${property.lat + 0.03}&layer=mapnik&marker=${property.lat}%2C${property.lng}`;
  const noise =
    property.noise === "quiet"
      ? tx("cicho", "silenzioso")
      : property.noise === "lively"
        ? tx("ożywnie, zwłaszcza latem", "vivace, soprattutto d’estate")
        : tx("umiarkowanie", "moderato");
  return (
    <div className="space-y-4">
      <WeekendPlan propertyId={property.id} />
      <div className="overflow-hidden rounded-lg border border-line">
        <iframe title={tx("Mapa", "Mappa")} src={osm} className="h-52 w-full border-0" />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Fact k={tx("Morze", "Mare")} v={property.seaKm == null ? "—" : `${property.seaKm} km`} />
        <Fact k={tx("Lotnisko", "Aeroporto")} v={`${property.airport.name} · ${property.airport.minutes} min`} />
        <Fact k={tx("Szpital", "Ospedale")} v={`${property.hospitalMin} min`} />
        <Fact k={tx("Apteka", "Farmacia")} v={`${property.pharmacyMin} min`} />
        <Fact k={tx("Market", "Supermercato")} v={`${property.supermarketMin} min`} />
        <Fact k={tx("Stacja", "Stazione")} v={`${property.stationMin} min`} />
        <Fact k={tx("Mieszkańcy", "Abitanti")} v={property.population.toLocaleString(locale)} />
        <Fact k={tx("Usługi zimą", "Servizi d’inverno")} v={property.yearRoundServices ? tx("Cały rok", "Tutto l’anno") : tx("Sezonowe", "Stagionali")} />
      </dl>
      <p className="text-sm text-navy">
        <strong>{tx("Z", "Da")} {city}:</strong> {property.travelFrom[city] ?? property.travelFrom.Warszawa}
      </p>
      <p className="text-sm leading-relaxed text-muted">{lang === "it" ? property.offSeasonIt : property.offSeasonPl}</p>
      <p className="text-sm leading-relaxed text-muted">{lang === "it" ? property.accessNotesIt : property.accessNotesPl}</p>
      <p className="text-xs text-faint">
        {tx("Hałas:", "Rumore:")} {noise}
      </p>
    </div>
  );
}

function SeasonTab({ property }: { property: Property }) {
  const { lang, tx } = useLang();
  const story = seasonOf(property.id);
  if (!story) return <p className="text-sm text-muted">{tx("Brak opisu sezonu.", "Nessuna descrizione stagionale.")}</p>;
  if (story.winterImage) {
    return <SeasonTwin summer={property.images[0]} winter={story.winterImage} story={story} />;
  }
  return (
    <div className="rounded-xl bg-navy px-5 py-6 text-paper">
      <p className="text-xs tracking-[0.18em] text-sand uppercase">
        {tx("To miasto nie umiera zimą", "Questa città non muore d’inverno")}
      </p>
      <p className="mt-2 font-display text-2xl leading-snug">{lang === "it" ? story.honestyIt : story.honestyPl}</p>
      <p className="mt-3 text-sm text-paper/80">{lang === "it" ? story.winterIt : story.winterPl}</p>
      <p className="mt-2 text-xs italic text-paper/55">{lang === "it" ? story.summerIt : story.summerPl}</p>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-paper px-3 py-2">
      <dt className="text-[11px] text-faint">{k}</dt>
      <dd className="text-navy">{v}</dd>
    </div>
  );
}

function CostTab({ property }: { property: Property }) {
  const { lang, tx, locale } = useLang();
  const c = estimatePurchase(property);
  return (
    <div>
      <div className="rounded-xl bg-navy px-5 py-5 text-paper">
        <p className="text-xs uppercase tracking-wider text-sand">{tx("Cena nieruchomości", "Prezzo dell’immobile")}</p>
        <p className="font-display text-3xl tabular-nums">{formatEur(property.priceEur, false, locale)}</p>
        <p className="mt-3 text-xs uppercase tracking-wider text-sand">{tx("Budżet całkowity ostrożny", "Budget complessivo prudente")}</p>
        <p className="font-display text-2xl tabular-nums">
          {formatEur(c.totalMin, false, locale)}–{formatEur(c.totalMax, false, locale)}
        </p>
        <p className="mt-1 text-xs text-paper/70">
          {tx("ok.", "circa")} {formatPln(eurToPln(c.totalMid))}
        </p>
      </div>
      <div className="mt-4">
        <BuyerValuation propertyId={property.id} variant="full" />
      </div>
      <ul className="mt-4 divide-y divide-line rounded-xl bg-paper">
        {c.lines.map((line) => (
          <li key={line.key} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
            <span>
              <span className="text-navy">{lang === "it" ? line.labelIt : line.labelPl}</span>
              {line.yearly ? (
                <span className="block text-[11px] text-faint">
                  {tx("rocznie, nie w sumie zakupu", "annuo, non nel totale d’acquisto")}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums text-navy">
              {line.min === line.max
                ? formatEur(line.min, false, locale)
                : `${formatEur(line.min, false, locale)}–${formatEur(line.max, false, locale)}`}
            </span>
          </li>
        ))}
      </ul>
      <LifeFromPoland property={property} />
      <p className="mt-4 text-xs leading-relaxed text-faint">
        {tx(
          `Szacunek z dnia ${RATE_DATE}, kurs orientacyjny 1 € = ${EUR_PLN} zł. Kwoty ostateczne potwierdzają notariusz, geometra i urząd. To nie jest obietnica podatkowa.`,
          `Stima del ${RATE_DATE}, cambio orientativo 1 € = ${EUR_PLN} zł. Gli importi definitivi li confermano notaio, geometra e ufficio. Non è una promessa fiscale.`,
        )}
      </p>
    </div>
  );
}

function DossierTab({ property }: { property: Property }) {
  const { lang } = useLang();
  const done = completedChecks(property);
  return (
    <div>
      <DossierSeal property={property} />
      <p className="sr-only">{done}/10</p>
      <ul className="space-y-2">
        {property.checks.map((c) => (
          <li key={c.key} className="rounded-lg bg-paper px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-navy">{lang === "it" ? c.labelIt : c.labelPl}</p>
                <p className="text-[11px] text-faint">{lang === "it" ? c.labelPl : c.labelIt}</p>
                {c.professional ? (
                  <p className="mt-1 text-xs text-muted">
                    {c.professional} · {c.role}
                    {c.date ? ` · ${c.date}` : ""}
                  </p>
                ) : null}
                {(lang === "it" ? c.noteIt : c.notePl) ? (
                  <p className="mt-1 text-xs text-muted">{lang === "it" ? c.noteIt : c.notePl}</p>
                ) : null}
                {(lang === "it" ? c.solutionIt : c.solutionPl) ? (
                  <p className="mt-1 text-xs text-sage">{lang === "it" ? c.solutionIt : c.solutionPl}</p>
                ) : null}
              </div>
              <StatusDot status={c.status} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusDot({ status }: { status: CheckStatus }) {
  const { tx } = useLang();
  const map: Record<CheckStatus, { label: string; className: string }> = {
    verified: { label: tx("Zweryfikowano", "Verificato"), className: "bg-sage text-paper" },
    received: { label: tx("Otrzymano", "Ricevuto"), className: "bg-sage-soft text-sage" },
    in_review: { label: tx("W kontroli", "In verifica"), className: "bg-ivory-deep text-navy" },
    requested: { label: tx("Zlecono", "Richiesto"), className: "bg-line text-muted" },
    issue: { label: tx("Uwaga", "Attenzione"), className: "bg-danger text-paper" },
  };
  const m = map[status];
  return <span className={cn("shrink-0 rounded-full px-2 py-1 text-[11px]", m.className)}>{m.label}</span>;
}

function LifeTab({
  property,
  mode,
  setMode,
}: {
  property: Property;
  mode: "live" | "invest";
  setMode: (m: "live" | "invest") => void;
}) {
  const { lang, tx } = useLang();
  const items = mode === "live" ? (lang === "it" ? property.liveIt : property.livePl) : lang === "it" ? property.investIt : property.investPl;
  return (
    <div>
      <div className="grid grid-cols-2 rounded-lg bg-paper p-1">
        <button
          type="button"
          className={cn("rounded-md py-2 text-sm", mode === "live" ? "bg-navy text-paper" : "text-muted")}
          onClick={() => setMode("live")}
        >
          {tx("Chcę tu żyć", "Voglio viverci")}
        </button>
        <button
          type="button"
          className={cn("rounded-md py-2 text-sm", mode === "invest" ? "bg-navy text-paper" : "text-muted")}
          onClick={() => setMode("invest")}
        >
          {tx("Chcę inwestować", "Voglio investire")}
        </button>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-navy">
            <ChevronRight className="mt-0.5 size-4 shrink-0 text-terracotta" />
            {item}
          </li>
        ))}
      </ul>
      {mode === "invest" ? (
        <div className="mt-5 rounded-xl border border-line bg-paper p-4">
          <p className="text-xs uppercase tracking-wider text-faint">{tx("Symulacja, nie gwarancja", "Simulazione, non garanzia")}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] text-faint">{tx("Ostrożny", "Prudente")}</p>
              <p className="font-display text-xl text-navy">{property.yieldCautious}</p>
            </div>
            <div>
              <p className="text-[11px] text-faint">{tx("Centralny", "Centrale")}</p>
              <p className="font-display text-xl text-navy">{property.yieldBase}</p>
            </div>
            <div>
              <p className="text-[11px] text-faint">{tx("Sprzyjający", "Favorevole")}</p>
              <p className="font-display text-xl text-navy">{property.yieldFair}</p>
            </div>
          </div>
        </div>
      ) : null}
      <LifeFromPoland property={property} />
    </div>
  );
}
