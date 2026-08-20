import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { JOURNEY } from "@/data/journey";
import { getProperty } from "@/data/properties";

export type Profile = {
  userId: string;
  role: "buyer" | "agent";
  displayName: string | null;
  purpose: string | null;
  budgetEur: number | null;
  cashAvailableEur: number | null;
  financing: string | null;
  setting: string | null;
  condition: string | null;
  preferredAirport: string | null;
  polishCity: string | null;
  visitPeriods: string | null;
  rentalInterest: string | null;
  minRooms: number | null;
  wantsTerrace: boolean;
  seaMaxKm: number | null;
  onboarded: boolean;
};

export type MessageDTO = {
  id: string;
  conversationId: string;
  senderRole: "buyer" | "agent";
  bodyOriginal: string;
  bodyTranslated: string | null;
  originalLang: "pl" | "it";
  createdAt: string;
};

function nid() {
  return crypto.randomUUID();
}

function num(v: unknown) {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function bool(v: unknown) {
  return v === true || v === "t" || v === "true" || v === 1;
}

type ProfileRow = Record<string, unknown>;

function mapProfile(row: ProfileRow): Profile {
  return {
    userId: String(row.user_id),
    role: row.role === "agent" ? "agent" : "buyer",
    displayName: (row.display_name as string) ?? null,
    purpose: (row.purpose as string) ?? null,
    budgetEur: num(row.budget_eur),
    cashAvailableEur: num(row.cash_available_eur),
    financing: (row.financing as string) ?? null,
    setting: (row.setting as string) ?? null,
    condition: (row.condition as string) ?? null,
    preferredAirport: (row.preferred_airport as string) ?? null,
    polishCity: (row.polish_city as string) ?? null,
    visitPeriods: (row.visit_periods as string) ?? null,
    rentalInterest: (row.rental_interest as string) ?? null,
    minRooms: num(row.min_rooms),
    wantsTerrace: bool(row.wants_terrace),
    seaMaxKm: num(row.sea_max_km),
    onboarded: bool(row.onboarded),
  };
}

async function log(userId: string, action: string, meta?: string) {
  const sql = await getSql();
  await sql`insert into activity_log (id, user_id, action, meta) values (${nid()}, ${userId}, ${action}, ${meta ?? null})`;
}

const SEED_LEADS = [
  {
    id: "lead-marek",
    name: "Marek Kowalski",
    city: "Warszawa",
    purpose: "vacation",
    budget: 150000,
    setting: "sea",
    stage: "video",
    last: "wczoraj",
    notes: "Scalea i Tropea. Video-wizyta w piątek 11:00.",
  },
  {
    id: "lead-anna",
    name: "Anna Nowak",
    city: "Kraków",
    purpose: "investment",
    budget: 120000,
    setting: "city",
    stage: "shortlist",
    last: "2 dni temu",
    notes: "Catania zapisana. Pyta o najem turystyczny.",
  },
  {
    id: "lead-piotr",
    name: "Piotr Wiśniewski",
    city: "Wrocław",
    purpose: "retirement",
    budget: 180000,
    setting: "countryside",
    stage: "trip",
    last: "5 dni temu",
    notes: "Ostuni. Chce październikowy wyjazd.",
  },
  {
    id: "lead-magda",
    name: "Magda Lewandowska",
    city: "Gdańsk",
    purpose: "relocation",
    budget: 240000,
    setting: "sea",
    stage: "new",
    last: "dziś",
    notes: "Nowy kontakt z kampanii. Viareggio w oglądanych.",
  },
];

async function ensureSeeds() {
  const sql = await getSql();
  const existing = await sql<{ id: string }>`select id from leads where is_seed = true limit 1`;
  if (existing.length) return;
  for (const l of SEED_LEADS) {
    await sql`insert into leads (id, name, polish_city, purpose, budget_eur, setting, stage, last_touch, notes, is_seed)
      values (${l.id}, ${l.name}, ${l.city}, ${l.purpose}, ${l.budget}, ${l.setting}, ${l.stage}, ${l.last}, ${l.notes}, true)`;
  }
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    return rows[0] ? mapProfile(rows[0]) : null;
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Omit<Profile, "userId">) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const role = data.role === "agent" ? "agent" : "buyer";
    await sql`insert into profiles (
      user_id, role, display_name, purpose, budget_eur, cash_available_eur, financing, setting, condition,
      preferred_airport, polish_city, visit_periods, rental_interest, min_rooms, wants_terrace, sea_max_km, onboarded, updated_at
    ) values (
      ${context.userId}, ${role}, ${data.displayName}, ${data.purpose}, ${data.budgetEur}, ${data.cashAvailableEur},
      ${data.financing}, ${data.setting}, ${data.condition}, ${data.preferredAirport}, ${data.polishCity},
      ${data.visitPeriods}, ${data.rentalInterest}, ${data.minRooms}, ${data.wantsTerrace}, ${data.seaMaxKm},
      ${data.onboarded}, now()
    )
    on conflict (user_id) do update set
      role = excluded.role,
      display_name = excluded.display_name,
      purpose = excluded.purpose,
      budget_eur = excluded.budget_eur,
      cash_available_eur = excluded.cash_available_eur,
      financing = excluded.financing,
      setting = excluded.setting,
      condition = excluded.condition,
      preferred_airport = excluded.preferred_airport,
      polish_city = excluded.polish_city,
      visit_periods = excluded.visit_periods,
      rental_interest = excluded.rental_interest,
      min_rooms = excluded.min_rooms,
      wants_terrace = excluded.wants_terrace,
      sea_max_km = excluded.sea_max_km,
      onboarded = excluded.onboarded,
      updated_at = now()`;

    if (data.onboarded && role === "buyer") {
      for (const step of JOURNEY) {
        const status = step.id === "profile" ? "done" : step.id === "shortlist" ? "current" : "pending";
        await sql`insert into journey_steps (user_id, step_id, status, actor)
          values (${context.userId}, ${step.id}, ${status}, ${step.actorPl})
          on conflict (user_id, step_id) do nothing`;
      }
      const convs = await sql<{ id: string }>`select id from conversations where user_id = ${context.userId} limit 1`;
      if (!convs.length) {
        const cid = nid();
        await sql`insert into conversations (id, user_id, title) values (${cid}, ${context.userId}, ${"Chiara Moretti"})`;
        const welcomePl =
          "Dzień dobry. Jestem Chiara z ITALVIA. Przygotowałam dla Ciebie kilka domów zgodnych z Twoim projektem. Napisz, od którego chcesz zacząć — albo umówmy video-wizytę.";
        const welcomeIt =
          "Buongiorno. Sono Chiara di ITALVIA. Ho preparato alcune case in linea con il tuo progetto. Dimmi da quale vuoi partire — oppure fissiamo una video-visita.";
        await sql`insert into messages (id, conversation_id, user_id, sender_role, body_original, body_translated, original_lang)
          values (${nid()}, ${cid}, ${context.userId}, ${"agent"}, ${welcomeIt}, ${welcomePl}, ${"it"})`;
      }
      const docs = await sql<{ id: string }>`select id from documents where user_id = ${context.userId} limit 1`;
      if (!docs.length) {
        const starters = [
          ["Kod podatkowy — wniosek", "codice-fiscale", "it", "professional", "Wniosek o codice fiscale. Tłumaczenie pomocnicze."],
          ["Checklista dokumentów kupna", "checklist", "pl", "original", "Lista dokumentów, które zbieramy przed propozycją."],
          ["Zgoda na przetwarzanie danych", "privacy", "pl", "original", "Rejestr zgód RODO / GDPR."],
        ] as const;
        for (const d of starters) {
          await sql`insert into documents (id, user_id, title, kind, lang, translation_kind, summary)
            values (${nid()}, ${context.userId}, ${d[0]}, ${d[1]}, ${d[2]}, ${d[3]}, ${d[4]})`;
        }
      }
      const leadId = `user-${context.userId}`;
      await sql`insert into leads (id, user_id, name, polish_city, purpose, budget_eur, setting, stage, last_touch, notes, is_seed)
        values (${leadId}, ${context.userId}, ${data.displayName ?? "Kupujący"}, ${data.polishCity}, ${data.purpose}, ${data.budgetEur}, ${data.setting}, ${"new"}, ${"teraz"}, ${"Kontakt z aplikacji."}, false)
        on conflict (id) do update set purpose = excluded.purpose, budget_eur = excluded.budget_eur, setting = excluded.setting, last_touch = excluded.last_touch`;
      await log(context.userId, "profile_completed");
    }
    const rows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    return rows[0] ? mapProfile(rows[0]) : null;
  });

export const setMyRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((role: "buyer" | "agent") => (role === "agent" ? "agent" : "buyer") as "buyer" | "agent")
  .handler(async ({ context, data: role }) => {
    const sql = await getSql();
    const name = role === "agent" ? "Chiara Moretti" : "Marek Kowalski";
    await sql`insert into profiles (user_id, role, display_name, onboarded, updated_at)
      values (${context.userId}, ${role}, ${name}, ${true}, now())
      on conflict (user_id) do update set
        role = excluded.role,
        display_name = excluded.display_name,
        onboarded = true,
        updated_at = now()`;
    await log(context.userId, role === "agent" ? "role_agent" : "role_buyer");
    const rows = await sql<ProfileRow>`select * from profiles where user_id = ${context.userId} limit 1`;
    return rows[0] ? mapProfile(rows[0]) : null;
  });

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ property_id: string }>`select property_id from favorites where user_id = ${context.userId}`;
    return rows.map((r) => r.property_id);
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((propertyId: string) => propertyId)
  .handler(async ({ context, data: propertyId }) => {
    const sql = await getSql();
    const existing = await sql`select property_id from favorites where user_id = ${context.userId} and property_id = ${propertyId}`;
    if (existing.length) {
      await sql`delete from favorites where user_id = ${context.userId} and property_id = ${propertyId}`;
      return false;
    }
    await sql`insert into favorites (user_id, property_id) values (${context.userId}, ${propertyId})`;
    await log(context.userId, "favorite", propertyId);
    return true;
  });

export const listCompare = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ property_id: string }>`select property_id from compare_items where user_id = ${context.userId} order by created_at`;
    return rows.map((r) => r.property_id);
  });

export const toggleCompare = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((propertyId: string) => propertyId)
  .handler(async ({ context, data: propertyId }) => {
    const sql = await getSql();
    const existing = await sql`select property_id from compare_items where user_id = ${context.userId} and property_id = ${propertyId}`;
    if (existing.length) {
      await sql`delete from compare_items where user_id = ${context.userId} and property_id = ${propertyId}`;
      return { added: false, count: (await sql`select property_id from compare_items where user_id = ${context.userId}`).length };
    }
    const all = await sql`select property_id from compare_items where user_id = ${context.userId}`;
    if (all.length >= 4) return { added: false, count: all.length, full: true as const };
    await sql`insert into compare_items (user_id, property_id) values (${context.userId}, ${propertyId})`;
    return { added: true, count: all.length + 1 };
  });

export const getInbox = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const convos = await sql<{ id: string; title: string | null; property_id: string | null; last_at: string }>`
      select id, title, property_id, last_at from conversations where user_id = ${context.userId} order by last_at desc`;
    const result = [];
    for (const c of convos) {
      const last = await sql<{ body_original: string; body_translated: string | null; sender_role: string; created_at: string }>`
        select body_original, body_translated, sender_role, created_at from messages where conversation_id = ${c.id} order by created_at desc limit 1`;
      result.push({ ...c, last: last[0] ?? null });
    }
    return result;
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((conversationId: string) => conversationId)
  .handler(async ({ context, data: conversationId }) => {
    const sql = await getSql();
    const owned = await sql`select id from conversations where id = ${conversationId} and user_id = ${context.userId}`;
    if (!owned.length) return [] as MessageDTO[];
    const rows = await sql<MessageDTO & { sender_role: string; body_original: string; body_translated: string | null; original_lang: string; created_at: string; conversation_id: string }>`
      select id, conversation_id, sender_role, body_original, body_translated, original_lang, created_at
      from messages where conversation_id = ${conversationId} order by created_at`;
    return rows.map((r) => ({
      id: r.id,
      conversationId: r.conversation_id,
      senderRole: r.sender_role === "agent" ? "agent" : "buyer",
      bodyOriginal: r.body_original,
      bodyTranslated: r.body_translated,
      originalLang: r.original_lang === "it" ? "it" : "pl",
      createdAt: r.created_at,
    }));
  });

async function translateText(text: string, from: "pl" | "it", to: "pl" | "it") {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return heuristicTranslate(text, from, to);
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "Jesteś tłumaczem nieruchomości ITALVIA. Tłumacz wiernie, bez ozdobników, zachowując liczby i nazwy własne. Zwróć wyłącznie tłumaczenie.",
          },
          {
            role: "user",
            content: `Przetłumacz z ${from === "pl" ? "polskiego" : "włoskiego"} na ${to === "pl" ? "polski" : "włoski"}:\n\n${text}`,
          },
        ],
      }),
    });
    if (!res.ok) return heuristicTranslate(text, from, to);
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return body.choices[0]?.message.content?.trim() || heuristicTranslate(text, from, to);
  } catch {
    return heuristicTranslate(text, from, to);
  }
}

function heuristicTranslate(text: string, from: "pl" | "it", to: "pl" | "it") {
  if (from === to) return text;
  const pairs: [string, string][] = [
    ["Czy mieszkanie jest sprzedawane z meblami?", "L’appartamento viene venduto arredato?"],
    ["Chcę umówić video-wizytę.", "Vorrei fissare una video-visita."],
    ["Poproszę o przygotowanie propozycji.", "Chiedo di preparare la proposta."],
    ["Dziękuję.", "Grazie."],
    ["Ile wynosi wspólnota?", "A quanto ammontano le spese condominiali?"],
    ["Czy mogę zobaczyć pod zlewem?", "Posso vedere sotto il lavello?"],
  ];
  const hit = from === "pl" ? pairs.find((p) => p[0].toLowerCase() === text.trim().toLowerCase()) : pairs.find((p) => p[1].toLowerCase() === text.trim().toLowerCase());
  if (hit) return from === "pl" ? hit[1] : hit[0];
  return text;
}

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId?: string; propertyId?: string; text: string; asRole?: "buyer" | "agent" }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    let conversationId = data.conversationId;
    if (!conversationId) {
      const existing = await sql<{ id: string }>`select id from conversations where user_id = ${context.userId} order by last_at desc limit 1`;
      if (existing[0]) conversationId = existing[0].id;
      else {
        conversationId = nid();
        const title = data.propertyId ? getProperty(data.propertyId)?.titleIt ?? "Chiara Moretti" : "Chiara Moretti";
        await sql`insert into conversations (id, user_id, property_id, title) values (${conversationId}, ${context.userId}, ${data.propertyId ?? null}, ${title})`;
      }
    }
    const owned = await sql`select id from conversations where id = ${conversationId} and user_id = ${context.userId}`;
    if (!owned.length) throw new Error("Unauthorized");
    const role = data.asRole === "agent" ? "agent" : "buyer";
    const from = role === "buyer" ? "pl" : "it";
    const to = from === "pl" ? "it" : "pl";
    const translated = await translateText(data.text, from, to);
    const id = nid();
    await sql`insert into messages (id, conversation_id, user_id, sender_role, body_original, body_translated, original_lang)
      values (${id}, ${conversationId}, ${context.userId}, ${role}, ${data.text}, ${translated}, ${from})`;
    await sql`update conversations set last_at = now() where id = ${conversationId}`;
    await log(context.userId, "message", role);
    return { id, conversationId, translated };
  });

export const getJourney = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ step_id: string; status: string; actor: string | null; note_pl: string | null; due_label: string | null }>`
      select step_id, status, actor, note_pl, due_label from journey_steps where user_id = ${context.userId}`;
    return rows;
  });

export const advanceJourney = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((stepId: string) => stepId)
  .handler(async ({ context, data: stepId }) => {
    const sql = await getSql();
    await sql`update journey_steps set status = ${"done"}, updated_at = now() where user_id = ${context.userId} and step_id = ${stepId}`;
    const idx = JOURNEY.findIndex((s) => s.id === stepId);
    const next = JOURNEY[idx + 1];
    if (next) {
      await sql`update journey_steps set status = ${"current"}, updated_at = now() where user_id = ${context.userId} and step_id = ${next.id} and status = ${"pending"}`;
    }
    return true;
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: string;
      title: string;
      kind: string;
      lang: string;
      translation_kind: string;
      locked: boolean;
      summary: string | null;
      property_id: string | null;
      created_at: string;
    }>`select id, title, kind, lang, translation_kind, locked, summary, property_id, created_at from documents where user_id = ${context.userId} order by created_at desc`;
  });

export const addDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; kind: string; summary?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = nid();
    await sql`insert into documents (id, user_id, title, kind, summary) values (${id}, ${context.userId}, ${data.title}, ${data.kind}, ${data.summary ?? null})`;
    await log(context.userId, "document_added", data.kind);
    return id;
  });

export const listVisits = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: string; property_id: string; scheduled_at: string; status: string; questions: string | null; summary_pl: string | null }>`
      select id, property_id, scheduled_at, status, questions, summary_pl from video_visits where user_id = ${context.userId} order by scheduled_at`;
  });

export const bookVisit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { propertyId: string; scheduledAt: string; questions: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = nid();
    await sql`insert into video_visits (id, user_id, property_id, scheduled_at, questions)
      values (${id}, ${context.userId}, ${data.propertyId}, ${data.scheduledAt}, ${data.questions})`;
    await sql`update journey_steps set status = ${"current"} where user_id = ${context.userId} and step_id = ${"video"}`;
    await log(context.userId, "video_visit", data.propertyId);
    return id;
  });

export const listTrips = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: string; date_label: string; meeting_point: string | null; property_ids: string }>`
      select id, date_label, meeting_point, property_ids from visit_trips where user_id = ${context.userId} order by created_at desc`;
  });

export const createTrip = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { dateLabel: string; propertyIds: string[]; meetingPoint: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = nid();
    await sql`insert into visit_trips (id, user_id, date_label, meeting_point, property_ids)
      values (${id}, ${context.userId}, ${data.dateLabel}, ${data.meetingPoint}, ${JSON.stringify(data.propertyIds)})`;
    await sql`update journey_steps set status = ${"current"} where user_id = ${context.userId} and step_id = ${"trip"}`;
    return id;
  });

export const listServices = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: string; kind: string; status: string; note: string | null; created_at: string }>`
      select id, kind, status, note, created_at from service_requests where user_id = ${context.userId} order by created_at desc`;
  });

export const requestService = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; note?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = nid();
    await sql`insert into service_requests (id, user_id, kind, note) values (${id}, ${context.userId}, ${data.kind}, ${data.note ?? null})`;
    await log(context.userId, "service", data.kind);
    return id;
  });

export const requestProposal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((propertyId: string) => propertyId)
  .handler(async ({ context, data: propertyId }) => {
    const sql = await getSql();
    await sql`update journey_steps set status = ${"current"} where user_id = ${context.userId} and step_id = ${"offer"}`;
    await log(context.userId, "proposal_requested", propertyId);
    const p = getProperty(propertyId);
    await sql`insert into documents (id, user_id, property_id, title, kind, lang, translation_kind, summary)
      values (${nid()}, ${context.userId}, ${propertyId}, ${`Proposta — ${p?.titleIt ?? propertyId}`}, ${"proposal"}, ${"it"}, ${"auto"}, ${"Szkic propozycji do zatwierdzenia przez agenta. Płatność poza aplikacją."})`;
    return true;
  });

export const listActivity = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: string; action: string; meta: string | null; created_at: Date | string }>`
      select id, action, meta, created_at from activity_log where user_id = ${context.userId} order by created_at desc limit 40`;
    return rows.map((r) => ({
      ...r,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at ?? ""),
    }));
  });

export const getDeskSnapshot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureSeeds();
    const sql = await getSql();
    const leads = await sql<{
      id: string;
      user_id: string | null;
      name: string;
      polish_city: string | null;
      purpose: string | null;
      budget_eur: number | null;
      setting: string | null;
      stage: string;
      last_touch: string | null;
      notes: string | null;
      is_seed: boolean;
    }>`select id, user_id, name, polish_city, purpose, budget_eur, setting, stage, last_touch, notes, is_seed from leads order by created_at desc`;
    const visits = await sql<{ id: string; user_id: string; property_id: string; scheduled_at: string; status: string }>`
      select id, user_id, property_id, scheduled_at, status from video_visits order by scheduled_at`;
    const convos = await sql<{ id: string; user_id: string; title: string | null; last_at: string }>`
      select id, user_id, title, last_at from conversations order by last_at desc`;
    return { agentId: context.userId, leads, visits, convos };
  });

export const updateLeadStage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; stage: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update leads set stage = ${data.stage}, last_touch = ${"dziś"} where id = ${data.id}`;
    return true;
  });

export const generateListingCopy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((propertyId: string) => propertyId)
  .handler(async ({ context, data: propertyId }) => {
    const p = getProperty(propertyId);
    if (!p) throw new Error("Not found");
    const apiKey = process.env.XAI_API_KEY;
    let facebook = `${p.titleIt} — ${p.city}, ${p.region}. ${p.priceEur.toLocaleString("it-IT")} €. ${p.descriptionIt}`;
    let instagram = `${p.city}, ${p.region}. ${p.sqm} mq, ${p.rooms} camere. Selezionata da ITALVIA.`;
    let titlePl = p.titlePl;
    let bodyPl = p.descriptionPl;
    if (apiKey) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "grok-4.5",
            max_tokens: 500,
            messages: [
              { role: "system", content: "Copywriter immobiliare ITALVIA. Tono elegante, onesto, niente rese garantite. Rispondi in JSON con chiavi titlePl, bodyPl, facebook, instagram." },
              { role: "user", content: JSON.stringify({ titleIt: p.titleIt, city: p.city, price: p.priceEur, descriptionIt: p.descriptionIt, warningsIt: p.warningsIt }) },
            ],
          }),
        });
        if (res.ok) {
          const body = (await res.json()) as { choices: { message: { content: string } }[] };
          const raw = body.choices[0]?.message.content ?? "";
          const jsonStart = raw.indexOf("{");
          const jsonEnd = raw.lastIndexOf("}");
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as Record<string, string>;
            titlePl = parsed.titlePl || titlePl;
            bodyPl = parsed.bodyPl || bodyPl;
            facebook = parsed.facebook || facebook;
            instagram = parsed.instagram || instagram;
          }
        }
      } catch {
        /* keep fallback */
      }
    }
    const sql = await getSql();
    await sql`insert into property_copy (property_id, title_pl, body_pl, facebook_it, instagram_it, approved)
      values (${propertyId}, ${titlePl}, ${bodyPl}, ${facebook}, ${instagram}, false)
      on conflict (property_id) do update set title_pl = excluded.title_pl, body_pl = excluded.body_pl, facebook_it = excluded.facebook_it, instagram_it = excluded.instagram_it, approved = false, updated_at = now()`;
    await log(context.userId, "copy_generated", propertyId);
    return { titlePl, bodyPl, facebook, instagram, approved: false };
  });

export const approveCopy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((propertyId: string) => propertyId)
  .handler(async ({ context, data: propertyId }) => {
    const sql = await getSql();
    await sql`update property_copy set approved = true, updated_at = now() where property_id = ${propertyId}`;
    await log(context.userId, "copy_approved", propertyId);
    return true;
  });

export const getCopy = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((propertyId: string) => propertyId)
  .handler(async ({ data: propertyId }) => {
    const sql = await getSql();
    const rows = await sql<{ title_pl: string | null; body_pl: string | null; facebook_it: string | null; instagram_it: string | null; approved: boolean }>`
      select title_pl, body_pl, facebook_it, instagram_it, approved from property_copy where property_id = ${propertyId} limit 1`;
    return rows[0] ?? null;
  });
