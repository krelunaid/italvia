/** Short names people actually type instead of a full e-mail. */
const AGENT_ALIASES = new Set([
  "italva",
  "italvia",
  "italvia@italvia.test",
  "agente",
  "chiara",
  "marek.kowalski@italvia.test",
]);

export const AGENT_EMAIL = "italvia@italvia.test";
export const AGENT_PASSWORD = "agente2026";

export function resolveLoginEmail(raw: string) {
  const v = raw.trim().toLowerCase();
  if (!v) return v;
  if (AGENT_ALIASES.has(v)) return AGENT_EMAIL;
  if (!v.includes("@")) return `${v.replace(/\s+/g, "")}@italvia.test`;
  return v;
}
