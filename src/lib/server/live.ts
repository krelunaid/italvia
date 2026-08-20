import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getProperty } from "@/data/properties";
import { LIVE_PEOPLE, tourOf, propertyOptions } from "@/data/live-tour";

export type LiveAudience = "all" | "selected";
export type LiveStatus = "live" | "ended";

export type LivePeek = {
  id: string;
  propertyId: string;
  city: string;
  titlePl: string;
  titleIt: string;
  image: string;
  audience: LiveAudience;
  chatEnabled: boolean;
  spotId: string;
  watching: number;
  notified: number;
  startedAt: string;
  headlinePl: string;
  headlineIt: string;
};

export type LiveGuest = {
  guestKey: string;
  userId: string | null;
  displayName: string;
  city: string | null;
  status: "notified" | "watching" | "declined";
  isSimulated: boolean;
};

export type LiveWhisper = {
  id: string;
  guestKey: string;
  fromRole: "buyer" | "agent";
  body: string;
  createdAt: string;
};

export type LiveRoom = {
  peek: LivePeek;
  status: LiveStatus;
  isAgent: boolean;
  guestKey: string;
  guests: LiveGuest[];
  whispers: LiveWhisper[];
  forbidden: boolean;
};

export type LivePerson = {
  key: string;
  name: string;
  city: string | null;
  userId: string | null;
};

type SessionRow = {
  id: string;
  property_id: string;
  agent_id: string;
  mode: string;
  status: string;
  spot_id: string;
  chat_enabled: unknown;
  started_at: string;
  headline_pl: string | null;
  headline_it: string | null;
};

function nid() {
  return crypto.randomUUID();
}

function bool(v: unknown) {
  return v === true || v === "t" || v === "true" || v === 1;
}

function asAudience(v: unknown): LiveAudience {
  if (v === "one" || v === "selected") return "selected";
  return "all";
}

async function mapPeek(row: SessionRow): Promise<LivePeek | null> {
  const p = getProperty(row.property_id);
  if (!p) return null;
  const sql = await getSql();
  const counts = await sql<{ watching: number; notified: number }>`
    select
      coalesce(sum(case when status = 'watching' then 1 else 0 end), 0)::int as watching,
      coalesce(sum(case when status in ('watching','notified') then 1 else 0 end), 0)::int as notified
    from live_guests where session_id = ${row.id}`;
  const c = counts[0];
  return {
    id: row.id,
    propertyId: p.id,
    city: p.city,
    titlePl: p.titlePl,
    titleIt: p.titleIt,
    image: p.images[0] ?? "/homes/scalea.jpg",
    audience: asAudience(row.mode),
    chatEnabled: bool(row.chat_enabled),
    spotId: row.spot_id,
    watching: Number(c?.watching ?? 0),
    notified: Number(c?.notified ?? 0),
    startedAt: row.started_at,
    headlinePl: row.headline_pl ?? `Na żywo z tarasu · ${p.city}`,
    headlineIt: row.headline_it ?? `In diretta dal terrazzo · ${p.city}`,
  };
}

async function currentLive(): Promise<SessionRow | null> {
  const sql = await getSql();
  const rows = await sql<SessionRow>`
    select id, property_id, agent_id, mode, status, spot_id, chat_enabled, started_at, headline_pl, headline_it
    from live_sessions where status = 'live' order by started_at desc limit 1`;
  return rows[0] ?? null;
}

async function allContacts(): Promise<LivePerson[]> {
  const sql = await getSql();
  const leads = await sql<{ id: string; name: string; polish_city: string | null; user_id: string | null }>`
    select id, name, polish_city, user_id from leads order by created_at desc`;
  if (leads.length) {
    return leads.map((l) => ({ key: l.id, name: l.name, city: l.polish_city, userId: l.user_id }));
  }
  return LIVE_PEOPLE.map((p) => ({ key: p.key, name: p.name, city: p.city, userId: null }));
}

async function insertInvites(sessionId: string, audience: LiveAudience, guestKeys: string[], chatEnabled: boolean) {
  const sql = await getSql();
  const contacts = await allContacts();
  const chosen = audience === "all" ? contacts : contacts.filter((c) => guestKeys.includes(c.key));

  for (const [i, person] of chosen.entries()) {
    const watching = i < 2;
    await sql`insert into live_guests (id, session_id, guest_key, user_id, display_name, city, status, is_simulated, joined_at)
      values (
        ${nid()}, ${sessionId}, ${person.key}, ${person.userId}, ${person.name}, ${person.city},
        ${watching ? "watching" : "notified"}, ${!person.userId},
        ${watching ? new Date().toISOString() : null}
      )
      on conflict (session_id, guest_key) do nothing`;
  }

  if (audience === "all") {
    const buyers = await sql<{ user_id: string; display_name: string | null; polish_city: string | null }>`
      select user_id, display_name, polish_city from profiles where role = 'buyer' and onboarded = true`;
    for (const b of buyers) {
      const key = `user-${b.user_id}`;
      await sql`insert into live_guests (id, session_id, guest_key, user_id, display_name, city, status, is_simulated)
        values (${nid()}, ${sessionId}, ${key}, ${b.user_id}, ${b.display_name ?? "Kupujący"}, ${b.polish_city}, ${"notified"}, false)
        on conflict (session_id, guest_key) do nothing`;
    }
  }

  if (!chatEnabled || chosen.length === 0) return;
  const first = chosen[0]!;
  await sql`insert into live_whispers (id, session_id, guest_key, from_role, body)
    values (
      ${nid()}, ${sessionId}, ${first.key}, ${"buyer"},
      ${"Czy taras sąsiada wchodzi w cenę? Z ogłoszenia nie da się tego zrozumieć."}
    )`;
}

export const peekLive = createServerFn({ method: "GET" }).handler(async () => {
  const row = await currentLive();
  if (!row) return null;
  if (asAudience(row.mode) === "selected") return null;
  return mapPeek(row);
});

export const getMyLive = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const row = await currentLive();
    if (!row) return null;
    if (asAudience(row.mode) === "all") return mapPeek(row);
    if (row.agent_id === context.userId) return mapPeek(row);
    const sql = await getSql();
    const invited = await sql<{ guest_key: string }>`
      select guest_key from live_guests
      where session_id = ${row.id} and (user_id = ${context.userId} or guest_key = ${`user-${context.userId}`})
      limit 1`;
    if (!invited.length) return null;
    return mapPeek(row);
  });

export const listLivePeople = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const people = await allContacts();
    return { people, properties: propertyOptions() };
  });

export const startLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { propertyId: string; audience: LiveAudience; guestKeys: string[]; chatEnabled: boolean }) => input)
  .handler(async ({ context, data }) => {
    const p = getProperty(data.propertyId);
    if (!p) throw new Error("Immobile non in selezione");
    const audience = data.audience === "selected" ? "selected" : "all";
    if (audience === "selected" && data.guestKeys.length === 0) {
      throw new Error("Scegli almeno un contatto");
    }
    const tour = tourOf(p.id);
    const sql = await getSql();
    await sql`update live_sessions set status = ${"ended"}, ended_at = now() where status = ${"live"}`;
    const id = nid();
    const n = audience === "all" ? "tutti i contatti" : `${data.guestKeys.length} contatti`;
    const headlinePl =
      audience === "all"
        ? `Na żywo z tarasu · ${p.city} — zaproszenie do wszystkich`
        : `Na żywo z tarasu · ${p.city} — zaproszenie wybrane`;
    const headlineIt =
      audience === "all"
        ? `In diretta dal terrazzo · ${p.city} — invito a tutti`
        : `In diretta dal terrazzo · ${p.city} — invito a ${n}`;
    await sql`insert into live_sessions (id, property_id, agent_id, mode, status, spot_id, chat_enabled, headline_pl, headline_it)
      values (${id}, ${p.id}, ${context.userId}, ${audience}, ${"live"}, ${tour[0]!.id}, ${data.chatEnabled}, ${headlinePl}, ${headlineIt})`;
    await insertInvites(id, audience, data.guestKeys, data.chatEnabled);
    return { id };
  });

export const endLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((sessionId: string) => sessionId)
  .handler(async ({ data: sessionId }) => {
    const sql = await getSql();
    await sql`update live_sessions set status = ${"ended"}, ended_at = now() where id = ${sessionId}`;
    return true;
  });

export const setLiveSpot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string; spotId: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update live_sessions set spot_id = ${data.spotId} where id = ${data.sessionId} and status = ${"live"}`;
    return true;
  });

export const setLiveChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string; chatEnabled: boolean }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update live_sessions set chat_enabled = ${data.chatEnabled} where id = ${data.sessionId} and status = ${"live"}`;
    return true;
  });

export const joinLive = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((sessionId: string) => sessionId)
  .handler(async ({ context, data: sessionId }) => {
    const sql = await getSql();
    const session = await sql<{ id: string; mode: string; status: string; agent_id: string }>`
      select id, mode, status, agent_id from live_sessions where id = ${sessionId} limit 1`;
    const s = session[0];
    if (!s || s.status !== "live") return { ok: false as const, reason: "ended" as const };
    if (s.agent_id === context.userId) return { ok: true as const };

    const key = `user-${context.userId}`;
    const profile = await sql<{ display_name: string | null; polish_city: string | null; role: string }>`
      select display_name, polish_city, role from profiles where user_id = ${context.userId} limit 1`;
    const existing = await sql<{ guest_key: string }>`
      select guest_key from live_guests
      where session_id = ${sessionId} and (guest_key = ${key} or user_id = ${context.userId})
      limit 1`;

    const audience = asAudience(s.mode);
    if (audience === "selected" && !existing.length && profile[0]?.role !== "agent") {
      return { ok: false as const, reason: "private" as const };
    }

    const name = profile[0]?.display_name ?? "Gość";
    const city = profile[0]?.polish_city ?? null;
    if (existing.length) {
      await sql`update live_guests set status = ${"watching"}, joined_at = now(), user_id = ${context.userId}
        where session_id = ${sessionId} and guest_key = ${existing[0]!.guest_key}`;
    } else {
      await sql`insert into live_guests (id, session_id, guest_key, user_id, display_name, city, status, is_simulated, joined_at)
        values (${nid()}, ${sessionId}, ${key}, ${context.userId}, ${name}, ${city}, ${"watching"}, false, now())
        on conflict (session_id, guest_key) do update set status = ${"watching"}, joined_at = now(), user_id = ${context.userId}`;
    }
    return { ok: true as const };
  });

async function loadRoom(sessionId: string, userId: string, studio: boolean): Promise<LiveRoom | null> {
  const sql = await getSql();
  const rows = await sql<SessionRow>`
    select id, property_id, agent_id, mode, status, spot_id, chat_enabled, started_at, headline_pl, headline_it
    from live_sessions where id = ${sessionId} limit 1`;
  const row = rows[0];
  if (!row) return null;

  const profile = await sql<{ role: string }>`select role from profiles where user_id = ${userId} limit 1`;
  const roleAgent = profile[0]?.role === "agent";
  let isAgent = row.agent_id === userId || roleAgent;
  if (studio) isAgent = true;

  const myKey = `user-${userId}`;
  const guests = await sql<{
    guest_key: string;
    user_id: string | null;
    display_name: string;
    city: string | null;
    status: string;
    is_simulated: unknown;
  }>`select guest_key, user_id, display_name, city, status, is_simulated from live_guests where session_id = ${sessionId} order by notified_at`;

  const mappedGuests: LiveGuest[] = guests.map((g) => ({
    guestKey: g.guest_key,
    userId: g.user_id,
    displayName: g.display_name,
    city: g.city,
    status: g.status === "watching" ? "watching" : g.status === "declined" ? "declined" : "notified",
    isSimulated: bool(g.is_simulated),
  }));

  const mine = mappedGuests.find((g) => g.userId === userId || g.guestKey === myKey);
  const audience = asAudience(row.mode);
  const forbidden = audience === "selected" && !isAgent && !mine;

  let whispers: LiveWhisper[] = [];
  if (!forbidden) {
    const wsql = isAgent
      ? sql<{ id: string; guest_key: string; from_role: string; body: string; created_at: string }>`
          select id, guest_key, from_role, body, created_at from live_whispers
          where session_id = ${sessionId} order by created_at`
      : sql<{ id: string; guest_key: string; from_role: string; body: string; created_at: string }>`
          select id, guest_key, from_role, body, created_at from live_whispers
          where session_id = ${sessionId} and guest_key = ${mine?.guestKey ?? myKey} order by created_at`;
    const w = await wsql;
    whispers = w.map((m) => ({
      id: m.id,
      guestKey: m.guest_key,
      fromRole: m.from_role === "agent" ? "agent" : "buyer",
      body: m.body,
      createdAt: m.created_at,
    }));
  }

  const peek = await mapPeek(row);
  if (!peek) return null;

  return {
    peek,
    status: row.status === "ended" ? "ended" : "live",
    isAgent,
    guestKey: mine?.guestKey ?? myKey,
    guests: isAgent ? mappedGuests : [],
    whispers,
    forbidden,
  };
}

export const getLiveRoom = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string; studio?: boolean }) => input)
  .handler(async ({ context, data }) => loadRoom(data.sessionId, context.userId, Boolean(data.studio)));

export const getStudioLive = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const row = await currentLive();
    if (!row) return null;
    return loadRoom(row.id, context.userId, true);
  });

export const sendWhisper = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string; body: string; guestKey?: string }) => input)
  .handler(async ({ context, data }) => {
    const body = data.body.trim().slice(0, 500);
    if (!body) return { ok: false as const };
    const sql = await getSql();
    const session = await sql<{ id: string; agent_id: string; status: string; chat_enabled: unknown }>`
      select id, agent_id, status, chat_enabled from live_sessions where id = ${data.sessionId} limit 1`;
    const s = session[0];
    if (!s || s.status !== "live") return { ok: false as const };
    if (!bool(s.chat_enabled)) return { ok: false as const, reason: "chat_off" as const };
    const isAgent = s.agent_id === context.userId;
    const myKey = `user-${context.userId}`;
    let guestKey = data.guestKey ?? myKey;
    if (!isAgent) {
      const mine = await sql<{ guest_key: string }>`
        select guest_key from live_guests where session_id = ${data.sessionId} and (user_id = ${context.userId} or guest_key = ${myKey}) limit 1`;
      guestKey = mine[0]?.guest_key ?? myKey;
    }
    await sql`insert into live_whispers (id, session_id, guest_key, from_role, body)
      values (${nid()}, ${data.sessionId}, ${guestKey}, ${isAgent ? "agent" : "buyer"}, ${body})`;
    return { ok: true as const };
  });
