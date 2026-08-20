import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getMyOffer,
  reportSepa,
  withdrawOffer,
  acceptCounter,
  requestOfficial,
  acceptTerms,
} from "@/lib/server/offers";
import { getProperty } from "@/data/properties";
import { DEPOSIT_KINDS, LEGAL } from "@/data/legal";
import { STATUS_PL, KIND_PL } from "@/lib/offer-labels";
import { formatEur } from "@/lib/money";
import { remainingBalance } from "@/lib/offer-stage";
import { useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { ProposalDoc } from "@/components/proposal-doc";
import { SepaSlip, ReceiptForm } from "@/components/sepa-slip";
import { OfferRecap, draftFromOffer } from "@/components/offer-recap";
import { PlaneTrack } from "@/components/plane-track";
import { Countdown72 } from "@/components/countdown-72";
import { RapPratica } from "@/components/rap-pratica";
import { MoneyLedger } from "@/components/money-ledger";
import { SignCeremony } from "@/components/sign-ceremony";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/offers/$id")({ component: OfferDetail });

function OfferDetail() {
  const { id } = Route.useParams();
  const { user, profile, authPending, loading } = useProfile();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["offer", id],
    queryFn: () => getMyOffer({ data: id }),
    enabled: Boolean(user),
  });
  const [busy, setBusy] = useState(false);

  if (authPending || loading) return <div className="grid min-h-[40vh] place-items-center text-muted">Ładuję…</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;
  if (q.isPending) return <div className="grid min-h-[40vh] place-items-center text-muted">Ładuję ofertę…</div>;
  const offer = q.data;
  if (!offer) {
    return (
      <div className="p-8">
        <p>Nie ma takiej oferty.</p>
        <Link to="/offers" className="text-terracotta">
          Wróć
        </Link>
      </div>
    );
  }
  const property = getProperty(offer.propertyId);
  if (!property) return <p className="p-8">Brak nieruchomości.</p>;
  const dep = DEPOSIT_KINDS.find((d) => d.id === offer.depositKind)!;
  const buyerName = profile.displayName ?? user.displayName ?? "Kupujący";
  const asked = Boolean(offer.requestedDepositEur || offer.requestedDeedBy);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["offer", id] });
    await qc.invalidateQueries({ queryKey: ["offers"] });
  }

  return (
    <div className="px-5 py-4 pb-28">
      <Link to="/offers" className="text-sm text-muted">
        ← Oferty
      </Link>
      <p className="mt-4 text-xs tracking-[0.16em] text-faint uppercase">
        {KIND_PL[offer.kind]} · {STATUS_PL[offer.status] ?? offer.status}
      </p>
      <h1 className="mt-1 font-display text-3xl text-navy">{property.city}</h1>
      <p className="text-sm text-muted">{property.titlePl}</p>

      <PlaneTrack offer={offer} className="mt-5" />

      <div className="mt-5 rounded-xl bg-paper p-4">
        <p className="text-xs text-faint">Cena ogłoszenia {formatEur(offer.askingEur)}</p>
        <p className="font-display text-3xl tabular-nums text-navy">{formatEur(offer.offerEur)}</p>
        {offer.counterEur ? (
          <p className="mt-1 text-sm text-terracotta">Kontroferta: {formatEur(offer.counterEur)}</p>
        ) : null}
        <p className="mt-2 text-sm text-muted">
          {dep.pl} {formatEur(offer.depositEur)} · ważna do {offer.validUntil}
        </p>
      </div>

      {offer.kind === "informal" ? (
        <div className="mt-5">
          <p className="mb-3 rounded-lg bg-ivory-deep px-3 py-2 text-sm text-navy">{LEGAL.informalBannerPl}</p>
          <OfferRecap property={property} draft={draftFromOffer(offer)} />
        </div>
      ) : (
        <div className="mt-5">
          <ProposalDoc offer={offer} property={property} buyerName={offer.signedName ?? buyerName} />
        </div>
      )}

      {offer.agentNoteIt ? (
        <p className="mt-4 text-sm text-muted">
          Chiara: <span className="text-navy">{offer.agentNoteIt}</span>
        </p>
      ) : null}

      {asked && ["sent", "countered"].includes(offer.status) ? (
        <div className="mt-5 rounded-xl border border-terracotta/40 bg-paper p-4">
          <p className="font-display text-xl text-navy">Chiara prosi o zmianę warunków</p>
          {offer.requestedDepositEur ? (
            <p className="mt-1 text-sm text-muted">
              Caparra {formatEur(offer.depositEur)} → {formatEur(offer.requestedDepositEur)}
            </p>
          ) : null}
          {offer.requestedDeedBy ? (
            <p className="text-sm text-muted">
              Rogito {offer.deedBy} → {offer.requestedDeedBy}
            </p>
          ) : null}
          <Button
            className="mt-3 w-full"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await acceptTerms({ data: offer.id });
                toast("Warunki przyjęte. Nadal nieformalne.");
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
          >
            Przyjmij warunki
          </Button>
        </div>
      ) : null}

      {offer.status === "countered" ? (
        <div className="mt-5 flex gap-2">
          <Button
            className="flex-1"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await acceptCounter({ data: offer.id });
                toast("Przyjęto kontrofertę. Nadal nieformalna.");
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
          >
            Przyjmij {offer.counterEur ? formatEur(offer.counterEur) : ""}
          </Button>
        </div>
      ) : null}

      {offer.kind === "informal" && ["sent", "countered"].includes(offer.status) ? (
        offer.officialRequested ? (
          <p className="mt-4 rounded-lg bg-sage-soft px-4 py-3 text-sm text-navy">
            Poproszono o propozycję oficjalną. Chiara przygotowuje dokument dwujęzyczny.
          </p>
        ) : (
          <Button
            variant="navy"
            className="mt-4 w-full"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await requestOfficial({ data: offer.id });
                toast("Prośba poszła do agenta.");
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
          >
            Poproś o propozycję oficjalną
          </Button>
        )
      ) : null}

      {offer.status === "sent" || offer.status === "countered" ? (
        <Button
          variant="ghost"
          className="mt-3 w-full"
          onClick={async () => {
            await withdrawOffer({ data: offer.id });
            await refresh();
          }}
        >
          Wycofaj ofertę
        </Button>
      ) : null}

      {offer.kind === "official" && offer.status === "ready" ? (
        <SignCeremony offerId={offer.id} buyerName={buyerName} onSigned={refresh} />
      ) : null}

      {offer.status === "signed" ? <div className="mt-5"><Countdown72 deadline={offer.acceptDeadline} /></div> : null}

      {offer.status === "expired" ? (
        <p className="mt-5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          Sprzedający nie przyjął w 72 godziny. Nic nie zapłacono. Możesz złożyć nową ofertę.
        </p>
      ) : null}

      {offer.status === "deposit_pending" || offer.status === "accepted" || offer.status === "receipt_uploaded" ? (
        <div className="mt-6 space-y-5">
          <p className="text-sm font-medium text-navy">
            Sprzedający przyjął. Caparra rusza tylko jako {dep.pl}, bonifico SEPA, na konto notariusza.
          </p>
          <MoneyLedger offer={offer} />
          <SepaSlip
            propertyId={property.id}
            offerId={offer.id}
            amount={offer.depositEur}
            depositKind={offer.depositKind}
          />
          {offer.paymentStatus !== "verified" && offer.status !== "receipt_uploaded" ? (
            <ReceiptForm
              busy={busy}
              onSubmit={async (ref, date) => {
                setBusy(true);
                try {
                  await reportSepa({ data: { id: offer.id, paymentRef: ref, paymentDate: date, kind: "caparra" } });
                  toast("Zgłoszono. Chiara potwierdzi wpływ.");
                  await refresh();
                } finally {
                  setBusy(false);
                }
              }}
            />
          ) : (
            <p className="mt-3 text-sm text-sage">Referencja {offer.paymentRef} — czekamy na weryfikację agenta.</p>
          )}
          <RapPratica offer={offer} />
        </div>
      ) : null}

      {offer.status === "under_contract" ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl bg-navy px-5 py-5 text-paper">
            <p className="text-xs tracking-[0.16em] text-sand uppercase">Sotto contratto</p>
            <p className="mt-2 font-display text-2xl">Caparra potwierdzona. Trattativa zamknięta na ten dom.</p>
            <p className="mt-2 text-sm text-paper/75">
              Rejestracja preliminare do {offer.registerDue}. Notariusz i geometra — następny krok w procesie.
            </p>
            <Button asChild variant="outline" className="mt-4 border-paper/30 bg-transparent text-paper">
              <Link to="/journey">Otwórz proces</Link>
            </Button>
          </div>

          <MoneyLedger offer={offer} />
          <RapPratica offer={offer} />

          {offer.secondAccontoStatus !== "none" && offer.secondAccontoEur ? (
            <div>
              <h2 className="font-display text-2xl text-navy">Versa secondo acconto</h2>
              <p className="mb-3 text-sm text-muted">{LEGAL.secondoPl}</p>
              <SepaSlip
                propertyId={property.id}
                offerId={offer.id}
                amount={offer.secondAccontoEur}
                depositKind="acconto2"
                heading="Drugi acconto — bonifico SEPA"
              />
              {offer.secondAccontoStatus === "instructed" ? (
                <ReceiptForm
                  busy={busy}
                  label="Zgłoś drugi acconto po przelewie na konto notariusza."
                  onSubmit={async (ref, date) => {
                    setBusy(true);
                    try {
                      await reportSepa({
                        data: { id: offer.id, paymentRef: ref, paymentDate: date, kind: "acconto2" },
                      });
                      toast("Drugi acconto zgłoszony.");
                      await refresh();
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              ) : (
                <p className="mt-3 text-sm text-sage">
                  {offer.secondAccontoStatus === "verified" ? "Potwierdzony" : "Zgłoszony"} · {offer.secondAccontoRef}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">{LEGAL.secondoPl} Agent włączy ten krok, jeśli preliminare go przewiduje.</p>
          )}

          <div>
            <h2 className="font-display text-2xl text-navy">Paga il saldo al rogito</h2>
            <p className="mb-3 text-sm text-muted">{LEGAL.saldoPl}</p>
            <SepaSlip
              propertyId={property.id}
              offerId={offer.id}
              amount={remainingBalance(offer)}
              depositKind="balance"
              heading="Saldo przy akcie — instrukcja notariusza"
            />
            {offer.balanceStatus === "instructed" ? (
              <ReceiptForm
                busy={busy}
                label="Notariusz potwierdzi saldo przy rogito. Tu zgłaszasz, że przelew wyszedł — bez transitu przez ITALVIA."
                onSubmit={async (ref, date) => {
                  setBusy(true);
                  try {
                    await reportSepa({ data: { id: offer.id, paymentRef: ref, paymentDate: date, kind: "balance" } });
                    toast("Saldo zgłoszone. Czeka na notariusza.");
                    await refresh();
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            ) : offer.balanceStatus === "receipt" ? (
              <p className="mt-3 text-sm text-sage">Zgłoszono {offer.balanceRef}. Czeka na potwierdzenie przy akcie.</p>
            ) : offer.balanceStatus === "verified" ? (
              <p className="mt-3 text-sm text-sage">Saldo potwierdzone przy rogito.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-xs text-faint">{LEGAL.noCartPl}</p>
    </div>
  );
}
