import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { agentRespond, getDeskOffer } from "@/lib/server/offers";
import { getProperty } from "@/data/properties";
import { STATUS_IT, KIND_IT } from "@/lib/offer-labels";
import { LEGAL } from "@/data/legal";
import { formatEur } from "@/lib/money";
import { hoursLeft, remainingBalance } from "@/lib/offer-stage";
import { ProposalDoc } from "@/components/proposal-doc";
import { OfferRecap, draftFromOffer } from "@/components/offer-recap";
import { PlaneTrack } from "@/components/plane-track";
import { Countdown72 } from "@/components/countdown-72";
import { RapPratica } from "@/components/rap-pratica";
import { MoneyLedger } from "@/components/money-ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/desk/offers/$id")({ component: DeskOffer });

function DeskOffer() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["desk-offer", id], queryFn: () => getDeskOffer({ data: id }) });
  const [counter, setCounter] = useState("");
  const [acconto, setAcconto] = useState("");
  const [depositAsk, setDepositAsk] = useState("");
  const [deedAsk, setDeedAsk] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const offer = q.data;
  const property = offer ? getProperty(offer.propertyId) : null;

  async function act(
    action:
      | "counter"
      | "decline"
      | "prepare"
      | "accept_seller"
      | "verify_payment"
      | "refuse"
      | "instruct_acconto"
      | "confirm_acconto"
      | "confirm_balance"
      | "ask_deposit"
      | "ask_deed",
  ) {
    setBusy(true);
    try {
      await agentRespond({
        data: {
          id,
          action,
          counterEur:
            action === "counter" || action === "instruct_acconto" || action === "ask_deposit"
              ? Number(action === "ask_deposit" ? depositAsk : action === "instruct_acconto" ? acconto : counter)
              : undefined,
          deedBy: action === "ask_deed" ? deedAsk : undefined,
          noteIt: note || undefined,
        },
      });
      toast("Aggiornato.");
      await qc.invalidateQueries({ queryKey: ["desk-offer", id] });
      await qc.invalidateQueries({ queryKey: ["desk-offers"] });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Errore");
    } finally {
      setBusy(false);
    }
  }

  if (q.isPending) return <div className="p-8 text-muted">Carico…</div>;
  if (!offer || !property) {
    return (
      <div className="p-8">
        Offerta assente.{" "}
        <Link to="/desk/offers" className="text-terracotta">
          Elenco
        </Link>
      </div>
    );
  }

  const hLeft = hoursLeft(offer.acceptDeadline);

  return (
    <div className="px-5 py-6 pb-16">
      <Link to="/desk/offers" className="text-sm text-muted">
        ← Offerte
      </Link>
      <p className="mt-4 text-xs tracking-[0.16em] text-faint uppercase">
        {KIND_IT[offer.kind]} · {STATUS_IT[offer.status] ?? offer.status}
      </p>
      <h1 className="mt-1 font-display text-3xl text-navy">
        {offer.buyerName ?? "Compratore"} · {property.city}
      </h1>
      <p className="text-sm text-muted">{property.titleIt}</p>
      <PlaneTrack offer={offer} className="mt-4" />
      {offer.officialRequested && offer.kind === "informal" ? (
        <p className="mt-3 rounded-md bg-sage-soft px-3 py-2 text-sm text-navy">
          Il cliente chiede la proposta ufficiale.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat k="Richiesto" v={formatEur(offer.askingEur)} />
        <Stat k="Offerta" v={formatEur(offer.offerEur)} />
        <Stat k="Somma proposta" v={formatEur(offer.depositEur)} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {offer.depositKind} · validità {offer.validUntil} · rogito {offer.deedBy} ·{" "}
        {offer.financing === "mortgage"
          ? `mutuo${offer.mortgageEur ? ` ${formatEur(offer.mortgageEur)}` : ""}`
          : "mezzi propri"}
      </p>
      {offer.notesPl ? <p className="mt-3 text-sm text-navy">Nota del cliente: {offer.notesPl}</p> : null}

      {offer.kind === "official" ? (
        <div className="mt-5">
          <ProposalDoc offer={offer} property={property} buyerName={offer.signedName ?? offer.buyerName ?? "Compratore"} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="rounded-lg bg-ivory-deep px-3 py-2 text-sm">{LEGAL.informalBannerIt}</p>
          <OfferRecap property={property} draft={draftFromOffer(offer)} defaultLang="it" />
        </div>
      )}

      {offer.amlProfession ? (
        <div className="mt-4 rounded-lg border border-line bg-paper p-4 text-sm text-navy">
          <p className="text-xs tracking-[0.14em] text-faint uppercase">AML — dichiarazione</p>
          <p className="mt-2">{offer.amlProfession}</p>
          <p className="text-muted">{offer.amlResidence}</p>
          <p className="text-muted">{offer.amlFundsOrigin}</p>
          <p className="font-mono text-xs">{offer.amlOriginIban}</p>
          {offer.amlCf ? <p className="text-xs text-faint">CF/PESEL {offer.amlCf}</p> : null}
          {offer.signatureHash ? <p className="mt-1 font-mono text-[11px] text-faint">Impronta {offer.signatureHash}</p> : null}
        </div>
      ) : null}

      {offer.paymentRef ? (
        <p className="mt-4 text-sm text-navy">
          Bonifico segnalato: {offer.paymentRef} · {offer.paymentDate}
        </p>
      ) : null}

      {offer.status === "signed" ? (
        <div className="mt-5">
          <Countdown72 deadline={offer.acceptDeadline} />
        </div>
      ) : null}

      {offer.acceptedAt ? (
        <div className="mt-5 space-y-4">
          <MoneyLedger offer={offer} />
          <RapPratica offer={offer} />
        </div>
      ) : null}

      <div className="mt-6 space-y-3 rounded-xl bg-paper p-4">
        <p className="text-sm font-medium text-navy">Risposta all’agente</p>
        <p className="text-xs text-faint">{LEGAL.threePlanesIt}</p>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota per il cliente (IT, verrà mostrata)" />
        {offer.kind === "informal" && ["sent", "countered"].includes(offer.status) ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                placeholder="Controfferta €"
              />
              <Button variant="outline" disabled={busy} onClick={() => void act("counter")}>
                Controfferta
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={depositAsk}
                onChange={(e) => setDepositAsk(e.target.value)}
                placeholder="Caparra maggiore €"
              />
              <Button variant="outline" disabled={busy} onClick={() => void act("ask_deposit")}>
                Chiedi caparra
              </Button>
            </div>
            <div className="flex gap-2">
              <Input type="date" value={deedAsk} onChange={(e) => setDeedAsk(e.target.value)} />
              <Button variant="outline" disabled={busy} onClick={() => void act("ask_deed")}>
                Altra data rogito
              </Button>
            </div>
            <Button className="w-full" disabled={busy} onClick={() => void act("prepare")}>
              Prepara proposta ufficiale
            </Button>
            <Button variant="ghost" className="w-full" disabled={busy} onClick={() => void act("decline")}>
              Rifiuta (informale)
            </Button>
          </div>
        ) : null}

        {offer.status === "ready" ? (
          <p className="text-sm text-muted">In attesa della firma qualificata del compratore. Nessun addebito.</p>
        ) : null}

        {offer.status === "signed" ? (
          <div className="space-y-2">
            <p className="text-sm text-navy">
              {LEGAL.seventyTwoIt}
              {hLeft != null ? ` Restano ${hLeft} ore.` : ""}
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" disabled={busy} onClick={() => void act("accept_seller")}>
                Il venditore accetta
              </Button>
              <Button variant="outline" className="flex-1" disabled={busy} onClick={() => void act("refuse")}>
                Rifiuta
              </Button>
            </div>
          </div>
        ) : null}

        {offer.status === "receipt_uploaded" ? (
          <Button className="w-full" disabled={busy} onClick={() => void act("verify_payment")}>
            Conferma caparra ricevuta (notaio)
          </Button>
        ) : null}

        {offer.status === "under_contract" ? (
          <div className="space-y-3">
            <p className="text-sm text-sage">
              Sotto contratto. Registrazione RAP entro {offer.registerDue}. Imposta di registro da confermare col
              notaio. Saldo al rogito: {formatEur(remainingBalance(offer))}.
            </p>
            {offer.secondAccontoStatus === "none" ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={acconto}
                  onChange={(e) => setAcconto(e.target.value)}
                  placeholder="Secondo acconto €"
                />
                <Button variant="outline" disabled={busy} onClick={() => void act("instruct_acconto")}>
                  Versa secondo acconto
                </Button>
              </div>
            ) : offer.secondAccontoStatus === "receipt" ? (
              <Button className="w-full" disabled={busy} onClick={() => void act("confirm_acconto")}>
                Conferma secondo acconto
              </Button>
            ) : (
              <p className="text-xs text-sage">Secondo acconto: {offer.secondAccontoStatus}</p>
            )}
            {offer.balanceStatus === "receipt" ? (
              <Button className="w-full" disabled={busy} onClick={() => void act("confirm_balance")}>
                Conferma saldo al rogito
              </Button>
            ) : (
              <p className="text-xs text-muted">Saldo: {offer.balanceStatus} — il notaio istruisce, ITALVIA non incassa.</p>
            )}
          </div>
        ) : null}
      </div>
      <p className="mt-6 text-xs text-faint">{LEGAL.noCartIt}</p>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-paper p-3">
      <p className="text-[11px] text-faint">{k}</p>
      <p className="font-display text-2xl tabular-nums text-navy">{v}</p>
    </div>
  );
}
