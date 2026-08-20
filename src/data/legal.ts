export const CONDITIONS = [
  {
    id: "urban",
    pl: "Skuteczność oferty zależy od pozytywnej weryfikacji urbanistycznej i katastralnej.",
    it: "L’efficacia è subordinata all’esito positivo delle verifiche urbanistiche e catastali.",
  },
  {
    id: "liens",
    pl: "Skuteczność oferty zależy od czystości hipotek i obciążeń.",
    it: "L’efficacia è subordinata alla pulizia ipotecaria e da gravami.",
  },
  {
    id: "mortgage",
    pl: "Oferta jest uzależniona od uzyskania kredytu w kwocie i terminie wskazanych niżej.",
    it: "La proposta è subordinata all’ottenimento del mutuo indicato.",
  },
  {
    id: "docs",
    pl: "Sprzedający dostarczy w 10 dni dokumenty wskazane w dossier.",
    it: "Il venditore consegna entro dieci giorni i documenti del dossier.",
  },
  {
    id: "furniture",
    pl: "Cena obejmuje umeblowanie zgodne z inwentarzem fotograficznym.",
    it: "Il prezzo comprende l’arredo dell’inventario fotografico.",
  },
  {
    id: "free",
    pl: "Nieruchomość wolna od osób trzecich i umów najmu w dniu aktu.",
    it: "Immobile libero da terzi e da locazioni alla data del rogito.",
  },
] as const;

export const DEPOSIT_KINDS = [
  {
    id: "caparra" as const,
    pl: "Caparra confirmatoria",
    it: "Caparra confirmatoria",
    hintPl:
      "Zabezpieczenie zobowiązania (art. 1385 c.c.). Jeśli Ty nie dotrzymasz umowy — sprzedający może zatrzymać sumę. Jeśli on — możesz żądać jej podwójnie. Przy akcie schodzi z ceny.",
    hintIt:
      "Garanzia dell’impegno (art. 1385 c.c.). Inadempimento del compratore: il venditore può ritenere la somma. Del venditore: si può chiedere il doppio. Al rogito si imputa al prezzo.",
  },
  {
    id: "acconto" as const,
    pl: "Acconto sul prezzo",
    it: "Acconto sul prezzo",
    hintPl: "Po prostu część ceny zapłacona wcześniej. Nie uruchamia automatycznie mechanizmu caparry.",
    hintIt: "Una parte di prezzo pagata in anticipo. Non attiva automaticamente il meccanismo della caparra.",
  },
  {
    id: "escrow" as const,
    pl: "Depozyt u notariusza",
    it: "Deposito presso notaio",
    hintPl: "Środki czekają na koncie wskazanym przez notariusza, nie u sprzedającego i nie w ITALVIA.",
    hintIt: "Fondi sul conto indicato dal notaio, non del venditore e non di ITALVIA.",
  },
];

export const LEGAL = {
  informalBannerPl:
    "To nie jest umowa. To nieblokująca informacja dla agenta i właściciela. Nic nie płacisz. Nic nie rezerwujesz.",
  informalBannerIt:
    "Non è un contratto. È una manifestazione d’interesse non vincolante. Non paghi. Non prenoti.",
  officialBannerPl:
    "Włoska wersja ma wartość umowną. Polskie tłumaczenie służy zrozumieniu. Po przyjęciu przez sprzedającego i zawiadomieniu Cię, propozycja może stać się preliminare.",
  officialBannerIt:
    "La versione italiana ha valore contrattuale. Il polacco è per la comprensione. Accettata e comunicata, la proposta può divenire preliminare.",
  caparraWarningPl:
    "Caparra confirmatoria to nie „zaliczka na blokadę domu”. To poważne zabezpieczenie z art. 1385 kodeksu cywilnego.",
  caparraQualifyPl:
    "Suma zostanie zakwalifikowana jako caparra confirmatoria wyłącznie według podpisanego dokumentu. Nie zostanie pobrana przed przyjęciem przez sprzedającego.",
  caparraQualifyIt:
    "La somma sarà qualificata come caparra confirmatoria soltanto secondo quanto stabilito nel documento firmato. Non verrà addebitata prima dell’accettazione del venditore.",
  noCartPl: "ITALVIA nie jest kasą. Pieniądze nie wpływają na konto aplikacji.",
  noCartIt: "ITALVIA non è una cassa. Il denaro non transita sul conto dell’app.",
  eidasPl:
    "Podpis kwalifikowany eIDAS ma skutek podpisu własnoręcznego w całej UE. W produkcji łączy się tu partner identyfikacji z wideo i dokumentem. Ta demonstracja zapisuje imię z profilu, oświadczenie i znacznik czasu — nie rysunek palcem.",
  registerPl:
    "Preliminare z elementami umowy należy zarejestrować w Agenzia delle Entrate w ciągu 30 dni (usługa RAP). Od 2025 r. od caparry i accontów niepodlegających VAT — co do zasady 0,5%, albo niższy podatek aktu. Kwotę potwierdza notariusz.",
  seventyTwoPl:
    "Po Twoim podpisie sprzedający ma 72 godziny na przyjęcie. Jeśli odmówi albo milczy, dokument wygasa i żadne pieniądze nie wychodzą.",
  seventyTwoIt:
    "Dopo la firma il venditore ha 72 ore per accettare. Se rifiuta o non risponde, il documento scade e nessun denaro parte.",
  sepaWhyPl:
    "Bonifico SEPA, nie karta: kwoty 10–30 tys. €, Polska–Włochy, dokładna causale, bez chargebacku karty.",
  amlPl:
    "Przeciwdziałanie praniu pieniędzy wymaga identyfikacji, celu stosunku, pochodzenia środków i zachowania dokumentów. ITALVIA zbiera oświadczenie; weryfikację prowadzi agent i, przy akcie, notariusz.",
  amlIt:
    "L’antiriciclaggio richiede identificazione, scopo del rapporto, provenienza dei fondi e conservazione. ITALVIA raccoglie la dichiarazione; verificano agente e, al rogito, notaio.",
  secondoPl: "Drugi acconto istnieje tylko jeśli zapisze go preliminare. Nie jest automatyczny.",
  saldoPl: "Saldo przy rogito idzie według instrukcji notariusza. Nie przechodzi przez konto ITALVIA.",
  threePlanesPl: "Trzy rzeczy osobno: cena, dokument, pieniądze. Nigdy koszyk sklepu.",
  threePlanesIt: "Tre piani distinti: prezzo, documento, denaro. Mai un carrello.",
  identityPl:
    "Przed podpisem: dokument tożsamości i krótkie wideo. W produkcji partner eIDAS z weryfikacją na żywo. Tu: demonstracja z agentem i znacznikiem czasu — nie podpis palcem na ekranie.",
  bindingWarnPl:
    "Uwaga: ta propozycja może stać się wiążąca, jeśli sprzedający ją przyjmie. Przeczytaj tłumaczenie polskie i potwierdź, że rozumiesz warunki.",
  frozenPl:
    "Pieniądze nie wychodzą, dopóki sprzedający nie przyjmie. Jeśli milczy 72 godziny — dokument wygasa sam.",
  rapLeadPl: "Gdy przyjęcie tworzy preliminare, agencja ma 30 dni na rejestrację. ITALVIA pilnuje terminu, nie zastępuje notariusza.",
};
