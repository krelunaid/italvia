export const JOURNEY = [
  { id: "profile", labelPl: "Profil kupującego", labelIt: "Profilo dell’acquirente", actorPl: "Ty", actorIt: "Tu" },
  { id: "shortlist", labelPl: "Wybrane nieruchomości", labelIt: "Immobili selezionati", actorPl: "Ty + agent", actorIt: "Tu + agente" },
  { id: "video", labelPl: "Video-wizyta", labelIt: "Video-visita", actorPl: "Agent", actorIt: "Agente" },
  { id: "trip", labelPl: "Wizyta we Włoszech", labelIt: "Visita in Italia", actorPl: "Ty + agent", actorIt: "Tu + agente" },
  { id: "papers", labelPl: "Dokumenty wstępne", labelIt: "Documenti preliminari", actorPl: "Agent + geometra", actorIt: "Agente + geometra" },
  { id: "offer", labelPl: "Proposta", labelIt: "Proposta", actorPl: "Ty, z agentem", actorIt: "Tu, con l’agente" },
  { id: "due", labelPl: "Weryfikacje techniczne i prawne", labelIt: "Verifiche tecniche e legali", actorPl: "Geometra, adwokat", actorIt: "Geometra, avvocato" },
  { id: "prelim", labelPl: "Preliminare", labelIt: "Preliminare", actorPl: "Notariusz", actorIt: "Notaio" },
  { id: "deed-prep", labelPl: "Przygotowanie rogito", labelIt: "Preparazione del rogito", actorPl: "Notariusz", actorIt: "Notaio" },
  { id: "keys", labelPl: "Podpis i klucze", labelIt: "Firma e consegna chiavi", actorPl: "Ty + notariusz", actorIt: "Tu + notaio" },
  { id: "after", labelPl: "Media i opieka po akcie", labelIt: "Utenze e gestione", actorPl: "Agent", actorIt: "Agente" },
] as const;

export type JourneyId = (typeof JOURNEY)[number]["id"];
