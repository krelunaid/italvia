import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSignature, Landmark, Lock, Scale, type LucideIcon } from "lucide-react";
import { listMyOffers, requestOfficial, type Offer } from "@/lib/server/offers";
import { LEGAL } from "@/data/legal";
import { hoursLeft, isOpenStatus, pickLiveOffer, planeOf } from "@/lib/offer-stage";
import { formatEur } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useLang } from "@/lib/i18n";

export function TrattativaPanel({
  propertyId,
  askingEur,
  signedIn,
}: {
  propertyId: string;
  askingEur: number;
  signedIn: boolean;
}) {
  const qc = useQueryClient();
  const { lang, tx, locale } = useLang();
  const q = useQuery({ queryKey: ["offers"], queryFn: () => listMyOffers(), enabled: signedIn });
  const offer = pickLiveOffer(q.data ?? [], propertyId);
  const plane = planeOf(offer);
  const [busy, setBusy] = useState(false);

  async function askOfficial() {
    if (!offer) return;
    setBusy(true);
    try {
      await requestOfficial({ data: offer.id });
      toast(tx("Chiara przygotuje dokument dwujęzyczny.", "Chiara prepara il documento bilingue."));
      await qc.invalidateQueries({ queryKey: ["offers"] });
    } catch (e) {
      toast(e instanceof Error ? e.message : tx("Nie udało się.", "Non è riuscito."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="trattativa" className="rounded-xl border border-line bg-paper p-5">
      <p className="text-xs tracking-[0.18em] text-faint uppercase">Trattativa</p>
      <h2 className="mt-1 font-display text-2xl text-navy">
        {tx("Mały notariusz, nie koszyk", "Piccolo notaio, non un carrello")}
      </h2>
      <p className="mt-1 text-sm text-muted">{lang === "it" ? LEGAL.threePlanesIt : LEGAL.threePlanesPl}</p>
      <p className="mt-1 text-xs text-faint">
        {tx("Cena ogłoszenia", "Prezzo dell’annuncio")} {formatEur(askingEur, false, locale)}
      </p>

      <ol className="mt-5 space-y-3">
        <Plane
          n={1}
          icon={Scale}
          title={tx("Złóż ofertę", "Proponi un prezzo")}
          other={tx("Proponi un prezzo", "Złóż ofertę")}
          hint={tx("Nie wiąże. Bez płatności. Agent mówi z właścicielem.", "Non vincola. Senza pagamento. L’agente parla col proprietario.")}
          active={plane === 1 && Boolean(offer && isOpenStatus(offer.status))}
          locked={false}
        >
          {!offer || !isOpenStatus(offer.status) ? (
            signedIn ? (
              <Button asChild className="w-full" size="sm">
                <Link to="/homes/$id/offer" params={{ id: propertyId }}>
                  {tx("Złóż ofertę", "Fai un’offerta")}
                </Link>
              </Button>
            ) : (
              <Button asChild className="w-full" size="sm">
                <Link to="/login">{tx("Złóż ofertę", "Fai un’offerta")}</Link>
              </Button>
            )
          ) : offer.kind === "informal" ? (
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/offers/$id" params={{ id: offer.id }}>
                {tx("Zobacz ofertę", "Vedi l’offerta")} {formatEur(offer.offerEur, false, locale)}
              </Link>
            </Button>
          ) : (
            <p className="text-xs text-sage">{tx("Cena uzgodniona. Dalej dokument.", "Prezzo concordato. Poi il documento.")}</p>
          )}
        </Plane>

        <Plane
          n={2}
          icon={FileSignature}
          title={tx("Propozycja z wartością umowną", "Prepara proposta ufficiale")}
          other={tx("Prepara proposta ufficiale", "Propozycja z wartością umowną")}
          hint={tx(
            "Dokument dwujęzyczny, weryfikacja agenta, podpis kwalifikowany eIDAS.",
            "Documento bilingue, verifica dell’agente, firma qualificata eIDAS.",
          )}
          active={plane === 2}
          locked={plane < 2}
        >
          {plane < 2 ? (
            <p className="text-xs text-faint">{tx("Najpierw uzgodnij cenę. Potem agent przygotuje akt.", "Prima il prezzo. Poi l’agente prepara l’atto.")}</p>
          ) : offer?.status === "ready" ? (
            <Button asChild className="w-full" size="sm">
              <Link to="/offers/$id" params={{ id: offer.id }}>
                {tx("Podpisz dokument", "Firma il documento")}
              </Link>
            </Button>
          ) : offer?.status === "signed" ? (
            <p className="text-xs text-navy">
              {tx("Czeka na sprzedającego", "In attesa del venditore")}
              {offer.acceptDeadline ? ` · ${hoursLeft(offer.acceptDeadline)} h` : ""}. {tx("Pieniądze jeszcze stoją.", "Il denaro è ancora fermo.")}
            </p>
          ) : offer?.officialRequested && offer.kind === "informal" ? (
            <p className="text-xs text-navy">{tx("Chiara przygotowuje dokument. Dostaniesz go do podpisu.", "Chiara prepara il documento. Lo ricevi da firmare.")}</p>
          ) : offer && offer.kind === "informal" ? (
            <Button className="w-full" size="sm" variant="navy" disabled={busy} onClick={() => void askOfficial()}>
              {tx("Poproś o propozycję oficjalną", "Chiedi la proposta ufficiale")}
            </Button>
          ) : offer ? (
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/offers/$id" params={{ id: offer.id }}>
                {tx("Otwórz dokument", "Apri il documento")}
              </Link>
            </Button>
          ) : null}
        </Plane>

        <Plane
          n={3}
          icon={Landmark}
          title={tx("Wpłać caparrę", "Versa la caparra")}
          other={tx("Versa la caparra", "Wpłać caparrę")}
          hint={tx(
            "Tylko po przyjęciu. Bonifico SEPA na konto notariusza — nie do ITALVIA.",
            "Solo dopo l’accettazione. Bonifico SEPA sul conto del notaio — non su ITALVIA.",
          )}
          active={plane === 3}
          locked={plane < 3}
        >
          {plane < 3 ? (
            <p className="text-xs text-faint">{tx("Zablokowane, dopóki sprzedający nie przyjmie podpisanego dokumentu.", "Bloccato finché il venditore non accetta il documento firmato.")}</p>
          ) : offer?.status === "under_contract" ? (
            <Button asChild className="w-full" size="sm" variant="sage">
              <Link to="/offers/$id" params={{ id: offer.id }}>
                {tx("Sotto contratto — acconto i saldo", "Sotto contratto — acconto e saldo")}
              </Link>
            </Button>
          ) : offer ? (
            <Button asChild className="w-full" size="sm">
              <Link to="/offers/$id" params={{ id: offer.id }}>
                {offer.status === "receipt_uploaded"
                  ? tx("Bonifico zgłoszony", "Bonifico segnalato")
                  : tx("Wpłać caparrę", "Versa la caparra")}
              </Link>
            </Button>
          ) : null}
        </Plane>
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-faint">{lang === "it" ? LEGAL.noCartIt : LEGAL.noCartPl}</p>
    </section>
  );
}

function Plane({
  n,
  icon: Icon,
  title,
  other,
  hint,
  active,
  locked,
  children,
}: {
  n: number;
  icon: LucideIcon;
  title: string;
  other: string;
  hint: string;
  active: boolean;
  locked: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "rounded-lg border px-4 py-4",
        active ? "border-navy bg-ivory" : "border-line bg-paper",
        locked && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full text-xs",
            active ? "bg-navy text-paper" : "bg-ivory-deep text-muted",
          )}
        >
          {locked ? <Lock className="size-3.5" /> : n}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-medium text-navy">
            <Icon className="size-4 text-terracotta" />
            {title}
          </p>
          <p className="font-display italic text-faint">{other}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </li>
  );
}

export function liveOfferOf(offers: Offer[] | undefined, propertyId: string) {
  return pickLiveOffer(offers ?? [], propertyId);
}
