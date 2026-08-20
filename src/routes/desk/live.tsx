import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Lock, MessageCircle, MessageCircleOff, Radio, Users } from "lucide-react";
import {
  endLive,
  getStudioLive,
  listLivePeople,
  sendWhisper,
  setLiveChat,
  setLiveSpot,
  startLive,
  type LiveAudience,
  type LiveRoom,
} from "@/lib/server/live";
import { getDeskSnapshot } from "@/lib/server/italvia";
import { spotOf } from "@/data/live-tour";
import { LiveStage, SpotStrip } from "@/components/live-stage";
import { WhisperThread } from "@/components/live-whispers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/desk/live")({ component: DeskLive });

function DeskLive() {
  const qc = useQueryClient();
  const studio = useQuery({
    queryKey: ["live-studio"],
    queryFn: () => getStudioLive(),
    refetchInterval: 2000,
  });
  // seed leads so the contact list is full
  useQuery({ queryKey: ["desk"], queryFn: () => getDeskSnapshot() });

  if (studio.data) return <Studio room={studio.data} />;
  return <Launcher loading={studio.isPending} onStarted={() => void qc.invalidateQueries({ queryKey: ["live-studio"] })} />;
}

function Launcher({ loading, onStarted }: { loading: boolean; onStarted: () => void }) {
  const peopleQ = useQuery({ queryKey: ["live-people"], queryFn: () => listLivePeople() });
  const people = peopleQ.data?.people ?? [];
  const properties = peopleQ.data?.properties ?? [];
  const [propertyId, setPropertyId] = useState("scalea");
  const [audience, setAudience] = useState<LiveAudience>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: () =>
      startLive({
        data: {
          propertyId,
          audience,
          guestKeys: audience === "selected" ? selected : people.map((p) => p.key),
          chatEnabled,
        },
      }),
    onSuccess: () => onStarted(),
    onError: (e) => setError(e instanceof Error ? e.message : "Impossibile partire"),
  });

  function toggle(key: string) {
    setSelected((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  }

  const inviteCount = audience === "all" ? people.length : selected.length;
  const canStart = audience === "all" ? people.length > 0 : selected.length > 0;

  return (
    <div className="px-5 py-6">
      <p className="text-xs tracking-[0.2em] text-faint uppercase">Dal terrazzo</p>
      <h1 className="font-display text-3xl text-navy">Vai in diretta</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">
        Tu conduci. L’invito arriva solo a chi scegli. In chat — se la accendi — nessuno legge gli altri: solo tu.
      </p>

      <section className="mt-8">
        <h2 className="text-xs tracking-[0.16em] text-faint uppercase">Immobile</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {properties.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPropertyId(p.id)}
              className={cn(
                "relative h-24 w-36 shrink-0 overflow-hidden rounded-md",
                propertyId === p.id ? "ring-2 ring-terracotta" : "ring-1 ring-line",
              )}
            >
              <img src={p.image} alt="" className="size-full object-cover" />
              <span className="absolute inset-0 bg-navy/35" />
              <span className="absolute inset-x-0 bottom-0 px-2 pb-1.5 text-left text-xs text-paper">{p.city}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs tracking-[0.16em] text-faint uppercase">Chi riceve l’invito</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Choice
            active={audience === "all"}
            icon={<Users className="size-5" />}
            title="Tutti i contatti"
            sub="Ogni cliente in pipeline riceve la notifica e può entrare."
            onClick={() => setAudience("all")}
          />
          <Choice
            active={audience === "selected"}
            icon={<Check className="size-5" />}
            title="Solo alcuni"
            sub="Scegli i nominativi. Chi non è in lista non vede la diretta."
            onClick={() => setAudience("selected")}
          />
        </div>
      </section>

      {audience === "selected" ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs tracking-[0.16em] text-faint uppercase">Contatti</h2>
            <button
              type="button"
              className="text-xs text-terracotta"
              onClick={() => setSelected(selected.length === people.length ? [] : people.map((p) => p.key))}
            >
              {selected.length === people.length ? "Deseleziona" : "Seleziona tutti"}
            </button>
          </div>
          <ul className="mt-3 divide-y divide-line rounded-xl bg-paper">
            {people.map((p) => {
              const on = selected.includes(p.key);
              return (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => toggle(p.key)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-sm border",
                        on ? "border-navy bg-navy text-paper" : "border-line-strong bg-ivory",
                      )}
                    >
                      {on ? <Check className="size-3.5" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-navy">{p.name}</span>
                      <span className="block text-xs text-muted">{p.city ?? "—"}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <p className="mt-4 rounded-lg bg-ivory-deep px-4 py-3 text-sm text-muted">
          Invito a {people.length} contatti. Chi apre l’app vede il banner e entra dal terrazzo.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-xs tracking-[0.16em] text-faint uppercase">Chat</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Choice
            active={chatEnabled}
            icon={<MessageCircle className="size-5" />}
            title="Chat privata accesa"
            sub="Possono scriverti. Mai in gruppo: ogni messaggio arriva solo a te."
            onClick={() => setChatEnabled(true)}
          />
          <Choice
            active={!chatEnabled}
            icon={<MessageCircleOff className="size-5" />}
            title="Senza chat"
            sub="Solo visione. Nessuno scrive, nessuno legge. Tu mostri la casa."
            onClick={() => setChatEnabled(false)}
          />
        </div>
      </section>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <Button
        size="lg"
        className="mt-8 w-full sm:w-auto"
        disabled={!canStart || start.isPending || loading}
        onClick={() => {
          setError(null);
          start.mutate();
        }}
      >
        <Radio className="size-4" />
        Vai in diretta e invia l’invito
        {inviteCount ? ` · ${inviteCount}` : ""}
      </Button>
    </div>
  );
}

function Choice({
  active,
  icon,
  title,
  sub,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-4 text-left ring-1 transition-colors",
        active ? "bg-navy text-paper ring-navy" : "bg-paper text-navy ring-line",
      )}
    >
      <span className={cn("grid size-10 place-items-center rounded-md", active ? "bg-paper/10" : "bg-ivory-deep")}>
        {icon}
      </span>
      <span className="mt-3 block font-medium">{title}</span>
      <span className={cn("mt-1 block text-sm leading-relaxed", active ? "text-paper/75" : "text-muted")}>{sub}</span>
    </button>
  );
}

function Studio({ room }: { room: LiveRoom }) {
  const qc = useQueryClient();
  const peek = room.peek;
  const spot = spotOf(peek.propertyId, peek.spotId);
  const [thread, setThread] = useState(room.guests[0]?.guestKey ?? room.guestKey);
  const watching = room.guests.filter((g) => g.status === "watching");
  const invited = room.guests.filter((g) => g.status === "notified" || g.status === "watching");

  useEffect(() => {
    if (!room.guests.some((g) => g.guestKey === thread) && room.guests[0]) {
      setThread(room.guests[0].guestKey);
    }
  }, [room.guests, thread]);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["live-studio"] });
    await qc.invalidateQueries({ queryKey: ["live-peek"] });
  }

  return (
    <div className="bg-navy text-paper">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-sand uppercase">In diretta</p>
          <p className="text-sm">
            {peek.audience === "all" ? "Invito a tutti" : `Invito a ${invited.length} contatti`}
            {peek.chatEnabled ? " · chat privata" : " · senza chat"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-paper/20 bg-transparent text-paper hover:bg-paper/10"
            onClick={() => void setLiveChat({ data: { sessionId: peek.id, chatEnabled: !peek.chatEnabled } }).then(refresh)}
          >
            {peek.chatEnabled ? <MessageCircleOff className="size-4" /> : <MessageCircle className="size-4" />}
            {peek.chatEnabled ? "Spegni chat" : "Accendi chat"}
          </Button>
          <Button size="sm" variant="danger" onClick={() => void endLive({ data: peek.id }).then(refresh)}>
            Chiudi diretta
          </Button>
        </div>
      </div>

      <LiveStage peek={peek} spot={spot} className="min-h-[42vh]" />

      <div className="px-4 py-3">
        <p className="mb-2 text-[11px] tracking-[0.16em] text-sand uppercase">Inquadratura — tu conduci</p>
        <SpotStrip
          propertyId={peek.propertyId}
          currentId={peek.spotId}
          onPick={(spotId) => void setLiveSpot({ data: { sessionId: peek.id, spotId } }).then(refresh)}
        />
      </div>

      <div className="grid gap-px bg-navy-soft md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="bg-navy px-4 py-4">
          <h2 className="text-xs tracking-[0.16em] text-sand uppercase">Inviti</h2>
          <p className="mt-1 text-sm text-paper/70">
            {watching.length} in visione · {invited.length} invitati
          </p>
          <ul className="mt-3 space-y-2">
            {invited.map((g) => (
              <li key={g.guestKey} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {g.displayName}
                  {g.city ? <span className="text-paper/50"> · {g.city}</span> : null}
                </span>
                <span className={g.status === "watching" ? "text-sage" : "text-sand"}>
                  {g.status === "watching" ? "sta guardando" : "invito inviato"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {peek.chatEnabled ? (
          <WhisperThread
            whispers={room.whispers}
            guests={room.guests}
            activeKey={thread}
            onActive={setThread}
            agent
            onSend={async (body, guestKey) => {
              await sendWhisper({ data: { sessionId: peek.id, body, guestKey } });
              await refresh();
            }}
          />
        ) : (
          <div className="flex items-center gap-3 bg-navy px-4 py-8 text-sm text-paper/70">
            <Lock className="size-4 shrink-0" />
            Chat spenta. Nessuno può scrivere. Puoi accenderla in qualsiasi momento.
          </div>
        )}
      </div>
    </div>
  );
}
