import { completedChecks, type Property } from "@/data/properties";
import { useLang } from "@/lib/i18n";

export function DossierSeal({ property }: { property: Property }) {
  const { tx } = useLang();
  const done = completedChecks(property);
  return (
    <div className="mb-5 flex items-start gap-4 rounded-xl border border-line bg-paper p-4">
      <svg viewBox="0 0 72 72" className="size-16 shrink-0" aria-hidden>
        <circle cx="36" cy="36" r="34" fill="#1C2C4A" />
        <circle cx="36" cy="36" r="28" fill="none" stroke="#C45C3E" strokeWidth="2" />
        <text x="36" y="32" textAnchor="middle" fill="#FBF8F1" fontFamily="Georgia, serif" fontSize="11">
          ITALVIA
        </text>
        <text x="36" y="48" textAnchor="middle" fill="#D9C4A8" fontFamily="Georgia, serif" fontSize="10">
          {done}/10
        </text>
      </svg>
      <div>
        <p className="font-display text-2xl text-navy">
          {done} {tx("z 10 kontroli", "su 10 verifiche")}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {tx(
            "Zielone tylko po potwierdzeniu przez człowieka: agent, geometra, notariusz albo adwokat. Pieczęć nie zastępuje aktu. Notariusza wybierasz Ty.",
            "Verde solo dopo conferma umana: agente, geometra, notaio o avvocato. Il sigillo non sostituisce l’atto. Il notaio lo scegli tu.",
          )}
        </p>
      </div>
    </div>
  );
}
