import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LiveGuest, LiveWhisper } from "@/lib/server/live";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function WhisperThread({
  whispers,
  guests,
  activeKey,
  onActive,
  onSend,
  agent,
}: {
  whispers: LiveWhisper[];
  guests?: LiveGuest[];
  activeKey: string;
  onActive?: (key: string) => void;
  onSend: (body: string, guestKey?: string) => Promise<void>;
  agent: boolean;
}) {
  const { tx } = useLang();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const thread = whispers.filter((w) => !agent || w.guestKey === activeKey);
  const people = (guests ?? []).filter((g) => g.status !== "declined");

  async function submit() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await onSend(body, agent ? activeKey : undefined);
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-col bg-navy text-paper">
      {agent && people.length ? (
        <div className="flex gap-1 overflow-x-auto border-b border-paper/10 px-3 py-2">
          {people.map((g) => {
            const unreadish = whispers.some((w) => w.guestKey === g.guestKey && w.fromRole === "buyer");
            return (
              <button
                key={g.guestKey}
                type="button"
                onClick={() => onActive?.(g.guestKey)}
                className={cn(
                  "min-h-10 shrink-0 rounded-full px-3 text-xs",
                  activeKey === g.guestKey ? "bg-paper text-navy" : "bg-paper/10 text-paper/80",
                )}
              >
                {g.displayName.split(" ")[0]}
                {g.status === "watching" ? " · on" : ""}
                {unreadish && activeKey !== g.guestKey ? " ·" : ""}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-paper/10 px-4 py-3 text-xs text-sand">
          <Lock className="size-3.5" />
          {tx("Tylko Chiara to przeczyta. Nikt z grupy nie widzi.", "Lo legge solo Chiara. Nessuno del gruppo lo vede.")}
        </div>
      )}

      <div className="min-h-32 flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {thread.length === 0 ? (
          <p className="text-sm text-paper/55">
            {agent
              ? tx("Prywatna nić z tą osobą. Reszta grupy tego nie widzi.", "Filo privato con questa persona. Il gruppo non lo vede.")
              : tx("Napisz prywatnie. Nie ma czatu na żywo.", "Scrivi in privato. Non c’è una chat in diretta.")}
          </p>
        ) : (
          thread.map((w) => {
            const who =
              w.fromRole === "agent"
                ? "Chiara"
                : agent
                  ? (guests?.find((g) => g.guestKey === w.guestKey)?.displayName.split(" ")[0] ?? "Cliente")
                  : tx("Ty", "Tu");
            return (
            <div
              key={w.id}
              className={cn(
                "max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed",
                w.fromRole === "agent" ? "ml-auto bg-terracotta text-paper" : "bg-paper/12 text-paper",
              )}
            >
              <p className="text-[10px] tracking-wider uppercase opacity-70">{who}</p>
              <p className="mt-0.5">{w.body}</p>
            </div>
            );
          })
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t border-paper/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder={
            agent
              ? tx("Odpowiedz tylko tej osobie…", "Rispondi solo a questa persona…")
              : tx("Pytanie tylko do Chiary…", "Domanda solo a Chiara…")
          }
          className="min-h-11 resize-none border-paper/15 bg-navy-soft text-paper placeholder:text-paper/40"
        />
        <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label={tx("Wyślij", "Invia")}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
