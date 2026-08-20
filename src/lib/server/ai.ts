import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getProperty } from "@/data/properties";
import { propertyBrief, storyOf } from "@/data/life";
import { estimatePurchase } from "@/lib/costs";
import { estimateLifeFromPoland } from "@/lib/life-cost";

const voiceCache = new Map<string, { mime: string; audio: string }>();

function noKey() {
  return { ok: false as const, error: "unavailable" as const };
}

export const askChiara = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { propertyId: string; question: string; lang?: "pl" | "it" }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return noKey();
    const p = getProperty(data.propertyId);
    if (!p) return { ok: false as const, error: "missing" as const };
    const q = data.question.trim().slice(0, 400);
    if (!q) return { ok: false as const, error: "empty" as const };

    const costs = estimatePurchase(p);
    const life = estimateLifeFromPoland(p);
    const brief = propertyBrief(p);
    const italian = data.lang === "it";

    const system = italian
      ? `Sei Chiara Moretti, concierge ITALVIA. Parli in italiano, breve, calda, senza finzioni. Aiuti un acquirente a comprare questa casa in Italia. Non sei notaio né consulente fiscale — se non sai o deve confermare geometra/notaio, lo dici. Mai promettere rendimento o sgravi. D’inverno sei onesta. Risposta: 80–140 parole, senza emoji, senza trattini decorativi.

Casa:
${JSON.stringify(brief)}
Prezzo ${p.priceEur} €. Costo prudente ${costs.totalMin}–${costs.totalMax} €.
Tenuta dalla Polonia (stima) ${life.monthMin}–${life.monthMax} €/mese, ${life.visitsPerYear} arrivi/anno, ${life.emptyMonths} mesi vuoti.`
      : `Jesteś Chiara Moretti, concierge ITALVIA. Mówisz po polsku, krótko, ciepło i bez ściemy. Pomagasz Polakowi kupić ten konkretny dom we Włoszech. Nie jesteś notariuszem ani doradcą podatkowym — jeśli czegoś nie wiesz albo musi potwierdzić geometra/notariusz, mówisz to wprost. Nigdy nie obiecujesz zysku ani ulgi podatkowej. Zimą jesteś szczera. Odpowiedź: 80–140 słów, bez emoji, bez myślników ozdobnych.

Dom:
${JSON.stringify(brief)}
Cena ogłoszenia ${p.priceEur} €. Koszt ostrożny ${costs.totalMin}–${costs.totalMax} €.
Utrzymanie z Polski (szacunek) ${life.monthMin}–${life.monthMax} €/mies., ${life.visitsPerYear} przylotów/rok, ${life.emptyMonths} miesięcy pustych.`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: system,
          },
          { role: "user", content: q },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `api ${res.status}` as const };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const text = body.choices[0]?.message.content?.trim() ?? "";
    return { ok: true as const, text };
  });

export const speakStory = createServerFn({ method: "POST" })
  .validator((input: { propertyId: string; lang?: "pl" | "it" }) => input)
  .handler(async ({ data }) => {
    const cached = voiceCache.get(`${data.propertyId}:${data.lang ?? "pl"}`);
    if (cached) return { ok: true as const, ...cached };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return noKey();
    const story = storyOf(data.propertyId);
    if (!story) return { ok: false as const, error: "missing" as const };
    const text = data.lang === "it" ? story.it : story.pl;

    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text, voice_id: "eve" }),
    });
    if (!res.ok) return { ok: false as const, error: `api ${res.status}` as const };
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") || "audio/mpeg";
    const audio = buf.toString("base64");
    const payload = { mime, audio };
    voiceCache.set(`${data.propertyId}:${data.lang ?? "pl"}`, payload);
    return { ok: true as const, ...payload };
  });
