import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Send, X } from "lucide-react";
import { ASK_PROMPTS } from "@/data/life";
import { askChiara } from "@/lib/server/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";

export function AskChiara({ propertyId }: { propertyId: string }) {
  const { user } = useProfile();
  const { lang, tx } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [a, setA] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send(text: string) {
    if (!user) return navigate({ to: "/login" });
    const question = text.trim();
    if (!question) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await askChiara({ data: { propertyId, question, lang } });
      if (res.ok) setA(res.text);
      else
        setErr(
          tx(
            "Chiara jest teraz przy innym kliencie. Napisz w wiadomościach — odpisze osobiście.",
            "Chiara è con un altro cliente. Scrivi nei messaggi — risponde di persona.",
          ),
        );
    } catch {
      setErr(tx("Nie udało się połączyć. Spróbuj przez wiadomości.", "Connessione fallita. Prova dai messaggi."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-paper/95 px-4 py-2.5 text-sm text-navy shadow-[var(--shadow-float)]"
      >
        <MessageCircle className="size-4 text-terracotta" />
        {tx("Zapytaj Chiarę", "Chiedi a Chiara")}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-navy/50 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-float)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <img src="/homes/chiara.jpg" alt="" className="size-11 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy">Chiara Moretti</p>
                <p className="text-[11px] text-faint">
                  {tx("O tym domu, po polsku. Bez ściemy.", "Su questa casa, in italiano. Senza finzioni.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center text-muted"
                aria-label={tx("Zamknij", "Chiudi")}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[50vh] space-y-3 overflow-y-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {ASK_PROMPTS.map((p) => {
                  const label = lang === "it" ? p.it : p.pl;
                  return (
                    <button
                      key={p.pl}
                      type="button"
                      onClick={() => {
                        setQ(label);
                        void send(label);
                      }}
                      className="rounded-full border border-line bg-ivory px-3 py-1.5 text-left text-[12px] text-navy"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {a ? <div className="rounded-lg bg-navy px-4 py-3 text-sm leading-relaxed text-paper">{a}</div> : null}
              {err ? <p className="text-sm text-danger">{err}</p> : null}
              {busy ? <p className="text-sm text-muted">{tx("Chiara czyta dossier…", "Chiara legge il dossier…")}</p> : null}
            </div>
            <form
              className="flex gap-2 border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(q);
              }}
            >
              <Textarea
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tx("Napisz jak do osoby, nie do wyszukiwarki.", "Scrivi come a una persona, non a un motore.")}
                className="min-h-11 flex-1"
                rows={2}
              />
              <Button type="submit" size="icon" disabled={busy} aria-label={tx("Wyślij", "Invia")}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
