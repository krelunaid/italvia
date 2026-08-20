import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PROPERTIES } from "@/data/properties";
import { createTrip, listTrips } from "@/lib/server/italvia";
import { useFavorites, useProfile } from "@/lib/hooks";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { formatEur } from "@/lib/money";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/trip")({ component: Trip });

const SLOTS = ["09:30", "11:15", "13:00", "15:30", "17:00"];

function Trip() {
  const { user, profile, authPending, loading } = useProfile();
  const favs = useFavorites();
  const qc = useQueryClient();
  const { lang, t, tx, locale } = useLang();
  const trips = useQuery({ queryKey: ["trips", user?.id], queryFn: () => listTrips(), enabled: Boolean(user) });
  const [picked, setPicked] = useState<string[]>([]);

  if (authPending || loading) return <div className="grid min-h-[50vh] place-items-center text-muted">{t("loading")}</div>;
  if (!user) return <RedirectToSignIn />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" />;

  const pool = PROPERTIES.filter((p) => favs.data?.includes(p.id));
  const day = picked.map((id, i) => ({ time: SLOTS[i] ?? "18:00", home: PROPERTIES.find((p) => p.id === id)! })).filter((x) => x.home);

  return (
    <div className="px-5 py-4">
      <AppHeader padded={false} />
      <h1 className="mt-6 font-display text-3xl text-navy">{tx("Dzień we Włoszech", "Una giornata in Italia")}</h1>
      <p className="text-sm text-muted">
        {tx("Wybierz 3–4 domy. Ułożymy dzień: dojazd, lunch z agentem, podsumowanie.", "Scegli 3–4 case. Componiamo il giorno: trasferimenti, pranzo con l’agente, riepilogo.")}
      </p>

      <div className="mt-5 space-y-2">
        {pool.map((p) => {
          const on = picked.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setPicked((cur) => {
                  if (on) return cur.filter((x) => x !== p.id);
                  if (cur.length >= 4) return cur;
                  return [...cur, p.id];
                })
              }
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left ${on ? "border-terracotta bg-paper" : "border-line bg-paper"}`}
            >
              <img src={p.images[0]} alt="" className="size-12 rounded-md object-cover" />
              <span>
                <span className="block text-sm text-navy">{p.city}</span>
                <span className="text-xs text-muted">{formatEur(p.priceEur, false, locale)}</span>
              </span>
            </button>
          );
        })}
        {pool.length === 0 ? (
          <p className="text-sm text-muted">
            {tx("Najpierw", "Prima")}{" "}
            <Link to="/saved" className="text-terracotta">
              {tx("zapisz", "salva")}
            </Link>{" "}
            {tx("kilka domów.", "qualche casa.")}
          </p>
        ) : null}
      </div>

      {day.length >= 2 ? (
        <ol className="mt-8 space-y-3">
          <p className="text-xs uppercase tracking-wider text-faint">
            {tx("Dzień 1 · punkt zbiórki 9:00, kawiarnia przy stacji", "Giorno 1 · ritrovo 9:00, caffè in stazione")}
          </p>
          {day.map((slot) => (
            <li key={slot.home.id} className="flex gap-3 rounded-lg bg-paper p-3">
              <span className="w-14 tabular-nums text-terracotta">{slot.time}</span>
              <span>
                <span className="block font-medium text-navy">{lang === "it" ? slot.home.titleIt : slot.home.titlePl}</span>
                <span className="text-xs text-muted">{slot.home.city}</span>
              </span>
            </li>
          ))}
          <li className="flex gap-3 rounded-lg bg-navy p-3 text-paper">
            <span className="w-14 tabular-nums">13:00</span>
            <span>{tx("Lunch i rozmowa z Chiarą", "Pranzo e colloquio con Chiara")}</span>
          </li>
        </ol>
      ) : null}

      <Button
        className="mt-6 w-full"
        disabled={picked.length < 2}
        onClick={async () => {
          await createTrip({
            data: {
              dateLabel: tx("Dzień 1 — do ustalenia", "Giorno 1 — da confermare"),
              propertyIds: picked,
              meetingPoint: tx("Kawiarnia przy stacji, 9:00", "Caffè in stazione, 9:00"),
            },
          });
          await qc.invalidateQueries({ queryKey: ["trips"] });
          toast(tx("Plan dnia zapisany. Chiara potwierdzi godziny.", "Piano del giorno salvato. Chiara conferma gli orari."));
        }}
      >
        {tx("Zapisz plan dnia", "Salva il piano del giorno")}
      </Button>

      {(trips.data ?? []).length ? (
        <div className="mt-6 text-sm text-muted">
          {trips.data!.length} {tx("zapisanych wyjazdów", "viaggi salvati")}
        </div>
      ) : null}
    </div>
  );
}
