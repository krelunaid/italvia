import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getMessages, sendMessage } from "@/lib/server/italvia";
import { useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSwitch } from "@/components/language-switch";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/messages/$id")({ component: Thread });

function Thread() {
  const { id } = Route.useParams();
  const { user, profile, authPending, loading } = useProfile();
  const { lang, t, tx } = useLang();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const q = useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessages({ data: id }),
    enabled: Boolean(user),
  });

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  const prompts =
    lang === "it"
      ? ["La casa è venduta arredata?", "Vorrei una video-visita.", "Quanto è il condominio?"]
      : ["Czy mieszkanie jest sprzedawane z meblami?", "Chcę umówić video-wizytę.", "Ile wynosi wspólnota?"];

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await sendMessage({ data: { conversationId: id, text } });
      setText("");
      await qc.invalidateQueries({ queryKey: ["messages", id] });
      await qc.invalidateQueries({ queryKey: ["inbox"] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[80dvh] flex-col px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <Link to="/messages" className="flex items-center gap-2 text-sm text-muted">
          <ArrowLeft className="size-4" />
          {t("navMessages")}
        </Link>
        <LanguageSwitch compact />
      </div>
      <h1 className="mt-3 font-display text-2xl text-navy">Chiara Moretti</h1>
      <p className="text-xs text-faint">
        {tx("Tłumaczenie informacyjne — nie zastępuje tłumacza przysięgłego.", "Traduzione informativa — non sostituisce un traduttore giurato.")}
      </p>
      <ul className="mt-4 flex-1 space-y-3">
        {(q.data ?? []).map((m) => {
          const mine = m.senderRole === "buyer";
          const shown = mine
            ? m.bodyOriginal
            : lang === "it"
              ? m.bodyOriginal
              : m.bodyTranslated ?? m.bodyOriginal;
          return (
            <li
              key={m.id}
              className={cn("max-w-[85%] rounded-lg px-4 py-3 text-sm", mine ? "ml-auto bg-navy text-paper" : "bg-paper text-navy")}
            >
              <p>{shown}</p>
              {!mine && m.bodyOriginal && m.bodyTranslated && lang === "pl" ? (
                <p className="mt-2 text-[11px] opacity-60">IT: {m.bodyOriginal}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="sticky bottom-24 mt-4 space-y-2 bg-ivory pt-2">
        <div className="flex flex-wrap gap-2">
          {prompts.map((qck) => (
            <button
              key={qck}
              type="button"
              className="rounded-full bg-paper px-3 py-1.5 text-xs text-navy"
              onClick={() => setText(qck)}
            >
              {qck}
            </button>
          ))}
        </div>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={tx("Napisz po polsku…", "Scrivi in italiano…")} />
        <Button className="w-full" onClick={() => void send()} disabled={busy}>
          {busy ? tx("Tłumaczę i wysyłam…", "Traduco e invio…") : t("send")}
        </Button>
      </div>
    </div>
  );
}
