import type { Property } from "@/data/properties";

export const AGENT_TODAY = {
  name: "Chiara Moretti",
  city: "Scalea",
  region: "Calabria",
  until: "18:00",
  propertyId: "scalea",
  photo: "/homes/chiara.jpg",
  linePl: "Jestem dziś w Scalea. Mogę połączyć Cię z tarasu przed 18:00.",
  lineIt: "Oggi sono a Scalea. Posso collegarti dal terrazzo prima delle 18.",
} as const;

export type SeasonStory = {
  winterImage?: string;
  winterLives: boolean;
  summerPl: string;
  winterPl: string;
  summerIt: string;
  winterIt: string;
  honestyPl: string;
  honestyIt: string;
};

export type LifeCostInput = {
  utilitiesMonth: number;
  heatingWinterMonth: number;
  winterMonths: number;
  caretakerMonth: number;
  flightRoundEur: number;
  visitsPerYear: number;
  internetMonth: number;
  emptyMonths: number;
};

export type WeekendPlan = {
  from: string;
  outbound: string;
  inbound: string;
  days: { t: string; pl: string; it: string }[];
  flightMin: number;
  flightMax: number;
  stayNotePl: string;
  stayNoteIt: string;
};

export const SEASONS: Record<string, SeasonStory> = {
  scalea: {
    winterImage: "/homes/scalea-winter.jpg",
    winterLives: true,
    summerPl: "Sierpień. Plaża pełna, taras w słońcu, miasteczko głośne do północy.",
    winterPl: "Styczeń. Parasole zwinięte, morze szare, piekarnia i przychodnia otwarte.",
    summerIt: "Agosto. Spiaggia piena, terrazzo al sole, paese sveglio fino a mezzanotte.",
    winterIt: "Gennaio. Ombrelloni chiusi, mare grigio, panificio e ambulatorio aperti.",
    honestyPl: "Polacy oglądają Włochy w sierpniu. Kupują na styczeń. Tu pokazujemy oba.",
    honestyIt: "I polacchi visitano ad agosto. Comprano per gennaio. Qui mostriamo entrambi.",
  },
  tropea: {
    winterImage: "/homes/tropea-winter.jpg",
    winterLives: false,
    summerPl: "Lipiec–sierpień. Uliczka pełna, lokale do późna, klif jak z pocztówki.",
    winterPl: "Listopad–marzec. Wiele lokali zamkniętych. Zostaje apteka, market, urząd.",
    summerIt: "Luglio–agosto. Vicolo pieno, locali fino a tardi, costone da cartolina.",
    winterIt: "Novembre–marzo. Molti locali chiusi. Restano farmacia, market, municipio.",
    honestyPl: "Tropea latem jest teatrem. Zimą — cichym miasteczkiem na klifie. Oba są prawdziwe.",
    honestyIt: "Tropea d’estate è teatro. D’inverno un borgo silenzioso sul costone. Entrambi veri.",
  },
  ostuni: {
    winterImage: "/homes/ostuni-winter.jpg",
    winterLives: true,
    summerPl: "Sierpień. Biel, ogród, cicadas. Morze 15 minut autem.",
    winterPl: "Styczeń. Ogród śpi, miasto działa, przychodnia i szkoły otwarte.",
    summerIt: "Agosto. Bianco, giardino, cicale. Mare a 15 minuti.",
    winterIt: "Gennaio. Giardino a riposo, città aperta, ambulatorio e scuole.",
    honestyPl: "To nie plaża pod oknem. To 8 km i miasto, które zimą nie umiera.",
    honestyIt: "Non è la spiaggia sotto la finestra. Sono 8 km e una città che d’inverno vive.",
  },
  scanno: {
    winterImage: "/homes/scanno-winter.jpg",
    winterLives: false,
    summerPl: "Sierpień. Górskie powietrze, jezioro, weekendowy ruch.",
    winterPl: "Styczeń. Śnieg na ostatnim kilometrze, wieś bardzo cicha, apteka zostaje.",
    summerIt: "Agosto. Aria di montagna, lago, traffico del weekend.",
    winterIt: "Gennaio. Neve sull’ultimo chilometro, paese silenzioso, farmacia aperta.",
    honestyPl: "Cena pod 100 tysięcy nie kasuje zimy, śniegu i 35 minut do szpitala.",
    honestyIt: "Il prezzo sotto i 100 mila non cancella inverno, neve e 35 minuti dall’ospedale.",
  },
  sirmione: {
    winterLives: true,
    summerPl: "Sierpień. Półwysep pełny, korki rano i wieczorem, jezioro jak basen.",
    winterPl: "Styczeń. Mgła nad Gardą, pociągi i szpitale działają, miasteczko żyje.",
    summerIt: "Agosto. Penisola piena, code, lago come una piscina.",
    winterIt: "Gennaio. Nebbia sul Garda, treni e ospedali aperti, il paese vive.",
    honestyPl: "Tu zima nie wyłącza miasta. Płacisz za to wyższą ceną i wspólnotą.",
    honestyIt: "Qui l’inverno non spegne la città. Lo paghi in prezzo e condominio.",
  },
  levanto: {
    winterLives: true,
    summerPl: "Sierpień. Cinque Terre, kolejka na stacji, parking niemożliwy.",
    winterPl: "Styczeń. Deszcz liguryjski, pociągi zostają, wilgoć w oknach do wymiany.",
    summerIt: "Agosto. Cinque Terre, coda in stazione, parcheggio impossibile.",
    winterIt: "Gennaio. Pioggia ligure, i treni restano, umidità sugli infissi da cambiare.",
    honestyPl: "Miasto żyje zimą. Mieszkanie — dopiero po pracach 18–28 tys. euro.",
    honestyIt: "Il paese vive d’inverno. La casa — solo dopo i lavori da 18–28 mila.",
  },
  catania: {
    winterLives: true,
    summerPl: "Sierpień. 40 stopni, Etna w tle, miasto nie zasypia.",
    winterPl: "Styczeń. Uniwersytet, szpitale, lotnisko. Catania nie ma sezonu wyłączonego.",
    summerIt: "Agosto. 40 gradi, Etna sullo sfondo, la città non dorme.",
    winterIt: "Gennaio. Università, ospedali, aeroporto. Catania non ha bassa stagione.",
    honestyPl: "To nie pocztówka. To miasto, winda i 18 minut na samolot do Polski.",
    honestyIt: "Non è una cartolina. È città, ascensore e 18 minuti dall’aereo per la Polonia.",
  },
  viareggio: {
    winterLives: true,
    summerPl: "Sierpień. Promenada, plaża, Versilia pełna.",
    winterPl: "Styczeń. Miasto zostaje: sklepy, szpital, pociąg do Florencji.",
    summerIt: "Agosto. Passeggiata, spiaggia, Versilia piena.",
    winterIt: "Gennaio. La città resta: negozi, ospedale, treno per Firenze.",
    honestyPl: "Wyższa cena kupuje miasto, które zimą nie umiera. Nie kupuje magii.",
    honestyIt: "Il prezzo più alto compra una città che d’inverno vive. Non compra magia.",
  },
};

export const LIFE_COST: Record<string, LifeCostInput> = {
  scalea: {
    utilitiesMonth: 95,
    heatingWinterMonth: 45,
    winterMonths: 4,
    caretakerMonth: 60,
    flightRoundEur: 210,
    visitsPerYear: 4,
    internetMonth: 28,
    emptyMonths: 8,
  },
  tropea: {
    utilitiesMonth: 90,
    heatingWinterMonth: 40,
    winterMonths: 4,
    caretakerMonth: 70,
    flightRoundEur: 220,
    visitsPerYear: 3,
    internetMonth: 28,
    emptyMonths: 9,
  },
  sirmione: {
    utilitiesMonth: 130,
    heatingWinterMonth: 80,
    winterMonths: 5,
    caretakerMonth: 90,
    flightRoundEur: 140,
    visitsPerYear: 5,
    internetMonth: 30,
    emptyMonths: 6,
  },
  ostuni: {
    utilitiesMonth: 110,
    heatingWinterMonth: 55,
    winterMonths: 4,
    caretakerMonth: 95,
    flightRoundEur: 180,
    visitsPerYear: 4,
    internetMonth: 28,
    emptyMonths: 7,
  },
  levanto: {
    utilitiesMonth: 120,
    heatingWinterMonth: 70,
    winterMonths: 5,
    caretakerMonth: 80,
    flightRoundEur: 150,
    visitsPerYear: 4,
    internetMonth: 30,
    emptyMonths: 7,
  },
  scanno: {
    utilitiesMonth: 85,
    heatingWinterMonth: 140,
    winterMonths: 5,
    caretakerMonth: 0,
    flightRoundEur: 190,
    visitsPerYear: 3,
    internetMonth: 32,
    emptyMonths: 9,
  },
  catania: {
    utilitiesMonth: 115,
    heatingWinterMonth: 20,
    winterMonths: 3,
    caretakerMonth: 55,
    flightRoundEur: 120,
    visitsPerYear: 6,
    internetMonth: 28,
    emptyMonths: 4,
  },
  viareggio: {
    utilitiesMonth: 140,
    heatingWinterMonth: 75,
    winterMonths: 5,
    caretakerMonth: 40,
    flightRoundEur: 130,
    visitsPerYear: 5,
    internetMonth: 30,
    emptyMonths: 6,
  },
};

export const STORIES: Record<string, { pl: string; it: string }> = {
  scalea: {
    pl: "Nie sprzedaję pocztówki z sierpnia. To mieszkanie w Scalei: sto dwadzieścia dziewięć tysięcy euro, pięćset metrów od morza, drugie piętro bez windy. Zimą plaża pustoszeje, ale piekarnia i przychodnia zostają. Z Warszawy to dwa loty i około siedmiu godzin. Ostrożny koszt całkowity — około stu pięćdziesięciu tysięcy. Planimetria tarasu i hipoteki są jeszcze w kontroli. Jeśli chcesz, połączę Cię z tarasu przed osiemnastą.",
    it: "Non vendo la cartolina d’agosto. Appartamento a Scalea: centoventinovemila euro, cinquecento metri dal mare, secondo piano senza ascensore. D’inverno la spiaggia si svuota, ma panificio e ambulatorio restano. Da Varsavia due voli, circa sette ore. Costo prudente intorno a centocinquantamila. Planimetria del terrazzo e ipoteche ancora in verifica. Se vuoi, ti collego dal terrazzo prima delle diciotto.",
  },
  tropea: {
    pl: "Tropea jest piękna i wymagająca. Dom w centrum historycznym, sto czterdzieści pięć tysięcy, bez parkingu przy drzwiach, klasa energetyczna G. Dossier jest kompletne — rzadkość. Latem uliczka gra do późna. Zimą zamyka się część lokali. Kupujesz kamień i historię, nie wygodę supermarketu pod blokiem.",
    it: "Tropea è bella e impegnativa. Casa nel centro storico, centoquarantacinquemila, niente parcheggio alla porta, classe G. Il dossier è completo — una rarità. D’estate il vicolo suona fino a tardi. D’inverno chiude parte dei locali. Compri pietra e storia, non il supermercato sotto casa.",
  },
  sirmione: {
    pl: "Jezioro zamiast morza. Winda, garaż, meble w cenie. Sirmione żyje zimą, ale wspólnota jest wyższa i półwysep w sierpniu stoi w korku. Z Krakowa jeden lot, około czterech i pół godziny. To najłatwiejszy dom w selekcji do życia z Polski — i jeden z droższych.",
    it: "Il lago al posto del mare. Ascensore, garage, arredo incluso. Sirmione vive d’inverno, ma il condominio è più alto e ad agosto la penisola è in coda. Da Cracovia un volo, circa quattro ore e mezza. La casa più semplice da vivere dalla Polonia — e tra le più care.",
  },
  ostuni: {
    pl: "Biel, ogród, cisza. Morze jest osiem kilometrów stąd — mówię to od razu. Dom wolnostojący, bez wspólnoty, więc z Polski potrzebujesz opiekuna. Ostuni zimą działa. Szpital i szkoły są w mieście. To nie apartament przy plaży. To miejsce do wracania.",
    it: "Bianco, giardino, silenzio. Il mare è a otto chilometri — lo dico subito. Casa indipendente, senza condominio: dalla Polonia serve un custode. Ostuni d’inverno funziona. Ospedale e scuole in città. Non è l’appartamento sulla spiaggia. È un posto a cui tornare.",
  },
  levanto: {
    pl: "Liguria, morze i pociąg do Cinque Terre. I trzecie piętro bez windy, prace osiemnaście do dwudziestu ośmiu tysięcy euro, oraz jedna uwaga w dossier: rozbieżność okna na poddaszu. Nie blokuje oferty, musi być zamknięta przed aktem. Nie liczę najmu, dopóki roboty nie skończą się.",
    it: "Liguria, mare e treno per le Cinque Terre. Terzo piano senza ascensore, lavori da diciotto a ventottomila euro, e un punto aperto nel dossier: difformità di un abbaino. Non blocca la proposta, va chiusa prima del rogito. Non conto un affitto finché i lavori non sono chiusi.",
  },
  scanno: {
    pl: "Osiemdziesiąt dziewięć tysięcy euro nie jest prezentem. Dom kamienny w Abruzji, remont dwadzieścia dwa do trzydziestu ośmiu tysięcy, zimą śnieg na ostatnim kilometrze, szpital trzydzieści pięć minut. Pokazuję ten dom, bo niska cena bez zimy wprowadza w błąd. Jeśli kochasz ciszę i samochód — rozmawiamy. Jeśli chcesz plażę pod oknem — nie.",
    it: "Ottantanovemila euro non è un regalo. Casa in pietra in Abruzzo, lavori da ventidue a trentottomila, d’inverno neve sull’ultimo chilometro, ospedale a trentacinque minuti. Lo mostro perché il prezzo nudo, senza l’inverno, inganna. Se ami silenzio e automobile — parliamo. Se vuoi la spiaggia sotto la finestra — no.",
  },
  catania: {
    pl: "Miasto, winda, osiemnaście minut na lotnisko Fontanarossa. Sto osiemnaście tysięcy. Catania nie zamyka się zimą. Lato jest gorące, przy wschodnim wietrze słychać samoloty. Dobry profil, jeśli chcesz przylatywać często albo wynajmować. Morze jest w mieście, nie pod balkonem.",
    it: "Città, ascensore, diciotto minuti da Fontanarossa. Centodiciottomila. Catania non chiude d’inverno. L’estate è calda, con levante si sentono gli aerei. Buon profilo se vuoi arrivare spesso o locare. Il mare è in città, non sotto il balcone.",
  },
  viareggio: {
    pl: "Toskania, morze, Piza dwadzieścia pięć minut. Dwieście trzydzieści dziewięć tysięcy, umeblowane, winda, garaż. Viareggio jest miastem, nie wioską — zimą promenada cichnie, sklepy zostają. Płacisz więcej, bo kupujesz miasto, które nie umiera. Szpital Versilia, pociąg do Florencji. Łatwe z Polski.",
    it: "Toscana, mare, Pisa in venticinque minuti. Duecentotrentanovemila, arredato, ascensore, garage. Viareggio è città, non borgo: d’inverno il viale tace, i negozi restano. Paghi di più perché compri una città che non muore. Ospedale Versilia, treno per Firenze. Facile dalla Polonia.",
  },
};

export const WEEKENDS: Record<string, WeekendPlan> = {
  scalea: {
    from: "Warszawa",
    outbound: "Piątek 16:40 WAW → SUF 21:10",
    inbound: "Niedziela 18:25 SUF → WAW 23:50",
    days: [
      { t: "Piątek 21:40", pl: "Chiara odbiera na Lamezia. Noc w Scalei.", it: "Chiara ti prende a Lamezia. Notte a Scalea." },
      { t: "Sobota 09:30", pl: "Video i klucz: taras, piwnica, ulica.", it: "Visita con chiave: terrazzo, cantina, strada." },
      { t: "Sobota 12:30", pl: "Tropea — drugi dom, lunch, klif.", it: "Tropea — seconda casa, pranzo, costone." },
      { t: "Niedziela 10:00", pl: "Notariusz albo geometra, potem lotnisko.", it: "Notaio o geometra, poi aeroporto." },
    ],
    flightMin: 180,
    flightMax: 260,
    stayNotePl: "Dwa noclegi, auto z lotniska, agent przez cały czas.",
    stayNoteIt: "Due notti, auto dall’aeroporto, agente sempre con te.",
  },
  tropea: {
    from: "Warszawa",
    outbound: "Piątek 16:40 WAW → SUF 21:10",
    inbound: "Niedziela 18:25 SUF → WAW 23:50",
    days: [
      { t: "Piątek 22:00", pl: "Transfer do Tropei. Noc w centrum.", it: "Transfer a Tropea. Notte in centro." },
      { t: "Sobota 09:00", pl: "Dom, zaułek, parking za murami.", it: "Casa, vicolo, parcheggio extra moenia." },
      { t: "Sobota 15:00", pl: "Scalea jako plan B, ten sam region.", it: "Scalea come piano B, stessa regione." },
      { t: "Niedziela 11:00", pl: "Dokumenty u notariusza Greco.", it: "Documenti dal notaio Greco." },
    ],
    flightMin: 180,
    flightMax: 270,
    stayNotePl: "Auto zostaje za murami. Pieszo 7 minut do drzwi.",
    stayNoteIt: "L’auto resta fuori le mura. A piedi 7 minuti dalla porta.",
  },
  sirmione: {
    from: "Kraków",
    outbound: "Piątek 14:20 KRK → VRN 16:05",
    inbound: "Niedziela 19:10 VRN → KRK 20:50",
    days: [
      { t: "Piątek 16:40", pl: "Odbieram na Villafranca. Wieczór nad jeziorem.", it: "Ti prendo a Villafranca. Sera sul lago." },
      { t: "Sobota 10:00", pl: "Apartament, garaż, wspólnota, spacer.", it: "Appartamento, garage, condominio, passeggiata." },
      { t: "Sobota 16:00", pl: "Desenzano — szpital i pociąg do Mediolanu.", it: "Desenzano — ospedale e treno per Milano." },
      { t: "Niedziela 11:00", pl: "Administrator wspólnoty, potem lotnisko.", it: "Amministratore, poi aeroporto." },
    ],
    flightMin: 90,
    flightMax: 160,
    stayNotePl: "Jeden lot, bez przesiadki. Najkrótszy weekend w selekcji.",
    stayNoteIt: "Un volo, senza scalo. Il weekend più corto della selezione.",
  },
  ostuni: {
    from: "Warszawa",
    outbound: "Piątek 13:15 WAW → BRI 15:40",
    inbound: "Niedziela 17:55 BRI → WAW 20:20",
    days: [
      { t: "Piątek 17:00", pl: "Auto z Bari. Wieczór w białym mieście.", it: "Auto da Bari. Sera nella città bianca." },
      { t: "Sobota 09:30", pl: "Dom, ogród, studnia, ostatnie 80 m żwiru.", it: "Casa, giardino, pozzo, ultimi 80 m di ghiaia." },
      { t: "Sobota 15:00", pl: "Plaża 15 minut — żebyś wiedział, ile to jest.", it: "Spiaggia 15 minuti — così misuri la distanza." },
      { t: "Niedziela 10:00", pl: "Geometra i akt. Powrót przez Bari.", it: "Geometra e atto. Rientro da Bari." },
    ],
    flightMin: 140,
    flightMax: 220,
    stayNotePl: "Jeden lot do Bari. Dom bez wspólnoty — oglądamy studnię.",
    stayNoteIt: "Un volo per Bari. Casa senza condominio — vediamo il pozzo.",
  },
  levanto: {
    from: "Warszawa",
    outbound: "Piątek 15:05 WAW → PSA 17:20",
    inbound: "Niedziela 18:40 PSA → WAW 21:00",
    days: [
      { t: "Piątek 19:00", pl: "Pociąg z Pizy. Noc w Levanto.", it: "Treno da Pisa. Notte a Levanto." },
      { t: "Sobota 09:00", pl: "Trzecie piętro, wilgoć, zakres prac.", it: "Terzo piano, umidità, perimetro lavori." },
      { t: "Sobota 14:00", pl: "Geometra: abbaino i sanatoria.", it: "Geometra: abbaino e sanatoria." },
      { t: "Niedziela 10:00", pl: "Cinque Terre pociągiem — i decyzja.", it: "Cinque Terre in treno — e la decisione." },
    ],
    flightMin: 100,
    flightMax: 180,
    stayNotePl: "Bez auta. Parking w sierpniu i tak odpada.",
    stayNoteIt: "Senza auto. Ad agosto il parcheggio è comunque impossibile.",
  },
  scanno: {
    from: "Warszawa",
    outbound: "Piątek 12:30 WAW → FCO 15:00 + auto",
    inbound: "Niedziela 19:40 FCO → WAW 22:10",
    days: [
      { t: "Piątek 18:30", pl: "Dojazd z Rzymu, ok. 2 h. Wieczór w dolinie.", it: "Da Roma, circa 2 h. Sera in valle." },
      { t: "Sobota 09:00", pl: "Dom, dach, ogrzewanie, ostatni kilometr.", it: "Casa, tetto, riscaldamento, ultimo chilometro." },
      { t: "Sobota 15:00", pl: "Sulmona — szpital 35 minut, zimą sprawdzić śnieg.", it: "Sulmona — ospedale 35 min, d’inverno la neve." },
      { t: "Niedziela 09:30", pl: "Koszt robót z geometrą. Powrót do Fiumicino.", it: "Costo lavori col geometra. Rientro a Fiumicino." },
    ],
    flightMin: 160,
    flightMax: 240,
    stayNotePl: "Auto obowiązkowe. Zimą pytamy o przejezdność przed wylotem.",
    stayNoteIt: "Auto obbligatoria. D’inverno chiediamo la percorribilità prima del volo.",
  },
  catania: {
    from: "Warszawa",
    outbound: "Piątek 18:10 WAW → CTA 21:05",
    inbound: "Niedziela 21:30 CTA → WAW 00:25",
    days: [
      { t: "Piątek 21:30", pl: "Osiemnaście minut z lotniska. Noc w mieszkaniu.", it: "Diciotto minuti dall’aeroporto. Notte in casa." },
      { t: "Sobota 10:00", pl: "Taras, Etna, garaż, winda, wspólnota.", it: "Terrazzo, Etna, garage, ascensore, condominio." },
      { t: "Sobota 16:00", pl: "Dzielnica, hałas lotniczy przy levante.", it: "Quartiere, rumore aereo con levante." },
      { t: "Niedziela 11:00", pl: "Administrator i notariusz Arena.", it: "Amministratore e notaio Arena." },
    ],
    flightMin: 80,
    flightMax: 160,
    stayNotePl: "Często lot bezpośredni. Najłatwiejszy przylot w selekcji.",
    stayNoteIt: "Spesso volo diretto. L’arrivo più facile della selezione.",
  },
  viareggio: {
    from: "Warszawa",
    outbound: "Piątek 14:50 WAW → PSA 17:05",
    inbound: "Niedziela 18:40 PSA → WAW 21:00",
    days: [
      { t: "Piątek 17:40", pl: "25 minut z Pizy. Wieczór na promenadzie.", it: "25 minuti da Pisa. Sera in passeggiata." },
      { t: "Sobota 10:00", pl: "Mieszkanie umeblowane, winda, garaż.", it: "Casa arredata, ascensore, garage." },
      { t: "Sobota 15:00", pl: "Szpital Versilia i pociąg do Florencji.", it: "Ospedale Versilia e treno per Firenze." },
      { t: "Niedziela 11:00", pl: "Administrator Versilia, potem Piza.", it: "Amministratore Versilia, poi Pisa." },
    ],
    flightMin: 90,
    flightMax: 170,
    stayNotePl: "Miasto, nie wioska. Weekend bez zaskoczeń logistycznych.",
    stayNoteIt: "Città, non borgo. Weekend senza sorprese logistiche.",
  },
};

export const ASK_PROMPTS = [
  { pl: "Czy moja mama może tu mieszkać zimą?", it: "Mia madre può viverci d’inverno?" },
  { pl: "Ile naprawdę kosztuje utrzymanie z Warszawy?", it: "Quanto costa tenerla da Varsavia?" },
  { pl: "Co jest niezielone w dossier?", it: "Cosa non è verde nel dossier?" },
  { pl: "Jak wygląda weekend oględzin?", it: "Com’è un weekend di visite?" },
];

export function seasonOf(id: string): SeasonStory | undefined {
  return SEASONS[id];
}

export function lifeOf(id: string): LifeCostInput | undefined {
  return LIFE_COST[id];
}

export function storyOf(id: string) {
  return STORIES[id];
}

export function weekendOf(id: string) {
  return WEEKENDS[id];
}

export function propertyBrief(p: Property) {
  return {
    id: p.id,
    city: p.city,
    region: p.region,
    priceEur: p.priceEur,
    sqm: p.sqm,
    rooms: p.rooms,
    condition: p.condition,
    seaKm: p.seaKm,
    airport: p.airport,
    yearRoundServices: p.yearRoundServices,
    warningsPl: p.warningsPl,
    offSeasonPl: p.offSeasonPl,
    accessNotesPl: p.accessNotesPl,
    travelFrom: p.travelFrom,
    checks: p.checks.map((c) => ({
      key: c.key,
      label: c.labelPl,
      status: c.status,
      note: c.notePl,
      solution: c.solutionPl,
    })),
  };
}
