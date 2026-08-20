import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getProperty } from "@/data/properties";
import { JOURNEY } from "@/data/journey";

export type Offer = {
  id: string;
  userId: string;
  propertyId: string;
  kind: "informal" | "official";
  status: string;
  askingEur: number;
  offerEur: number;
  depositEur: number;
  depositKind: "caparra" | "acconto" | "escrow";
  validUntil: string;
  deedBy: string | null;
  financing: "cash" | "mortgage";
  furniture: boolean;
  conditions: string;
  notesPl: string | null;
  counterEur: number | null;
  agentNoteIt: string | null;
  understood: boolean;
  signedName: string | null;
  signedAt: string | null;
  acceptedAt: string | null;
  paymentStatus: string;
  paymentRef: string | null;
  paymentDate: string | null;
  paymentVerifiedAt: string | null;
  registerDue: string | null;
  createdAt: string;
  buyerName?: string;
  acceptDeadline: string | null;
  officialRequested: boolean;
  mortgageEur: number | null;
  amlProfession: string | null;
  amlCf: string | null;
  amlFundsOrigin: string | null;
  amlOriginIban: string | null;
  amlResidence: string | null;
  secondAccontoEur: number | null;
  secondAccontoStatus: string;
  secondAccontoRef: string | null;
  secondAccontoDate: string | null;
  balanceStatus: string;
  balanceRef: string | null;
  requestedDepositEur: number | null;
  requestedDeedBy: string | null;
  signatureHash: string | null;
  identityOk: boolean;
};

function nid() {
  return crypto.randomUUID();
}

async function fingerprint(parts: Array<string | number | null | undefined>) {
  const raw = parts.map((p) => String(p ?? "")).join("|");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16)
    .toUpperCase();
}

function num(v: unknown) {
  if (v == null || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function bool(v: unknown) {
  return v === true || v === "t" || v === "true" || v === 1;
}

function ts(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

type Row = Record<string, unknown>;

function mapOffer(row: Row): Offer {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    propertyId: String(row.property_id),
    kind: row.kind === "official" ? "official" : "informal",
    status: String(row.status),
    askingEur: num(row.asking_eur),
    offerEur: num(row.offer_eur),
    depositEur: num(row.deposit_eur),
    depositKind: row.deposit_kind === "acconto" ? "acconto" : row.deposit_kind === "escrow" ? "escrow" : "caparra",
    validUntil: String(row.valid_until).slice(0, 10),
    deedBy: row.deed_by ? String(row.deed_by).slice(0, 10) : null,
    financing: row.financing === "mortgage" ? "mortgage" : "cash",
    furniture: bool(row.furniture),
    conditions: String(row.conditions ?? ""),
    notesPl: (row.notes_pl as string) ?? null,
    counterEur: row.counter_eur == null ? null : num(row.counter_eur),
    agentNoteIt: (row.agent_note_it as string) ?? null,
    understood: bool(row.understood),
    signedName: (row.signed_name as string) ?? null,
    signedAt: ts(row.signed_at),
    acceptedAt: ts(row.accepted_at),
    paymentStatus: String(row.payment_status ?? "none"),
    paymentRef: (row.payment_ref as string) ?? null,
    paymentDate: (row.payment_date as string) ?? null,
    paymentVerifiedAt: ts(row.payment_verified_at),
    registerDue: row.register_due ? String(row.register_due).slice(0, 10) : null,
    createdAt: ts(row.created_at) ?? "",
    buyerName: (row.buyer_name as string) ?? undefined,
    acceptDeadline: ts(row.accept_deadline),
    officialRequested: bool(row.official_requested),
    mortgageEur: row.mortgage_eur == null || row.mortgage_eur === "" ? null : num(row.mortgage_eur),
    amlProfession: (row.aml_profession as string) ?? null,
    amlCf: (row.aml_cf as string) ?? null,
    amlFundsOrigin: (row.aml_funds_origin as string) ?? null,
    amlOriginIban: (row.aml_origin_iban as string) ?? null,
    amlResidence: (row.aml_residence as string) ?? null,
    secondAccontoEur: row.second_acconto_eur == null || row.second_acconto_eur === "" ? null : num(row.second_acconto_eur),
    secondAccontoStatus: String(row.second_acconto_status ?? "none"),
    secondAccontoRef: (row.second_acconto_ref as string) ?? null,
    secondAccontoDate: (row.second_acconto_date as string) ?? null,
    balanceStatus: String(row.balance_status ?? "none"),
    balanceRef: (row.balance_ref as string) ?? null,
    requestedDepositEur:
      row.requested_deposit_eur == null || row.requested_deposit_eur === "" ? null : num(row.requested_deposit_eur),
    requestedDeedBy: row.requested_deed_by ? String(row.requested_deed_by).slice(0, 10) : null,
    signatureHash: (row.signature_hash as string) ?? null,
    identityOk: bool(row.identity_ok),
  };
}

async function expireStale(id?: string) {
  const sql = await getSql();
  if (id) {
    await sql`update offers set status = ${"expired"}, updated_at = now()
      where id = ${id} and status = ${"signed"} and accept_deadline is not null and accept_deadline < now()`;
  } else {
    await sql`update offers set status = ${"expired"}, updated_at = now()
      where status = ${"signed"} and accept_deadline is not null and accept_deadline < now()`;
  }
}

async function markJourney(userId: string, stepId: string, status: "current" | "done") {
  const sql = await getSql();
  await sql`update journey_steps set status = ${status}, updated_at = now()
    where user_id = ${userId} and step_id = ${stepId}`;
  if (status === "done") {
    const idx = JOURNEY.findIndex((s) => s.id === stepId);
    const next = JOURNEY[idx + 1];
    if (next) {
      await sql`update journey_steps set status = ${"current"}, updated_at = now()
        where user_id = ${userId} and step_id = ${next.id} and status = ${"pending"}`;
    }
  }
}

async function log(userId: string, action: string, meta?: string) {
  const sql = await getSql();
  await sql`insert into activity_log (id, user_id, action, meta) values (${nid()}, ${userId}, ${action}, ${meta ?? null})`;
}

export const listMyOffers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await expireStale();
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where user_id = ${context.userId} order by created_at desc`;
    return rows.map(mapOffer);
  });

export const getMyOffer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    await expireStale(id);
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where id = ${id} and user_id = ${context.userId} limit 1`;
    return rows[0] ? mapOffer(rows[0]) : null;
  });

export const createInformalOffer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      propertyId: string;
      offerEur: number;
      depositEur: number;
      depositKind: "caparra" | "acconto" | "escrow";
      validUntil: string;
      deedBy: string;
      financing: "cash" | "mortgage";
      furniture: boolean;
      conditions: string[];
      notesPl?: string;
      mortgageEur?: number;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const p = getProperty(data.propertyId);
    if (!p) throw new Error("Not found");
    if (data.offerEur < 10000 || data.depositEur < 1000) throw new Error("Kwoty poza zakresem.");
    const sql = await getSql();
    const open = await sql<Row>`select id from offers
      where user_id = ${context.userId} and property_id = ${data.propertyId}
        and status not in (${"withdrawn"}, ${"declined"}, ${"refused"}, ${"expired"})
      limit 1`;
    if (open[0]) throw new Error("Masz już otwartą trattativę na ten dom.");
    const id = nid();
    const mort = data.financing === "mortgage" && data.mortgageEur ? Math.round(data.mortgageEur) : null;
    await sql`insert into offers (
      id, user_id, property_id, kind, status, asking_eur, offer_eur, deposit_eur, deposit_kind,
      valid_until, deed_by, financing, furniture, conditions, notes_pl, mortgage_eur
    ) values (
      ${id}, ${context.userId}, ${data.propertyId}, ${"informal"}, ${"sent"}, ${p.priceEur}, ${Math.round(data.offerEur)},
      ${Math.round(data.depositEur)}, ${data.depositKind}, ${data.validUntil}, ${data.deedBy}, ${data.financing},
      ${data.furniture}, ${data.conditions.join(",")}, ${data.notesPl?.trim() || null}, ${mort}
    )`;
    await markJourney(context.userId, "offer", "current");
    await sql`update leads set stage = ${"offer"}, last_touch = ${"teraz"}, notes = ${"Oferta nieformalna wysłana."}
      where user_id = ${context.userId}`;
    await log(context.userId, "offer_informal", data.propertyId);
    return { id };
  });

export const withdrawOffer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`update offers set status = ${"withdrawn"}, updated_at = now()
      where id = ${id} and user_id = ${context.userId} and status in (${"sent"}, ${"countered"})`;
    return true;
  });

export const acceptCounter = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where id = ${id} and user_id = ${context.userId} limit 1`;
    if (!rows[0] || String(rows[0].status) !== "countered") throw new Error("Brak kontrofert.");
    const counter = num(rows[0].counter_eur);
    await sql`update offers set offer_eur = ${counter}, status = ${"sent"}, updated_at = now()
      where id = ${id} and user_id = ${context.userId}`;
    await log(context.userId, "offer_accept_counter", id);
    return true;
  });

export const requestOfficial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where id = ${id} and user_id = ${context.userId} limit 1`;
    if (!rows[0]) throw new Error("Not found");
    const status = String(rows[0].status);
    if (String(rows[0].kind) !== "informal" || !["sent", "countered"].includes(status)) {
      throw new Error("Najpierw uzgodnij cenę nieformalnie.");
    }
    await sql`update offers set official_requested = true, updated_at = now()
      where id = ${id} and user_id = ${context.userId}`;
    await log(context.userId, "offer_request_official", id);
    return true;
  });

export const signOfficial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id: string;
      fullName: string;
      readPl: boolean;
      binding: boolean;
      caparra: boolean;
      profession: string;
      residence: string;
      fundsOrigin: string;
      originIban: string;
      codiceFiscale?: string;
      identityOk: boolean;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    if (!data.identityOk) throw new Error("Najpierw identyfikacja dokumentem i wideo.");
    if (!data.readPl || !data.binding || !data.caparra) throw new Error("Potwierdzenia niepełne.");
    const name = data.fullName.trim();
    if (name.length < 4) throw new Error("Podaj imię i nazwisko.");
    if (data.profession.trim().length < 2) throw new Error("Podaj zawód.");
    if (data.residence.trim().length < 6) throw new Error("Podaj adres zamieszkania.");
    if (data.fundsOrigin.trim().length < 8) throw new Error("Opisz pochodzenie środków.");
    const iban = data.originIban.replace(/\s/g, "").toUpperCase();
    if (iban.length < 12) throw new Error("Podaj IBAN rachunku, z którego wyjdzie caparra.");
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where id = ${data.id} and user_id = ${context.userId} limit 1`;
    if (!rows[0] || String(rows[0].kind) !== "official" || String(rows[0].status) !== "ready") {
      throw new Error("Dokument nie jest gotowy do podpisu.");
    }
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 72);
    const cf = data.codiceFiscale?.trim() || null;
    const hash = await fingerprint([
      String(rows[0].id),
      String(rows[0].property_id),
      num(rows[0].offer_eur),
      num(rows[0].deposit_eur),
      String(rows[0].deposit_kind),
      String(rows[0].valid_until),
      String(rows[0].deed_by ?? ""),
      String(rows[0].conditions ?? ""),
      name,
    ]);
    await sql`update offers set
      understood = true, signed_name = ${name}, signed_at = now(), status = ${"signed"},
      accept_deadline = ${deadline.toISOString()},
      aml_profession = ${data.profession.trim()},
      aml_cf = ${cf},
      aml_funds_origin = ${data.fundsOrigin.trim()},
      aml_origin_iban = ${iban},
      aml_residence = ${data.residence.trim()},
      identity_ok = true,
      signature_hash = ${hash},
      updated_at = now()
      where id = ${data.id} and user_id = ${context.userId}`;
    await sql`insert into documents (id, user_id, property_id, title, kind, lang, translation_kind, locked, summary)
      values (${nid()}, ${context.userId}, ${String(rows[0].property_id)}, ${"Proposta ufficiale — podpisana"}, ${"proposal"},
        ${"it"}, ${"professional"}, true, ${"Wersja włoska z wartością umowną. Tłumaczenie polskie w aplikacji."})`;
    await log(context.userId, "offer_signed", data.id);
    return true;
  });

export const acceptTerms = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where id = ${id} and user_id = ${context.userId} limit 1`;
    if (!rows[0]) throw new Error("Not found");
    const o = mapOffer(rows[0]);
    if (!["sent", "countered"].includes(o.status)) throw new Error("Nie można teraz zmienić warunków.");
    if (!o.requestedDepositEur && !o.requestedDeedBy) throw new Error("Brak prośby agenta.");
    const dep = o.requestedDepositEur ?? o.depositEur;
    const deed = o.requestedDeedBy ?? o.deedBy;
    await sql`update offers set
      deposit_eur = ${dep}, deed_by = ${deed},
      requested_deposit_eur = null, requested_deed_by = null, updated_at = now()
      where id = ${id} and user_id = ${context.userId}`;
    await log(context.userId, "offer_accept_terms", id);
    return true;
  });

export const reportSepa = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; paymentRef: string; paymentDate: string; kind?: "caparra" | "acconto2" | "balance" }) => input)
  .handler(async ({ context, data }) => {
    const ref = data.paymentRef.trim();
    if (ref.length < 4) throw new Error("Podaj referencję bonifico.");
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where id = ${data.id} and user_id = ${context.userId} limit 1`;
    if (!rows[0]) throw new Error("Not found");
    const kind = data.kind ?? "caparra";
    if (kind === "acconto2") {
      await sql`update offers set
        second_acconto_status = ${"receipt"}, second_acconto_ref = ${ref}, second_acconto_date = ${data.paymentDate},
        updated_at = now()
        where id = ${data.id} and user_id = ${context.userId} and second_acconto_status = ${"instructed"}`;
    } else if (kind === "balance") {
      await sql`update offers set
        balance_status = ${"receipt"}, balance_ref = ${ref}, updated_at = now()
        where id = ${data.id} and user_id = ${context.userId} and balance_status = ${"instructed"}`;
    } else {
      await sql`update offers set
        payment_status = ${"receipt_uploaded"}, payment_ref = ${ref}, payment_date = ${data.paymentDate},
        status = ${"receipt_uploaded"}, updated_at = now()
        where id = ${data.id} and user_id = ${context.userId} and status in (${"deposit_pending"}, ${"accepted"})`;
    }
    await log(context.userId, `sepa_${kind}`, data.id);
    return true;
  });

export const listDeskOffers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    await expireStale();
    const sql = await getSql();
    const rows = await sql<Row>`
      select o.*, p.display_name as buyer_name
      from offers o
      left join profiles p on p.user_id = o.user_id
      order by o.created_at desc`;
    return rows.map(mapOffer);
  });

export const getDeskOffer = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await expireStale(id);
    const sql = await getSql();
    const rows = await sql<Row>`
      select o.*, p.display_name as buyer_name
      from offers o
      left join profiles p on p.user_id = o.user_id
      where o.id = ${id} limit 1`;
    return rows[0] ? mapOffer(rows[0]) : null;
  });

export const agentRespond = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      id: string;
      action:
        | "counter"
        | "decline"
        | "prepare"
        | "accept_seller"
        | "verify_payment"
        | "refuse"
        | "instruct_acconto"
        | "confirm_acconto"
        | "confirm_balance"
        | "ask_deposit"
        | "ask_deed";
      counterEur?: number;
      noteIt?: string;
      deedBy?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Row>`select * from offers where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("Not found");
    const o = mapOffer(rows[0]);
    const note = data.noteIt?.trim() || null;

    if (data.action === "counter") {
      const c = Math.round(data.counterEur ?? 0);
      if (c < 10000) throw new Error("Controfferta troppo bassa.");
      await sql`update offers set status = ${"countered"}, counter_eur = ${c}, agent_note_it = ${note}, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "decline" || data.action === "refuse") {
      await sql`update offers set status = ${data.action === "refuse" ? "refused" : "declined"}, agent_note_it = ${note}, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "prepare") {
      if (o.kind !== "informal" || !["sent", "countered"].includes(o.status)) {
        throw new Error("Prepara solo da offerta informale aperta.");
      }
      await sql`update offers set kind = ${"official"}, status = ${"ready"}, official_requested = true, agent_note_it = ${note}, updated_at = now() where id = ${data.id}`;
      await sql`insert into documents (id, user_id, property_id, title, kind, lang, translation_kind, locked, summary)
        values (${nid()}, ${o.userId}, ${o.propertyId}, ${"Proposta ufficiale — bozza"}, ${"proposal"}, ${"it"}, ${"professional"}, false,
          ${"Do podpisu kwalifikowanego. Wersja włoska ma wartość umowną."})`;
    } else if (data.action === "accept_seller") {
      if (o.status !== "signed") throw new Error("Il compratore non ha ancora firmato.");
      if (o.acceptDeadline && new Date(o.acceptDeadline) < new Date()) {
        await sql`update offers set status = ${"expired"}, updated_at = now() where id = ${data.id}`;
        throw new Error("Finestra di 72 ore scaduta.");
      }
      const due = new Date();
      due.setDate(due.getDate() + 30);
      const dueStr = due.toISOString().slice(0, 10);
      await sql`update offers set
        status = ${"deposit_pending"}, accepted_at = now(), register_due = ${dueStr},
        payment_status = ${"instructed"}, agent_note_it = ${note}, updated_at = now()
        where id = ${data.id}`;
      await markJourney(o.userId, "offer", "done");
      await markJourney(o.userId, "prelim", "current");
    } else if (data.action === "ask_deposit") {
      const c = Math.round(data.counterEur ?? 0);
      if (c < 1000) throw new Error("Caparra troppo bassa.");
      await sql`update offers set requested_deposit_eur = ${c}, agent_note_it = ${note}, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "ask_deed") {
      const d = (data.deedBy ?? "").slice(0, 10);
      if (d.length < 10) throw new Error("Data rogito mancante.");
      await sql`update offers set requested_deed_by = ${d}, agent_note_it = ${note}, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "verify_payment") {
      await sql`update offers set
        status = ${"under_contract"}, payment_status = ${"verified"}, payment_verified_at = now(),
        balance_status = ${"instructed"}, updated_at = now()
        where id = ${data.id}`;
      await sql`update leads set stage = ${"prelim"}, last_touch = ${"dziś"}, notes = ${"Sotto contratto. Caparra verificata."}
        where user_id = ${o.userId}`;
    } else if (data.action === "instruct_acconto") {
      const c = Math.round(data.counterEur ?? 0);
      if (c < 1000) throw new Error("Acconto troppo basso.");
      if (o.status !== "under_contract") throw new Error("Solo dopo sotto contratto.");
      await sql`update offers set second_acconto_eur = ${c}, second_acconto_status = ${"instructed"},
        agent_note_it = ${note}, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "confirm_acconto") {
      await sql`update offers set second_acconto_status = ${"verified"}, updated_at = now() where id = ${data.id}`;
    } else if (data.action === "confirm_balance") {
      await sql`update offers set balance_status = ${"verified"}, updated_at = now() where id = ${data.id}`;
    }
    await log(context.userId, `agent_${data.action}`, data.id);
    return true;
  });
