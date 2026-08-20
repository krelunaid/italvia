import { useEffect, useState } from "react";
import { LEGAL } from "@/data/legal";
import { signOfficial } from "@/lib/server/offers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function SignCeremony({
  offerId,
  buyerName,
  onSigned,
}: {
  offerId: string;
  buyerName: string;
  onSigned: () => Promise<void>;
}) {
  const [idDoc, setIdDoc] = useState(false);
  const [recording, setRecording] = useState(false);
  const [identified, setIdentified] = useState(false);
  const [left, setLeft] = useState(3);
  const [name, setName] = useState("");
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [profession, setProfession] = useState("");
  const [residence, setResidence] = useState("");
  const [funds, setFunds] = useState("");
  const [iban, setIban] = useState("");
  const [cf, setCf] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!recording) return;
    setLeft(3);
    const tick = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    const done = setTimeout(() => {
      setRecording(false);
      setIdentified(true);
    }, 3000);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [recording]);

  return (
    <div className="mt-6 space-y-4">
      <section className="rounded-xl border border-danger/30 bg-paper p-5">
        <p className="text-xs tracking-[0.16em] text-faint uppercase">Krok 1 · identyfikacja eIDAS</p>
        <h2 className="mt-1 font-display text-2xl text-navy">Dokument i wideo</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{LEGAL.identityPl}</p>
        <label className="mt-4 flex gap-3 text-sm text-navy">
          <input
            type="checkbox"
            checked={idDoc}
            onChange={(e) => setIdDoc(e.target.checked)}
            className="mt-1 accent-terracotta"
          />
          Mam paszport albo dowód osobisty — ten sam, którym podpiszę.
        </label>
        {recording ? (
          <div className="mt-4 overflow-hidden rounded-lg bg-navy">
            <div className="relative">
              <img src="/homes/chiara.jpg" alt="" className="h-44 w-full object-cover opacity-80" />
              <span className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-danger px-3 py-1 text-[11px] text-paper">
                <span className="rec-dot size-2 rounded-full bg-paper" />
                Nagranie 0:0{left}
              </span>
            </div>
            <p className="px-4 py-3 text-sm text-paper/80">Chiara potwierdza tożsamość. Nie rysujesz podpisu palcem.</p>
          </div>
        ) : identified ? (
          <p className="mt-4 rounded-md bg-sage-soft px-3 py-2 text-sm text-navy">
            Identyfikacja zapisana. Dalej: polskie tłumaczenie, oświadczenie AML, podpis z znacznikiem czasu.
          </p>
        ) : (
          <Button className="mt-4 w-full" variant="navy" disabled={!idDoc} onClick={() => setRecording(true)}>
            Rozpocznij identyfikację wideo
          </Button>
        )}
      </section>

      {identified ? (
        <form
          className="space-y-3 rounded-xl border border-danger/30 bg-paper p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await signOfficial({
                data: {
                  id: offerId,
                  fullName: name,
                  readPl: c1,
                  binding: c2,
                  caparra: c3,
                  profession,
                  residence,
                  fundsOrigin: funds,
                  originIban: iban,
                  codiceFiscale: cf,
                  identityOk: true,
                },
              });
              toast("Podpis zapisany ze znacznikiem czasu. 72 h na sprzedającego. Pieniądze stoją.");
              await onSigned();
            } catch (err) {
              toast(err instanceof Error ? err.message : "Nie podpisano.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="text-xs tracking-[0.16em] text-faint uppercase">Krok 2 · podpis kwalifikowany</p>
          <h2 className="font-display text-2xl text-navy">To może stać się umową</h2>
          <p className="text-sm leading-relaxed text-danger">{LEGAL.bindingWarnPl}</p>
          <p className="text-sm leading-relaxed text-muted">{LEGAL.eidasPl}</p>
          <p className="text-sm text-danger">{LEGAL.caparraQualifyPl}</p>
          <p className="text-xs text-muted">{LEGAL.seventyTwoPl}</p>
          <p className="text-xs leading-relaxed text-faint">{LEGAL.amlPl}</p>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={c1} onChange={(e) => setC1(e.target.checked)} className="mt-1 accent-terracotta" />
            Przeczytałem polskie tłumaczenie i wiem, że wiąże wersja włoska.
          </label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={c2} onChange={(e) => setC2(e.target.checked)} className="mt-1 accent-terracotta" />
            Rozumiem, że po przyjęciu przez sprzedającego i zawiadomieniu mnie propozycja może stać się preliminare.
          </label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={c3} onChange={(e) => setC3(e.target.checked)} className="mt-1 accent-terracotta" />
            Rozumiem caparrę confirmatorię (art. 1385): strata albo żądanie podwójnej kwoty przy niewykonaniu.
          </label>
          <label className="block text-xs text-faint">Imię i nazwisko — jak w dokumencie</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={buyerName} />
          <label className="block text-xs text-faint">Zawód</label>
          <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="np. architekt" />
          <label className="block text-xs text-faint">Adres zamieszkania</label>
          <Input value={residence} onChange={(e) => setResidence(e.target.value)} placeholder="ul. Długa 1, Warszawa" />
          <label className="block text-xs text-faint">Codice fiscale włoski, jeśli masz — inaczej PESEL</label>
          <Input value={cf} onChange={(e) => setCf(e.target.value)} placeholder="PESEL albo CF" />
          <label className="block text-xs text-faint">Pochodzenie środków</label>
          <Textarea
            value={funds}
            onChange={(e) => setFunds(e.target.value)}
            placeholder="np. oszczędności z wynagrodzenia, sprzedaż mieszkania w Krakowie"
          />
          <label className="block text-xs text-faint">IBAN rachunku, z którego wyjdzie caparra</label>
          <Input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="PL..." />
          <Button type="submit" className="w-full" disabled={busy || !c1 || !c2 || !c3}>
            Podpisz (eIDAS — demonstracja)
          </Button>
        </form>
      ) : null}
    </div>
  );
}
