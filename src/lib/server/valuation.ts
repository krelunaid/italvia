import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getProperty } from "@/data/properties";
import { valueProperty, type Valuation } from "@/lib/valuation";
import { counterparty } from "@/data/sellers";

function bool(v: unknown) {
  return v === true || v === "t" || v === "true" || v === 1;
}

async function ensureTable() {
  const sql = await getSql();
  await sql.query(`create table if not exists property_valuations (
    property_id text primary key,
    show_to_buyer boolean not null default false,
    updated_at timestamptz not null default now()
  )`);
  await sql.query(`insert into property_valuations (property_id, show_to_buyer) values
    ('scalea', true),
    ('catania', true),
    ('ostuni', true),
    ('scanno', true),
    ('tropea', false),
    ('viareggio', false),
    ('sirmione', false),
    ('levanto', false)
  on conflict (property_id) do nothing`);
}

async function isAgent(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId} limit 1`;
  return rows[0]?.role === "agent";
}

export const getValuationFlags = createServerFn({ method: "GET" }).handler(async () => {
  await ensureTable();
  const sql = await getSql();
  const rows = await sql<{ property_id: string; show_to_buyer: boolean | string }>`
    select property_id, show_to_buyer from property_valuations`;
  return Object.fromEntries(rows.map((r) => [r.property_id, bool(r.show_to_buyer)])) as Record<string, boolean>;
});

export const getBuyerValuation = createServerFn({ method: "GET" })
  .validator((propertyId: string) => propertyId)
  .handler(async ({ data: propertyId }) => {
    await ensureTable();
    const p = getProperty(propertyId);
    if (!p) return null;
    const sql = await getSql();
    const rows = await sql<{ show_to_buyer: boolean | string }>`
      select show_to_buyer from property_valuations where property_id = ${propertyId} limit 1`;
    const show = rows[0] ? bool(rows[0].show_to_buyer) : false;
    if (!show) return { show: false as const, seller: counterparty(propertyId).seller };
    return {
      show: true as const,
      seller: counterparty(propertyId).seller,
      valuation: valueProperty(p),
    };
  });

export const getDeskValuation = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((propertyId: string) => propertyId)
  .handler(async ({ context, data: propertyId }) => {
    await ensureTable();
    if (!(await isAgent(context.userId))) throw new Error("Forbidden");
    const p = getProperty(propertyId);
    if (!p) return null;
    const sql = await getSql();
    const rows = await sql<{ show_to_buyer: boolean | string }>`
      select show_to_buyer from property_valuations where property_id = ${propertyId} limit 1`;
    const show = rows[0] ? bool(rows[0].show_to_buyer) : false;
    return {
      show,
      seller: counterparty(propertyId).seller,
      valuation: valueProperty(p) as Valuation,
    };
  });

export const setShowValuation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { propertyId: string; show: boolean }) => input)
  .handler(async ({ context, data }) => {
    await ensureTable();
    if (!(await isAgent(context.userId))) throw new Error("Forbidden");
    const sql = await getSql();
    await sql`insert into property_valuations (property_id, show_to_buyer, updated_at)
      values (${data.propertyId}, ${data.show}, now())
      on conflict (property_id) do update set show_to_buyer = excluded.show_to_buyer, updated_at = now()`;
    return { show: data.show };
  });
