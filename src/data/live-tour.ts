import { PROPERTIES, getProperty, type Property } from "@/data/properties";

export type TourSpot = {
  id: string;
  labelPl: string;
  labelIt: string;
  image: string;
  inSale: boolean;
  notePl: string;
  noteIt: string;
};

const LIVING = "/homes/interior-living.jpg";
const KITCHEN = "/homes/interior-kitchen.jpg";
const BEDROOM = "/homes/interior-bedroom.jpg";

const SCALEA: TourSpot[] = [
  {
    id: "terrace",
    labelPl: "Taras",
    labelIt: "Terrazzo",
    image: "/homes/scalea.jpg",
    inSale: true,
    notePl: "Taras 18 m² należy do mieszkania. Południe, bez zadaszenia. Wchodzi w akt.",
    noteIt: "Terrazzo di 18 m² dell’appartamento. Sud, scoperto. Entra nell’atto.",
  },
  {
    id: "living",
    labelPl: "Salon",
    labelIt: "Soggiorno",
    image: LIVING,
    inSale: true,
    notePl: "Salon z wyjściem na taras. Meble częściowe zostają — w ofercie.",
    noteIt: "Soggiorno con uscita sul terrazzo. Arredo parziale incluso nell’offerta.",
  },
  {
    id: "kitchen",
    labelPl: "Kuchnia",
    labelIt: "Cucina",
    image: KITCHEN,
    inSale: true,
    notePl: "Kuchnia w zabudowie zostaje. Sprzęt AGD — do spisu przy preliminarnym.",
    noteIt: "Cucina in opera resta. Elettrodomestici: elenco al preliminare.",
  },
  {
    id: "bedroom",
    labelPl: "Sypialnia",
    labelIt: "Camera",
    image: BEDROOM,
    inSale: true,
    notePl: "Jedna sypialnia. Druga wnęka jest gabinetem, nie osobnym pokojem w katastrze.",
    noteIt: "Una camera. Il secondo vano è studio, non stanza autonoma in catasto.",
  },
  {
    id: "parking",
    labelPl: "Miejsce wspólnoty",
    labelIt: "Posto condominiale",
    image: "/homes/scalea.jpg",
    inSale: true,
    notePl: "Jedno miejsce na tyłach budynku. Wchodzi w cenę, nie jest boxem zamkniętym.",
    noteIt: "Un posto sul retro. Incluso nel prezzo, non è un box chiuso.",
  },
  {
    id: "neighbor",
    labelPl: "Taras sąsiada",
    labelIt: "Terrazzo del vicino",
    image: "/homes/scalea.jpg",
    inSale: false,
    notePl: "Taras po prawej należy do sąsiada. Nie wchodzi w sprzedaż. Nie obiecuję widoku, którego nie sprzedaję.",
    noteIt: "Il terrazzo a destra è del vicino. Non è in vendita. Non vendo una vista che non è mia.",
  },
  {
    id: "roof",
    labelPl: "Dach wspólnoty",
    labelIt: "Tetto condominiale",
    image: "/homes/scalea-winter.jpg",
    inSale: false,
    notePl: "Dach, kominy i anteny są wspólne. Brak prywatnego użytku dachu w akcie.",
    noteIt: "Tetto, comignoli e antenne sono comuni. Nessun uso esclusivo del tetto in atto.",
  },
  {
    id: "street",
    labelPl: "Ulica pod balkonem",
    labelIt: "Strada sotto il balcone",
    image: "/homes/scalea-winter.jpg",
    inSale: false,
    notePl: "Ulica publiczna, styczeń, 11:00. To nie pocztówka z sierpnia. Plaża 500 m — nie należy do mieszkania.",
    noteIt: "Strada pubblica, gennaio, ore 11. Non è la cartolina d’agosto. Spiaggia a 500 m — non è dell’appartamento.",
  },
];

function genericTour(p: Property): TourSpot[] {
  return [
    {
      id: "facade",
      labelPl: "Wejście i elewacja",
      labelIt: "Ingresso e facciata",
      image: p.images[0] ?? LIVING,
      inSale: true,
      notePl: `To jest nieruchomość w sprzedaży: ${p.sqm} m², ${p.rooms} pokoje. Reszta budynku nie.`,
      noteIt: `Questo è l’immobile in vendita: ${p.sqm} m², ${p.rooms} vani. Il resto dello stabile no.`,
    },
    {
      id: "living",
      labelPl: "Wnętrze",
      labelIt: "Interno",
      image: p.images[1] ?? LIVING,
      inSale: true,
      notePl: "Pomieszczenia mieszkalne wchodzą w akt. Meble — tylko jeśli zapisane w ofercie.",
      noteIt: "I vani abitativi entrano nell’atto. I mobili solo se scritti nell’offerta.",
    },
    {
      id: "kitchen",
      labelPl: "Kuchnia",
      labelIt: "Cucina",
      image: p.images[2] ?? KITCHEN,
      inSale: true,
      notePl: "Kuchnia należy do mieszkania. Stan AGD potwierdzam na video, nie z ogłoszenia.",
      noteIt: "La cucina è dell’appartamento. Lo stato degli elettrodomestici lo confermo in video, non dall’annuncio.",
    },
    {
      id: "bedroom",
      labelPl: "Sypialnia",
      labelIt: "Camera",
      image: p.images[3] ?? BEDROOM,
      inSale: true,
      notePl: "Sypialnia w sprzedaży. Nisze i strych wspólnoty — nie.",
      noteIt: "La camera è in vendita. Nicchie e sottotetto condominiale no.",
    },
    {
      id: "excluded",
      labelPl: "Czego nie sprzedaję",
      labelIt: "Cosa non vendo",
      image: p.images[0] ?? LIVING,
      inSale: false,
      notePl: "Sąsiednie lokale, dach wspólnoty, ulica i widok, którego nie mam w akcie — zostają poza transakcją.",
      noteIt: "Alloggi vicini, tetto condominiale, strada e vista non scritta in atto restano fuori dalla vendita.",
    },
  ];
}

const CUSTOM: Record<string, TourSpot[]> = { scalea: SCALEA };

export function tourOf(propertyId: string): TourSpot[] {
  const custom = CUSTOM[propertyId];
  if (custom) return custom;
  const p = getProperty(propertyId);
  return p ? genericTour(p) : SCALEA;
}

export function spotOf(propertyId: string, spotId: string): TourSpot {
  const tour = tourOf(propertyId);
  return tour.find((s) => s.id === spotId) ?? tour[0]!;
}

export const LIVE_PEOPLE = [
  { key: "lead-marek", name: "Marek Kowalski", city: "Warszawa", watching: true },
  { key: "lead-anna", name: "Anna Nowak", city: "Kraków", watching: true },
  { key: "lead-piotr", name: "Piotr Wiśniewski", city: "Wrocław", watching: false },
  { key: "lead-magda", name: "Magda Lewandowska", city: "Gdańsk", watching: false },
] as const;

export function propertyOptions() {
  return PROPERTIES.map((p) => ({
    id: p.id,
    city: p.city,
    titleIt: p.titleIt,
    titlePl: p.titlePl,
    image: p.images[0],
    priceEur: p.priceEur,
  }));
}
