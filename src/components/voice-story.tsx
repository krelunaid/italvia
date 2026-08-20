import { useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";
import { speakStory } from "@/lib/server/ai";
import { storyOf } from "@/data/life";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

export function VoiceStory({ propertyId, className }: { propertyId: string; className?: string }) {
  const { lang, tx } = useLang();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [spokenLang, setSpokenLang] = useState(lang);
  const story = storyOf(propertyId);

  async function toggle() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    if (audioRef.current && spokenLang === lang) {
      void audioRef.current.play();
      setPlaying(true);
      return;
    }
    audioRef.current = null;
    setBusy(true);
    setFailed(false);
    try {
      const res = await speakStory({ data: { propertyId, lang } });
      if (!res.ok) {
        setFailed(true);
        return;
      }
      const url = `data:${res.mime};base64,${res.audio}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      setSpokenLang(lang);
      audio.onended = () => setPlaying(false);
      await audio.play();
      setPlaying(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (!story) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy}
        className="flex items-center gap-2 rounded-full bg-navy/80 px-4 py-2.5 text-sm text-paper backdrop-blur-sm"
      >
        {playing ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
        {busy
          ? tx("Łączę z Chiarą…", "Collego Chiara…")
          : playing
            ? tx("Zatrzymaj głos", "Ferma la voce")
            : tx("Posłuchaj Chiary", "Ascolta Chiara")}
      </button>
      {failed ? (
        <p className="max-w-md text-xs leading-relaxed text-paper/80">{lang === "it" ? story.it : story.pl}</p>
      ) : null}
    </div>
  );
}
