export type CheckStatus = "verified" | "received" | "in_review" | "requested" | "issue";
export type Purpose = "vacation" | "relocation" | "investment" | "retirement";
export type Setting = "sea" | "city" | "countryside" | "lake" | "mountain";
export type Condition = "ready" | "light" | "renovate";

export type PropertyCheck = {
  key: string;
  labelPl: string;
  labelIt: string;
  status: CheckStatus;
  professional?: string;
  role?: string;
  date?: string;
  notePl?: string;
  noteIt?: string;
  solutionPl?: string;
  solutionIt?: string;
};

export type Property = {
  id: string;
  titlePl: string;
  titleIt: string;
  city: string;
  region: string;
  priceEur: number;
  sqm: number;
  rooms: number;
  baths: number;
  floor: string;
  terrace: boolean;
  garden: boolean;
  parking: boolean;
  elevator: boolean;
  condition: Condition;
  furnished: "included" | "partial" | "none";
  availableFrom: string;
  setting: Setting;
  seaKm: number | null;
  airport: { code: string; name: string; minutes: number };
  hospitalMin: number;
  pharmacyMin: number;
  supermarketMin: number;
  stationMin: number;
  population: number;
  yearRoundServices: boolean;
  noise: "quiet" | "moderate" | "lively";
  accessNotesPl: string;
  accessNotesIt: string;
  offSeasonPl: string;
  offSeasonIt: string;
  images: string[];
  collections: Array<"sea" | "ready" | "under150" | "investment" | "airport" | "agent">;
  bestFor: Purpose[];
  cadastralCategory: string;
  energyClass: string;
  condoAnnual: number;
  renovationMin: number;
  renovationMax: number;
  localManagement: boolean;
  checks: PropertyCheck[];
  livePl: string[];
  liveIt: string[];
  investPl: string[];
  investIt: string[];
  yieldCautious: string;
  yieldBase: string;
  yieldFair: string;
  descriptionPl: string;
  descriptionIt: string;
  warningsPl: string[];
  warningsIt: string[];
  agentPick: boolean;
  lat: number;
  lng: number;
  travelFrom: Record<string, string>;
};

const CHECK_META: { key: string; labelPl: string; labelIt: string }[] = [
  { key: "owner", labelPl: "Właściciel zidentyfikowany", labelIt: "Proprietario identificato" },
  { key: "deed", labelPl: "Akt pochodzenia", labelIt: "Atto di provenienza" },
  { key: "cadastre", labelPl: "Wypis katastralny", labelIt: "Visura catastale" },
  { key: "plan", labelPl: "Planimetria porównana", labelIt: "Planimetria confrontata" },
  { key: "category", labelPl: "Kategoria katastralna mieszkaniowa", labelIt: "Categoria catastale abitativa" },
  { key: "urban", labelPl: "Zgodność urbanistyczna", labelIt: "Conformità urbanistica" },
  { key: "ape", labelPl: "Świadectwo energetyczne", labelIt: "Prestazione energetica" },
  { key: "condo", labelPl: "Opłaty wspólnoty", labelIt: "Spese condominiali" },
  { key: "liens", labelPl: "Hipoteki, zastawy, ograniczenia", labelIt: "Mutui, ipoteche o vincoli" },
  { key: "occupancy", labelPl: "Lokal wolny albo zajęty", labelIt: "Immobile libero o occupato" },
];

function dossier(
  map: Record<
    string,
    Pick<PropertyCheck, "status" | "professional" | "role" | "date" | "notePl" | "noteIt" | "solutionPl" | "solutionIt">
  >,
): PropertyCheck[] {
  return CHECK_META.map((meta) => ({ ...meta, ...map[meta.key] }));
}

const interiors = ["/homes/interior-living.jpg", "/homes/interior-kitchen.jpg", "/homes/interior-bedroom.jpg"];

export const PROPERTIES: Property[] = [
  {
    id: "scalea",
    titlePl: "Apartament z widokiem na morze",
    titleIt: "Appartamento vista mare",
    city: "Scalea",
    region: "Calabria",
    priceEur: 129000,
    sqm: 78,
    rooms: 2,
    baths: 1,
    floor: "2",
    terrace: true,
    garden: false,
    parking: true,
    elevator: false,
    condition: "ready",
    furnished: "partial",
    availableFrom: "od zaraz",
    setting: "sea",
    seaKm: 0.5,
    airport: { code: "SUF", name: "Lamezia Terme", minutes: 55 },
    hospitalMin: 12,
    pharmacyMin: 6,
    supermarketMin: 8,
    stationMin: 14,
    population: 10800,
    yearRoundServices: true,
    noise: "quiet",
    accessNotesPl: "Dwie klatki schodów, bez windy. Ulica dojazdowa zwykła, parking wspólnoty na tyłach.",
    accessNotesIt: "Due rampe di scale, senza ascensore. Strada ordinaria, parcheggio condominiale sul retro.",
    offSeasonPl:
      "Zimą Scalea zwalnia, ale piekarnia, supermarket i przychodnia zostają otwarte. Plaża pustoszeje od listopada do kwietnia.",
    offSeasonIt:
      "In inverno Scalea rallenta, ma panificio, supermercato e ambulatorio restano aperti. La spiaggia si svuota da novembre ad aprile.",
    images: ["/homes/scalea.jpg", ...interiors],
    collections: ["sea", "ready", "under150", "agent"],
    bestFor: ["vacation", "retirement", "investment"],
    cadastralCategory: "A/3",
    energyClass: "E",
    condoAnnual: 980,
    renovationMin: 0,
    renovationMax: 2500,
    localManagement: true,
    agentPick: true,
    lat: 39.814,
    lng: 15.791,
    travelFrom: {
      Warszawa: "2 loty, ok. 7 h z dojazdami",
      Kraków: "1–2 loty, ok. 6,5 h",
      Wrocław: "1–2 loty, ok. 7 h",
      Gdańsk: "2 loty, ok. 8 h",
      Poznań: "2 loty, ok. 7,5 h",
      Katowice: "1–2 loty, ok. 6,5 h",
    },
    descriptionPl:
      "Światło, taras i pięćset metrów do morza. Mieszkanie jest gotowe do zamieszkania: kuchnia stoi, łazienka po odświeżeniu, meble częściowe zostają. To nie pocztówka z sierpnia — zimą miasteczko cichnie, ale podstawowe usługi działają.",
    descriptionIt:
      "Luce, terrazzo e cinquecento metri dal mare. L’appartamento è abitabile: cucina in opera, bagno rinfrescato, arredo parziale incluso. Non è solo la cartolina d’agosto — in inverno il paese tace, ma i servizi essenziali restano.",
    warningsPl: ["Brak windy — drugie piętro."],
    warningsIt: ["Nessun ascensore — secondo piano."],
    livePl: [
      "Przychodnia i apteka czynne cały rok.",
      "Klimat łagodny, lato długie, zima wilgotna.",
      "Zarządca lokalny może doglądać mieszkania w Twojej nieobecności.",
    ],
    liveIt: [
      "Ambulatorio e farmacia aperti tutto l’anno.",
      "Clima mite, estate lunga, inverno umido.",
      "Un custode locale può sorvegliare l’appartamento in tua assenza.",
    ],
    investPl: [
      "Popyt turystyczny od czerwca do września, słabszy poza sezonem.",
      "Wspólnota cicha, regulamin nie blokuje krótkiego najmu — do potwierdzenia w uchwałach.",
      "Scenariusz ostrożny zakłada 10–12 tygodni obłożenia.",
    ],
    investIt: [
      "Domanda turistica da giugno a settembre, più debole fuori stagione.",
      "Condominio tranquillo; il regolamento non vieta gli affitti brevi — da verificare in delibera.",
      "Lo scenario prudente assume 10–12 settimane di occupazione.",
    ],
    yieldCautious: "2,8%",
    yieldBase: "4,1%",
    yieldFair: "5,4%",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-02" },
      deed: { status: "received", professional: "Notaio Greco", role: "notaio", date: "2026-07-11" },
      cadastre: { status: "verified", professional: "Geom. Russo", role: "geometra", date: "2026-07-14" },
      plan: { status: "in_review", professional: "Geom. Russo", role: "geometra", notePl: "Trwa porównanie z ostatnią zmianą tarasu.", noteIt: "Confronto in corso con la variante del terrazzo." },
      category: { status: "verified", professional: "Geom. Russo", role: "geometra", date: "2026-07-14" },
      urban: { status: "requested", professional: "Avv. Greco", role: "avvocato", notePl: "Wysłana prośba o zaświadczenie gminy.", noteIt: "Richiesta certificato comunale inviata." },
      ape: { status: "verified", professional: "Ing. Leone", role: "certificatore", date: "2026-06-20" },
      condo: { status: "received", professional: "Amm. Ferraro", role: "amministratore", date: "2026-07-01" },
      liens: { status: "in_review", professional: "Avv. Greco", role: "avvocato" },
      occupancy: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-08-01" },
    }),
  },
  {
    id: "tropea",
    titlePl: "Dom w historycznym centrum",
    titleIt: "Casa nel centro storico",
    city: "Tropea",
    region: "Calabria",
    priceEur: 145000,
    sqm: 92,
    rooms: 3,
    baths: 2,
    floor: "1–2",
    terrace: true,
    garden: false,
    parking: false,
    elevator: false,
    condition: "ready",
    furnished: "none",
    availableFrom: "wrzesień 2026",
    setting: "sea",
    seaKm: 1.2,
    airport: { code: "SUF", name: "Lamezia Terme", minutes: 60 },
    hospitalMin: 18,
    pharmacyMin: 4,
    supermarketMin: 9,
    stationMin: 20,
    population: 6300,
    yearRoundServices: false,
    noise: "lively",
    accessNotesPl: "Zaułek dla pieszych. Auto zostaje na parkingu za murami, 7 minut pieszo. Schody wewnętrzne strome.",
    accessNotesIt: "Vicolo pedonale. L’auto resta nel parcheggio extra moenia, 7 minuti a piedi. Scale interne ripide.",
    offSeasonPl:
      "Po październiku wiele lokali zamyka. Zimą zostaje apteka, mały market i urząd. Latem uliczka jest głośna do późna.",
    offSeasonIt:
      "Dopo ottobre molti locali chiudono. In inverno restano farmacia, un mini market e il municipio. In estate il vicolo è rumoroso fino a tardi.",
    images: ["/homes/tropea.jpg", ...interiors],
    collections: ["sea", "ready", "under150", "agent"],
    bestFor: ["vacation", "investment"],
    cadastralCategory: "A/4",
    energyClass: "G",
    condoAnnual: 420,
    renovationMin: 4000,
    renovationMax: 9000,
    localManagement: true,
    agentPick: true,
    lat: 38.679,
    lng: 15.897,
    travelFrom: {
      Warszawa: "2 loty, ok. 7,5 h",
      Kraków: "2 loty, ok. 7 h",
      Wrocław: "2 loty, ok. 7,5 h",
      Gdańsk: "2 loty, ok. 8,5 h",
      Poznań: "2 loty, ok. 8 h",
      Katowice: "2 loty, ok. 7 h",
    },
    descriptionPl:
      "Klasyczny palazzo nad klifem. Światło, kamień i historia — ale też schody, brak parkingu przy drzwiach i sezonowość miasteczka. Dokumenty są kompletne: to jeden z nielicznych domów z pełnym dossier.",
    descriptionIt:
      "Palazzo classico sul costone. Luce, pietra e storia — ma anche scale, niente parcheggio alla porta e una spiccata stagionalità. I documenti sono completi: uno dei rari dossier chiusi.",
    warningsPl: ["Brak parkingu przy domu.", "Zimą część usług zamknięta.", "Klasa energetyczna G."],
    warningsIt: ["Nessun parcheggio all’immobile.", "In inverno parte dei servizi è chiusa.", "Classe energetica G."],
    livePl: [
      "Piękne, ale wymagające na co dzień: zakupy z torbą pod górę.",
      "Ochrona zdrowia w Vibo, 25 minut.",
      "Dla stałego zamieszkania zimą — tylko jeśli akceptujesz ciszę poza sezonem.",
    ],
    liveIt: [
      "Bello, ma impegnativo nel quotidiano: spesa con borsa in salita.",
      "Sanità a Vibo, 25 minuti.",
      "Per viverci d’inverno solo se accetti il silenzio fuori stagione.",
    ],
    investPl: [
      "Bardzo silny popyt lipiec–sierpień.",
      "Regulamin centrum historycznego: sprawdzić ograniczenia krótkiego najmu.",
      "Scenariusz ostrożny: 8–10 tygodni wysokich stawek.",
    ],
    investIt: [
      "Domanda molto forte a luglio–agosto.",
      "Centro storico: verificare i limiti agli affitti brevi.",
      "Scenario prudente: 8–10 settimane ad alto tariffario.",
    ],
    yieldCautious: "3,1%",
    yieldBase: "4,8%",
    yieldFair: "6,2%",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-06-18" },
      deed: { status: "verified", professional: "Notaio Greco", role: "notaio", date: "2026-06-22" },
      cadastre: { status: "verified", professional: "Geom. Russo", role: "geometra", date: "2026-06-24" },
      plan: { status: "verified", professional: "Geom. Russo", role: "geometra", date: "2026-06-24" },
      category: { status: "verified", professional: "Geom. Russo", role: "geometra", date: "2026-06-24" },
      urban: { status: "verified", professional: "Avv. Greco", role: "avvocato", date: "2026-07-03" },
      ape: { status: "verified", professional: "Ing. Leone", role: "certificatore", date: "2026-05-30" },
      condo: { status: "verified", professional: "Amm. Ferraro", role: "amministratore", date: "2026-06-12" },
      liens: { status: "verified", professional: "Avv. Greco", role: "avvocato", date: "2026-07-03" },
      occupancy: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-20" },
    }),
  },
  {
    id: "sirmione",
    titlePl: "Apartament nad jeziorem",
    titleIt: "Appartamento sul lago",
    city: "Sirmione",
    region: "Lombardia",
    priceEur: 198000,
    sqm: 68,
    rooms: 2,
    baths: 1,
    floor: "1",
    terrace: true,
    garden: false,
    parking: true,
    elevator: true,
    condition: "ready",
    furnished: "included",
    availableFrom: "od zaraz",
    setting: "lake",
    seaKm: null,
    airport: { code: "VRN", name: "Verona Villafranca", minutes: 35 },
    hospitalMin: 16,
    pharmacyMin: 5,
    supermarketMin: 6,
    stationMin: 12,
    population: 8200,
    yearRoundServices: true,
    noise: "moderate",
    accessNotesPl: "Winda, miejsce w garażu. Dojazd wąski w sezonie — rano i wieczorem korki na półwyspie.",
    accessNotesIt: "Ascensore e posto auto. Accesso stretto in stagione — code mattina e sera sulla penisola.",
    offSeasonPl: "Sirmione żyje cały rok. Mgła zimowa nad jeziorem, usługi otwarte.",
    offSeasonIt: "Sirmione vive tutto l’anno. Nebbia invernale sul lago, servizi aperti.",
    images: ["/homes/sirmione.jpg", ...interiors],
    collections: ["ready", "airport", "agent"],
    bestFor: ["vacation", "relocation", "retirement"],
    cadastralCategory: "A/2",
    energyClass: "D",
    condoAnnual: 1680,
    renovationMin: 0,
    renovationMax: 1500,
    localManagement: true,
    agentPick: true,
    lat: 45.497,
    lng: 10.607,
    travelFrom: {
      Warszawa: "1 lot do Bergamo/Werony, ok. 5 h",
      Kraków: "1 lot, ok. 4,5 h",
      Wrocław: "1 lot, ok. 5 h",
      Gdańsk: "1 lot, ok. 5,5 h",
      Poznań: "1 lot, ok. 5 h",
      Katowice: "1 lot, ok. 4,5 h",
    },
    descriptionPl:
      "Jezioro zamiast morza, winda, garaż i meble w cenie. Łatwiejsze życie zimą niż na południu, wyższy koszt wspólnoty i cena.",
    descriptionIt:
      "Il lago al posto del mare, ascensore, garage e arredo incluso. Inverno più semplice del Sud, spese condominiali e prezzo più alti.",
    warningsPl: ["Wyższe opłaty wspólnoty.", "Półwysep zatłoczony w sierpniu."],
    warningsIt: ["Spese condominiali più alte.", "Penisola affollata ad agosto."],
    livePl: [
      "Szpitale w Desenzano i Peschiera.",
      "Połączenia kolejowe do Mediolanu i Werony.",
      "Społeczność międzynarodowa obecna cały rok.",
    ],
    liveIt: [
      "Ospedali a Desenzano e Peschiera.",
      "Treni per Milano e Verona.",
      "Comunità internazionale presente tutto l’anno.",
    ],
    investPl: [
      "Sezon dłuższy niż na południu, ale konkurencja najmu duża.",
      "Regulamin wspólnoty ogranicza imprezy — sprawdzić najem krótkoterminowy.",
      "Scenariusz ostrożny: 14 tygodni.",
    ],
    investIt: [
      "Stagione più lunga del Sud, ma concorrenza locativa alta.",
      "Il regolamento limita gli eventi — verificare gli affitti brevi.",
      "Scenario prudente: 14 settimane.",
    ],
    yieldCautious: "2,4%",
    yieldBase: "3,5%",
    yieldFair: "4,6%",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-28" },
      deed: { status: "received", professional: "Notaio Bianchi", role: "notaio", date: "2026-08-02" },
      cadastre: { status: "verified", professional: "Geom. Riva", role: "geometra", date: "2026-08-04" },
      plan: { status: "verified", professional: "Geom. Riva", role: "geometra", date: "2026-08-04" },
      category: { status: "verified", professional: "Geom. Riva", role: "geometra", date: "2026-08-04" },
      urban: { status: "in_review", professional: "Avv. Sala", role: "avvocato" },
      ape: { status: "verified", professional: "Ing. Costa", role: "certificatore", date: "2026-07-12" },
      condo: { status: "received", professional: "Amm. Garda", role: "amministratore", date: "2026-07-30" },
      liens: { status: "requested", professional: "Avv. Sala", role: "avvocato" },
      occupancy: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-08-06" },
    }),
  },
  {
    id: "ostuni",
    titlePl: "Biały dom z tarasem",
    titleIt: "Casa bianca con terrazza",
    city: "Ostuni",
    region: "Puglia",
    priceEur: 168000,
    sqm: 110,
    rooms: 3,
    baths: 2,
    floor: "parter + 1",
    terrace: true,
    garden: true,
    parking: true,
    elevator: false,
    condition: "ready",
    furnished: "none",
    availableFrom: "październik 2026",
    setting: "countryside",
    seaKm: 8,
    airport: { code: "BRI", name: "Bari", minutes: 75 },
    hospitalMin: 14,
    pharmacyMin: 8,
    supermarketMin: 7,
    stationMin: 16,
    population: 31000,
    yearRoundServices: true,
    noise: "quiet",
    accessNotesPl: "Droga asfaltowa do bramy, ostatnie 80 m żwir. Miejsce na dwa auta. Parter bez schodów.",
    accessNotesIt: "Asfalto fino al cancello, ultimi 80 m in ghiaia. Posto per due auto. Piano terra senza scale.",
    offSeasonPl: "Ostuni działa zimą. Morze jest dalej — 15 minut autem do plaży.",
    offSeasonIt: "Ostuni funziona d’inverno. Il mare è più lontano — 15 minuti in auto.",
    images: ["/homes/ostuni.jpg", ...interiors],
    collections: ["ready", "agent"],
    bestFor: ["vacation", "relocation", "retirement"],
    cadastralCategory: "A/7",
    energyClass: "C",
    condoAnnual: 0,
    renovationMin: 2000,
    renovationMax: 6000,
    localManagement: false,
    agentPick: true,
    lat: 40.729,
    lng: 17.577,
    travelFrom: {
      Warszawa: "1 lot do Bari, ok. 6 h",
      Kraków: "1 lot, ok. 5,5 h",
      Wrocław: "1 lot, ok. 6 h",
      Gdańsk: "1–2 loty, ok. 7 h",
      Poznań: "1–2 loty, ok. 6,5 h",
      Katowice: "1 lot, ok. 5,5 h",
    },
    descriptionPl:
      "Biel, ogród i cisza poza miastem. Morze nie jest pod oknem — to uczciwa odległość 8 km. Dom wolnostojący, bez wspólnoty, więc zarządzanie z Polski wymaga opiekuna.",
    descriptionIt:
      "Bianco, giardino e silenzio fuori città. Il mare non è sotto la finestra — sono 8 km onesti. Casa indipendente, senza condominio: da Polonia serve un custode.",
    warningsPl: ["Brak lokalnego zarządcy w cenie.", "Ostatni odcinek drogi żwirowy."],
    warningsIt: ["Nessun custode incluso.", "Ultimo tratto di strada in ghiaia."],
    livePl: [
      "Szpital i szkoły w Ostuni.",
      "Ogród wymaga wody latem — studnia na działce, do weryfikacji wydajności.",
      "Sąsiedztwo spokojne, kilka domów międzynarodowych.",
    ],
    liveIt: [
      "Ospedale e scuole a Ostuni.",
      "Il giardino chiede acqua d’estate — pozzo in lotto, da verificare.",
      "Vicinato quieto, alcune case internazionali.",
    ],
    investPl: [
      "Popyt na wille z ogrodem w Puglii jest stabilny, ale 8 km od morza obniża stawkę vs. plaża.",
      "Brak ograniczeń wspólnoty.",
      "Scenariusz ostrożny: 9 tygodni.",
    ],
    investIt: [
      "Domanda sulle ville con giardino in Puglia è stabile, ma 8 km dal mare abbassano la tariffa.",
      "Nessun vincolo condominiale.",
      "Scenario prudente: 9 settimane.",
    ],
    yieldCautious: "2,9%",
    yieldBase: "4,0%",
    yieldFair: "5,1%",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-08" },
      deed: { status: "verified", professional: "Notaio Greco", role: "notaio", date: "2026-07-15" },
      cadastre: { status: "verified", professional: "Geom. Greco", role: "geometra", date: "2026-07-16" },
      plan: { status: "verified", professional: "Geom. Greco", role: "geometra", date: "2026-07-16" },
      category: { status: "verified", professional: "Geom. Greco", role: "geometra", date: "2026-07-16" },
      urban: { status: "received", professional: "Avv. Greco", role: "avvocato", date: "2026-07-21" },
      ape: { status: "verified", professional: "Ing. Leone", role: "certificatore", date: "2026-06-02" },
      condo: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-08", notePl: "Brak wspólnoty — dom wolnostojący.", noteIt: "Nessun condominio — casa indipendente." },
      liens: { status: "in_review", professional: "Avv. Greco", role: "avvocato" },
      occupancy: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-25" },
    }),
  },
  {
    id: "levanto",
    titlePl: "Apartament liguryjski",
    titleIt: "Appartamento ligure",
    city: "Levanto",
    region: "Liguria",
    priceEur: 215000,
    sqm: 64,
    rooms: 2,
    baths: 1,
    floor: "3",
    terrace: false,
    garden: false,
    parking: false,
    elevator: false,
    condition: "light",
    furnished: "none",
    availableFrom: "do uzgodnienia",
    setting: "sea",
    seaKm: 0.4,
    airport: { code: "PSA", name: "Pisa", minutes: 80 },
    hospitalMin: 8,
    pharmacyMin: 3,
    supermarketMin: 5,
    stationMin: 6,
    population: 5300,
    yearRoundServices: true,
    noise: "moderate",
    accessNotesPl: "Trzecie piętro, wąska klatka, bez windy. Ulica jednokierunkowa, parkowanie trudne w sierpniu.",
    accessNotesIt: "Terzo piano, vano scale stretto, niente ascensore. Senso unico, parcheggio difficile ad agosto.",
    offSeasonPl: "Levanto żyje zimą dzięki pociągom Cinque Terre. Deszczowa zima liguryjska.",
    offSeasonIt: "Levanto vive d’inverno grazie ai treni delle Cinque Terre. Inverno ligure piovoso.",
    images: ["/homes/levanto.jpg", ...interiors],
    collections: ["sea", "investment"],
    bestFor: ["vacation", "investment"],
    cadastralCategory: "A/3",
    energyClass: "F",
    condoAnnual: 1240,
    renovationMin: 18000,
    renovationMax: 28000,
    localManagement: true,
    agentPick: false,
    lat: 44.17,
    lng: 9.612,
    travelFrom: {
      Warszawa: "1 lot do Pizy/Mediolanu, ok. 6,5 h",
      Kraków: "1 lot, ok. 6 h",
      Wrocław: "1 lot, ok. 6,5 h",
      Gdańsk: "1–2 loty, ok. 7,5 h",
      Poznań: "1 lot, ok. 6,5 h",
      Katowice: "1 lot, ok. 6 h",
    },
    descriptionPl:
      "Blisko morza i stacji — ale trzecie piętro bez windy i prace 18–28 tys. euro. Dossier ma lukę: zgodność urbanistyczna w toku, jeden punkt oznaczony jako problem do rozwiązania przed rogito.",
    descriptionIt:
      "Vicino al mare e alla stazione — ma terzo piano senza ascensore e lavori da 18–28 mila euro. Il dossier ha un vuoto: conformità urbanistica in corso, un punto da chiudere prima del rogito.",
    warningsPl: [
      "Prace 18–28 tys. € przed komfortowym użytkowaniem.",
      "Zgodność urbanistyczna: relacja zamówiona, nie zamknięta.",
      "Brak parkingu.",
    ],
    warningsIt: [
      "Lavori 18–28 mila € prima di un uso confortevole.",
      "Conformità urbanistica: relazione richiesta, non chiusa.",
      "Nessun parcheggio.",
    ],
    livePl: [
      "Pociąg do Cinque Terre w kilka minut.",
      "Zimą wilgoć — okna do wymiany w zakresie prac.",
      "Apteka i przychodnia w miasteczku.",
    ],
    liveIt: [
      "Treno per le Cinque Terre in pochi minuti.",
      "Umidità invernale — infissi da sostituire nel piano lavori.",
      "Farmacia e ambulatorio in paese.",
    ],
    investPl: [
      "Bardzo silny popyt turystyczny, ale mieszkanie wymaga prac zanim pójdzie w najem.",
      "Wspólnota: sprawdzić regulamin krótkiego najmu.",
      "Nie liczyć zysku, dopóki roboty nie skończą się.",
    ],
    investIt: [
      "Domanda turistica fortissima, ma servono i lavori prima di locare.",
      "Condominio: verificare il regolamento affitti brevi.",
      "Non contare un rendimento finché i lavori non sono chiusi.",
    ],
    yieldCautious: "n/d do prac",
    yieldBase: "3,6% po pracach",
    yieldFair: "5,0% po pracach",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-08-04" },
      deed: { status: "received", professional: "Notaio Fieschi", role: "notaio", date: "2026-08-08" },
      cadastre: { status: "verified", professional: "Geom. Viale", role: "geometra", date: "2026-08-09" },
      plan: { status: "in_review", professional: "Geom. Viale", role: "geometra" },
      category: { status: "verified", professional: "Geom. Viale", role: "geometra", date: "2026-08-09" },
      urban: {
        status: "issue",
        professional: "Avv. Spinelli",
        role: "avvocato",
        date: "2026-08-10",
        notePl: "Niewielka rozbieżność okna na poddaszu. Nie blokuje oferty, musi być zamknięta przed aktem.",
        noteIt: "Lieve difformità di un abbaino. Non blocca la proposta, va chiusa prima del rogito.",
        solutionPl: "Sanatoria u geometra, szacunek 1 200–1 800 €, 4–6 tygodni.",
        solutionIt: "Sanatoria del geometra, stima 1.200–1.800 €, 4–6 settimane.",
      },
      ape: { status: "requested", professional: "Ing. Costa", role: "certificatore" },
      condo: { status: "received", professional: "Amm. Levante", role: "amministratore", date: "2026-08-01" },
      liens: { status: "in_review", professional: "Avv. Spinelli", role: "avvocato" },
      occupancy: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-08-05" },
    }),
  },
  {
    id: "scanno",
    titlePl: "Kamienny dom w górach",
    titleIt: "Casa in pietra in montagna",
    city: "Scanno",
    region: "Abruzzo",
    priceEur: 89000,
    sqm: 120,
    rooms: 3,
    baths: 1,
    floor: "parter + 1",
    terrace: false,
    garden: true,
    parking: true,
    elevator: false,
    condition: "renovate",
    furnished: "none",
    availableFrom: "po opróżnieniu, ok. 60 dni",
    setting: "mountain",
    seaKm: null,
    airport: { code: "PSA", name: "Pescara / Roma", minutes: 110 },
    hospitalMin: 35,
    pharmacyMin: 8,
    supermarketMin: 10,
    stationMin: 40,
    population: 1800,
    yearRoundServices: false,
    noise: "quiet",
    accessNotesPl: "Zimą możliwy śnieg na ostatnim kilometrze. Miejsce na auto przy domu. Schody kamienne wewnątrz.",
    accessNotesIt: "In inverno possibile neve sull’ultimo chilometro. Posto auto a casa. Scale in pietra interne.",
    offSeasonPl:
      "Poza sezonem narciarskim i sierpniem wieś jest bardzo cicha. Część barów zamyka. Apteka i mały sklep zostają.",
    offSeasonIt:
      "Fuori stagione sciistica e agosto il paese è silenziosissimo. Parte dei bar chiude. Farmacia e bottega restano.",
    images: ["/homes/scanno.jpg", ...interiors],
    collections: ["under150"],
    bestFor: ["vacation", "retirement"],
    cadastralCategory: "A/4",
    energyClass: "G",
    condoAnnual: 0,
    renovationMin: 22000,
    renovationMax: 38000,
    localManagement: false,
    agentPick: false,
    lat: 41.904,
    lng: 13.879,
    travelFrom: {
      Warszawa: "1 lot do Rzymu + auto, ok. 8 h",
      Kraków: "1 lot + auto, ok. 8 h",
      Wrocław: "1 lot + auto, ok. 8,5 h",
      Gdańsk: "1–2 loty + auto, ok. 9 h",
      Poznań: "1 lot + auto, ok. 8,5 h",
      Katowice: "1 lot + auto, ok. 8 h",
    },
    descriptionPl:
      "Cena poniżej 100 tysięcy nie jest prezentem: dom wymaga prac 22–38 tys. euro, zimą dojazd bywa trudny, a usługi sezonowe. Pokazujemy to uczciwie, bo niska cena bez kontekstu wprowadza w błąd.",
    descriptionIt:
      "Un prezzo sotto i 100 mila non è un regalo: servono lavori da 22–38 mila euro, in inverno l’accesso può essere duro e i servizi sono stagionali. Lo diciamo chiaro, perché il prezzo nudo inganna.",
    warningsPl: ["Remont konieczny przed zamieszkaniem.", "Daleko od lotniska.", "Nie wszystkie usługi całoroczne."],
    warningsIt: ["Ristrutturazione necessaria prima di abitare.", "Lontano dall’aeroporto.", "Servizi non tutti annuali."],
    livePl: [
      "Ochrona zdrowia w Sulmonie, 35 minut — zimą sprawdzić przejezdność.",
      "Piękno krajobrazu jest realne, izolacja też.",
      "Dla emerytury: tylko jeśli lubisz ciszę i samochód.",
    ],
    liveIt: [
      "Sanità a Sulmona, 35 minuti — d’inverno verificare la viabilità.",
      "Il paesaggio è vero, l’isolamento anche.",
      "Per la pensione: solo se ami silenzio e automobile.",
    ],
    investPl: [
      "Najem turystyczny weekendowy i sierpniowy, nie całoroczny.",
      "Najpierw koszt robót, potem ewentualny przychód.",
      "Scenariusz ostrożny po remoncie: 6–8 tygodni.",
    ],
    investIt: [
      "Locazione turistica weekend e agosto, non annuale.",
      "Prima i lavori, poi un eventuale reddito.",
      "Scenario prudente post-ristrutturazione: 6–8 settimane.",
    ],
    yieldCautious: "po remoncie 1,9%",
    yieldBase: "po remoncie 2,8%",
    yieldFair: "po remoncie 3,7%",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-06-30" },
      deed: { status: "received", professional: "Notaio Di Carlo", role: "notaio", date: "2026-07-06" },
      cadastre: { status: "verified", professional: "Geom. D'Angelo", role: "geometra", date: "2026-07-07" },
      plan: { status: "requested", professional: "Geom. D'Angelo", role: "geometra", notePl: "Planimetria z 1989, wymaga aktualizacji.", noteIt: "Planimetria del 1989, da aggiornare." },
      category: { status: "verified", professional: "Geom. D'Angelo", role: "geometra", date: "2026-07-07" },
      urban: { status: "in_review", professional: "Avv. Di Carlo", role: "avvocato" },
      ape: { status: "requested", professional: "Ing. Leone", role: "certificatore" },
      condo: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-06-30", notePl: "Brak wspólnoty.", noteIt: "Nessun condominio." },
      liens: { status: "in_review", professional: "Avv. Di Carlo", role: "avvocato" },
      occupancy: { status: "received", professional: "Chiara Moretti", role: "agente", date: "2026-07-01", notePl: "Lokal częściowo zastawiony meblami właściciela.", noteIt: "Immobile parzialmente occupato da mobili del proprietario." },
    }),
  },
  {
    id: "catania",
    titlePl: "Apartament przy lotnisku",
    titleIt: "Appartamento vicino all’aeroporto",
    city: "Catania",
    region: "Sicilia",
    priceEur: 118000,
    sqm: 72,
    rooms: 2,
    baths: 1,
    floor: "3",
    terrace: true,
    garden: false,
    parking: true,
    elevator: true,
    condition: "ready",
    furnished: "partial",
    availableFrom: "od zaraz",
    setting: "city",
    seaKm: 2.4,
    airport: { code: "CTA", name: "Catania Fontanarossa", minutes: 18 },
    hospitalMin: 10,
    pharmacyMin: 4,
    supermarketMin: 5,
    stationMin: 12,
    population: 300000,
    yearRoundServices: true,
    noise: "moderate",
    accessNotesPl: "Winda, garaż w podziemiu. Ulica miejska, rumor umiarkowany. Etna widoczna z tarasu.",
    accessNotesIt: "Ascensore, garage interrato. Strada urbana, rumore moderato. L’Etna è visibile dal terrazzo.",
    offSeasonPl: "Catania nie zamyka się zimą. Miasto uniwersyteckie, usługi całoroczne, lato gorące.",
    offSeasonIt: "Catania non chiude d’inverno. Città universitaria, servizi annuali, estate calda.",
    images: ["/homes/catania.jpg", ...interiors],
    collections: ["ready", "under150", "investment", "airport", "agent"],
    bestFor: ["investment", "relocation", "vacation"],
    cadastralCategory: "A/3",
    energyClass: "D",
    condoAnnual: 1100,
    renovationMin: 0,
    renovationMax: 3500,
    localManagement: true,
    agentPick: true,
    lat: 37.507,
    lng: 15.083,
    travelFrom: {
      Warszawa: "1 lot bezpośredni lub 1 przesiadka, ok. 5,5 h",
      Kraków: "1 lot, ok. 5 h",
      Wrocław: "1 lot, ok. 5,5 h",
      Gdańsk: "1 lot, ok. 6 h",
      Poznań: "1 lot, ok. 5,5 h",
      Katowice: "1 lot, ok. 5 h",
    },
    descriptionPl:
      "Miasto, winda, osiemnaście minut na lotnisko. Dobry profil pod inwestycję i pod własne przyloty. Morze jest w mieście, nie pod balkonem.",
    descriptionIt:
      "Città, ascensore, diciotto minuti dall’aeroporto. Buon profilo per investimento e per i propri arrivi. Il mare è in città, non sotto il balcone.",
    warningsPl: ["Ruch lotniczy słyszalny przy wschodnim wietrze.", "Lato bardzo gorące."],
    warningsIt: ["Traffico aereo udibile con vento di levante.", "Estate molto calda."],
    livePl: [
      "Szpitale kliniczne w Catani.",
      "Supermarkety, szkoła, poczta w dzielnicy.",
      "Zarządca wspólnoty odpowiada na telefon.",
    ],
    liveIt: [
      "Ospedali clinici a Catania.",
      "Supermercato, scuola, poste in quartiere.",
      "L’amministratore risponde al telefono.",
    ],
    investPl: [
      "Popyt mieszany: turyści, studenci, krótkie pobyty przy lotnisku.",
      "Wspólnota dopuszcza najem — potwierdzone w regulaminie.",
      "Scenariusz ostrożny: 18 tygodni łącznego obłożenia (turystyka + średni termin).",
    ],
    investIt: [
      "Domanda mista: turisti, studenti, soggiorni brevi da aeroporto.",
      "Il condominio ammette la locazione — confermato in regolamento.",
      "Scenario prudente: 18 settimane di occupazione mista.",
    ],
    yieldCautious: "3,4%",
    yieldBase: "4,7%",
    yieldFair: "6,0%",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-19" },
      deed: { status: "verified", professional: "Notaio Arena", role: "notaio", date: "2026-07-22" },
      cadastre: { status: "verified", professional: "Geom. Puglisi", role: "geometra", date: "2026-07-23" },
      plan: { status: "verified", professional: "Geom. Puglisi", role: "geometra", date: "2026-07-23" },
      category: { status: "verified", professional: "Geom. Puglisi", role: "geometra", date: "2026-07-23" },
      urban: { status: "received", professional: "Avv. Arena", role: "avvocato", date: "2026-07-28" },
      ape: { status: "verified", professional: "Ing. Leone", role: "certificatore", date: "2026-07-01" },
      condo: { status: "verified", professional: "Amm. Etna", role: "amministratore", date: "2026-07-18" },
      liens: { status: "in_review", professional: "Avv. Arena", role: "avvocato" },
      occupancy: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-08-01" },
    }),
  },
  {
    id: "viareggio",
    titlePl: "Apartament w Viareggio",
    titleIt: "Appartamento a Viareggio",
    city: "Viareggio",
    region: "Toscana",
    priceEur: 239000,
    sqm: 88,
    rooms: 2,
    baths: 1,
    floor: "2",
    terrace: true,
    garden: false,
    parking: true,
    elevator: true,
    condition: "ready",
    furnished: "included",
    availableFrom: "od zaraz",
    setting: "sea",
    seaKm: 0.8,
    airport: { code: "PSA", name: "Pisa", minutes: 25 },
    hospitalMin: 9,
    pharmacyMin: 4,
    supermarketMin: 6,
    stationMin: 8,
    population: 61000,
    yearRoundServices: true,
    noise: "moderate",
    accessNotesPl: "Winda, miejsce postojowe. Budynek libertyjski, klatka odnowiona. Plaża 10 minut pieszo.",
    accessNotesIt: "Ascensore e posto auto. Palazzo liberty, vano scale ristrutturato. Spiaggia a 10 minuti a piedi.",
    offSeasonPl: "Viareggio jest miastem, nie wioską. Zimą promenada cichnie, sklepy zostają.",
    offSeasonIt: "Viareggio è città, non borgo. In inverno il viale tace, i negozi restano.",
    images: ["/homes/viareggio.jpg", ...interiors],
    collections: ["sea", "ready", "airport", "agent"],
    bestFor: ["vacation", "relocation", "retirement"],
    cadastralCategory: "A/2",
    energyClass: "C",
    condoAnnual: 1860,
    renovationMin: 0,
    renovationMax: 2000,
    localManagement: true,
    agentPick: true,
    lat: 43.874,
    lng: 10.255,
    travelFrom: {
      Warszawa: "1 lot do Pizy, ok. 5 h",
      Kraków: "1 lot, ok. 4,5 h",
      Wrocław: "1 lot, ok. 5 h",
      Gdańsk: "1 lot, ok. 5,5 h",
      Poznań: "1 lot, ok. 5 h",
      Katowice: "1 lot, ok. 4,5 h",
    },
    descriptionPl:
      "Toskania, morze, lotnisko w 25 minut, mieszkanie gotowe i umeblowane. Wyższa cena i wyższe opłaty — w zamian miasto, które nie umiera zimą.",
    descriptionIt:
      "Toscana, mare, aeroporto in 25 minuti, casa pronta e arredata. Prezzo e spese più alti — in cambio una città che d’inverno non muore.",
    warningsPl: ["Budżet powyżej 150 tys. plus koszty transakcji.", "Opłaty wspólnoty wśród najwyższych w zestawieniu."],
    warningsIt: ["Budget oltre 150 mila più costi di transazione.", "Spese condominiali tra le più alte della selezione."],
    livePl: [
      "Szpital Versilia w Lido di Camaiore.",
      "Pociągi do Florencji i Pizy.",
      "Łatwo zarządzać z Polski: winda, garaż, dozorca.",
    ],
    liveIt: [
      "Ospedale Versilia a Lido di Camaiore.",
      "Treni per Firenze e Pisa.",
      "Facile da gestire dalla Polonia: ascensore, garage, portineria.",
    ],
    investPl: [
      "Sezon długi, ale cena zakupu zjada część stopy zwrotu.",
      "Regulamin: najem krótkoterminowy do zgłoszenia administratorowi.",
      "Scenariusz ostrożny: 12 tygodni.",
    ],
    investIt: [
      "Stagione lunga, ma il prezzo d’acquisto comprime il rendimento.",
      "Regolamento: affitti brevi da comunicare all’amministratore.",
      "Scenario prudente: 12 settimane.",
    ],
    yieldCautious: "2,2%",
    yieldBase: "3,3%",
    yieldFair: "4,2%",
    checks: dossier({
      owner: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-07-12" },
      deed: { status: "verified", professional: "Notaio Puccini", role: "notaio", date: "2026-07-18" },
      cadastre: { status: "verified", professional: "Geom. Viali", role: "geometra", date: "2026-07-19" },
      plan: { status: "in_review", professional: "Geom. Viali", role: "geometra" },
      category: { status: "verified", professional: "Geom. Viali", role: "geometra", date: "2026-07-19" },
      urban: { status: "verified", professional: "Avv. Puccini", role: "avvocato", date: "2026-07-25" },
      ape: { status: "verified", professional: "Ing. Costa", role: "certificatore", date: "2026-06-15" },
      condo: { status: "received", professional: "Amm. Versilia", role: "amministratore", date: "2026-07-10" },
      liens: { status: "verified", professional: "Avv. Puccini", role: "avvocato", date: "2026-07-25" },
      occupancy: { status: "verified", professional: "Chiara Moretti", role: "agente", date: "2026-08-03" },
    }),
  },
];

export function getProperty(id: string) {
  return PROPERTIES.find((p) => p.id === id);
}

export function completedChecks(p: Property) {
  return p.checks.filter((c) => c.status === "verified" || c.status === "received").length;
}

export function checkScore(p: Property) {
  return completedChecks(p);
}
