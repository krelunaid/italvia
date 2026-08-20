import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from "react";

export type Lang = "pl" | "it";

const STORAGE = "italvia-lang";
const EVENT = "italvia-lang";

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof copy) => string;
  tx: (pl: string, it: string) => string;
  loc: <T>(pl: T, it: T) => T;
  locale: string;
};

type LangGlobal = {
  __italviaLang?: Lang;
  __italviaLangCtx?: Context<LangContextValue>;
};

const g = globalThis as typeof globalThis & LangGlobal;

export function loc<T>(lang: Lang, pl: T, it: T): T {
  return lang === "it" ? it : pl;
}

export function localeOf(lang: Lang) {
  return lang === "it" ? "it-IT" : "pl-PL";
}

function isLang(v: unknown): v is Lang {
  return v === "it" || v === "pl";
}

export function readLang(): Lang {
  if (isLang(g.__italviaLang)) return g.__italviaLang;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE);
      if (isLang(stored)) {
        g.__italviaLang = stored;
        return stored;
      }
    } catch {
      /* iframe / private mode */
    }
  }
  return "pl";
}

export function writeLang(next: Lang) {
  g.__italviaLang = next;
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE, next);
    } catch {
      /* iframe / private mode */
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }
}

export const copy = {
  brand: { pl: "ITALVIA", it: "ITALVIA" },
  tagline: { pl: "Twój bezpieczny dom we Włoszech", it: "La tua casa sicura in Italia" },
  findHome: { pl: "Znajdź swój dom we Włoszech", it: "Trova la tua casa in Italia" },
  navDiscover: { pl: "Odkrywaj", it: "Scopri" },
  navSaved: { pl: "Zapisane", it: "Salvati" },
  navJourney: { pl: "Proces", it: "Percorso" },
  navMessages: { pl: "Wiadomości", it: "Messaggi" },
  navProfile: { pl: "Profil", it: "Profilo" },
  signIn: { pl: "Zaloguj się", it: "Accedi" },
  signOut: { pl: "Wyloguj", it: "Esci" },
  continueGoogle: { pl: "Kontynuuj z Google", it: "Continua con Google" },
  continueX: { pl: "Kontynuuj z X", it: "Continua con X" },
  seeHome: { pl: "Zobacz nieruchomość", it: "Vedi immobile" },
  match: { pl: "Dopasowanie", it: "Match" },
  docs: { pl: "Dokumenty", it: "Documenti" },
  remote: { pl: "Zarządzanie z daleka", it: "Da lontano" },
  totalCost: { pl: "Szacowany koszt całkowity", it: "Costo complessivo stimato" },
  requestOffer: { pl: "Poproś o przygotowanie propozycji", it: "Richiedi di preparare la proposta" },
  save: { pl: "Zapisz", it: "Salva" },
  saved: { pl: "Zapisane", it: "Salvato" },
  compare: { pl: "Porównaj", it: "Confronta" },
  videoVisit: { pl: "Umów video-wizytę", it: "Prenota video-visita" },
  writeAgent: { pl: "Napisz do agenta", it: "Scrivi all’agente" },
  selectedForYou: { pl: "Wybrane dla Ciebie", it: "Scelte per te" },
  sea: { pl: "Nad morzem", it: "Vicino al mare" },
  ready: { pl: "Gotowe do zamieszkania", it: "Pronti da abitare" },
  under150: { pl: "Do 150 000 €", it: "Entro 150.000 €" },
  investment: { pl: "Dobra inwestycja", it: "Buon investimento" },
  airport: { pl: "Blisko lotniska", it: "Vicino all’aeroporto" },
  agentPick: { pl: "Wybrane przez agenta", it: "Scelte dall’agente" },
  yourProject: { pl: "Twój projekt włoski", it: "Il tuo progetto italiano" },
  loading: { pl: "Ładuję…", it: "Carico…" },
  all: { pl: "Wszystkie", it: "Tutte" },
  back: { pl: "Wróć", it: "Indietro" },
  next: { pl: "Dalej", it: "Avanti" },
  cancel: { pl: "Anuluj", it: "Annulla" },
  send: { pl: "Wyślij", it: "Invia" },
  filter: { pl: "Filtruj selekcję", it: "Filtra la selezione" },
  selection: { pl: "Selekcja", it: "Selezione" },
  language: { pl: "Język", it: "Lingua" },
  disclaimer: {
    pl: "Szacunek informacyjny. Kwota ostateczna potwierdzają profesjonaliści. To nie jest obietnica podatkowa.",
    it: "Stima informativa. L’importo definitivo lo confermano i professionisti. Non è una promessa fiscale.",
  },
  notaryFree: {
    pl: "Notariusza wybierasz Ty. Aplikacja nie zastępuje weryfikacji zawodowych.",
    it: "La scelta del notaio spetta a te. L’app non sostituisce le verifiche professionali.",
  },
} as const;

export type CopyKey = keyof typeof copy;

const fallback: LangContextValue = {
  lang: "pl",
  setLang: writeLang,
  t: (k) => copy[k].pl,
  tx: (pl) => pl,
  loc: (pl) => pl,
  locale: "pl-PL",
};

const LangContext = g.__italviaLangCtx ?? createContext<LangContextValue>(fallback);
g.__italviaLangCtx = LangContext;

function makeValue(lang: Lang, setLang: (l: Lang) => void): LangContextValue {
  return {
    lang,
    setLang,
    t: (key) => copy[key][lang],
    tx: (pl, it) => (lang === "it" ? it : pl),
    loc: (pl, it) => (lang === "it" ? it : pl),
    locale: localeOf(lang),
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readLang());

  const setLang = useCallback((next: Lang) => {
    if (next !== "pl" && next !== "it") return;
    writeLang(next);
    setLangState(next);
  }, []);

  useEffect(() => {
    const stored = readLang();
    setLangState(stored);
    if (typeof document !== "undefined") document.documentElement.lang = stored;

    function onExternal(e: Event) {
      const next = (e as CustomEvent<Lang>).detail;
      if (isLang(next)) setLangState(next);
    }
    window.addEventListener(EVENT, onExternal);
    return () => window.removeEventListener(EVENT, onExternal);
  }, []);

  const value = useMemo(() => makeValue(lang, setLang), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
