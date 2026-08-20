import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getLiveRoom, joinLive, sendWhisper } from "@/lib/server/live";
import { spotOf } from "@/data/live-tour";
import { LiveStage, SpotStrip } from "@/components/live-stage";
import { WhisperThread } from "@/components/live-whispers";
import { LanguageSwitch } from "@/components/language-switch";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/live/$id")({ component: LiveRoomPage });

function LiveRoomPage() {
  const { id } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const { tx } = useLang();
  const qc = useQueryClient();

  const roomQ = useQuery({
    queryKey: ["live-room", id],
    queryFn: () => getLiveRoom({ data: { sessionId: id } }),
    enabled: Boolean(user),
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!user || !id) return;
    void joinLive({ data: id }).then(() => {
      void qc.invalidateQueries({ queryKey: ["live-room", id] });
      void qc.invalidateQueries({ queryKey: ["live-peek"] });
    });
  }, [user, id, qc]);

  const send = useMutation({
    mutationFn: (body: string) => sendWhisper({ data: { sessionId: id, body } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-room", id] }),
  });

  if (isPending) {
    return <div className="grid min-h-dvh place-items-center bg-navy text-paper/70">{tx("Łączę…", "Collego…")}</div>;
  }
  if (!user) return <RedirectToSignIn />;

  const room = roomQ.data;
  if (roomQ.isPending && !room) {
    return <div className="grid min-h-dvh place-items-center bg-navy text-paper/70">{tx("Łączę z tarasem…", "Collego dal terrazzo…")}</div>;
  }
  if (!room) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ivory px-6 text-center">
        <div>
          <p className="font-display text-3xl text-navy">{tx("Transmisja się skończyła", "La diretta è finita")}</p>
          <Link to="/home" className="mt-4 inline-block text-terracotta">
            {tx("Wróć do projektu", "Torna al progetto")}
          </Link>
        </div>
      </div>
    );
  }
  if (room.forbidden) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ivory px-6 text-center">
        <div>
          <p className="font-display text-3xl text-navy">{tx("To zaproszenie nie jest dla Ciebie", "Questo invito non è per te")}</p>
          <p className="mt-2 text-sm text-muted">
            {tx("Chiara wybrała konkretne osoby. Nie ma Cię na liście.", "Chiara ha scelto persone precise. Non sei in lista.")}
          </p>
          <Link to="/home" className="mt-4 inline-block text-terracotta">
            {tx("Wróć", "Indietro")}
          </Link>
        </div>
      </div>
    );
  }
  if (room.isAgent) return <Navigate to="/desk/live" />;

  const peek = room.peek;
  const spot = spotOf(peek.propertyId, peek.spotId);
  const ended = room.status === "ended";

  return (
    <main className="flex min-h-dvh flex-col bg-navy">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <Link to="/homes/$id" params={{ id: peek.propertyId }} className="grid size-11 place-items-center rounded-full bg-paper/10 text-paper">
          <ArrowLeft className="size-5" />
        </Link>
        <p className="min-w-0 truncate text-sm text-paper/80">
          {ended ? tx("Zakończone", "Terminata") : tx("Jesteś na tarasie z Chiarą", "Sei sul terrazzo con Chiara")}
        </p>
        <LanguageSwitch light compact />
      </header>

      <LiveStage peek={peek} spot={spot} className="min-h-[52vh] flex-1" />

      <div className="px-4 py-3">
        <SpotStrip propertyId={peek.propertyId} currentId={peek.spotId} disabled />
        <p className="mt-2 text-[11px] text-sand">
          {tx("Chiara prowadzi zwiedzanie. Ty nie przełączasz ujęć.", "Chiara conduce il giro. Tu non cambi inquadratura.")}
        </p>
      </div>

      {peek.chatEnabled ? (
        <section className="max-h-[38vh] min-h-48">
          <WhisperThread
            whispers={room.whispers}
            activeKey={room.guestKey}
            agent={false}
            onSend={async (body) => {
              await send.mutateAsync(body);
            }}
          />
        </section>
      ) : (
        <p className="px-5 py-4 text-sm text-sand">
          {tx(
            "Chiara wyłączyła czat. Oglądasz taras w ciszy — bez wiadomości.",
            "Chiara ha spento la chat. Guardi il terrazzo in silenzio — senza messaggi.",
          )}
        </p>
      )}
    </main>
  );
}
