export function FloorPlan({ rooms, sqm }: { rooms: number; sqm: number }) {
  return (
    <div className="rounded-lg border border-line bg-ivory p-4">
      <p className="mb-3 text-xs uppercase tracking-wider text-faint">
        Plan — {sqm} m² · {rooms} pokoje
      </p>
      <svg viewBox="0 0 320 200" className="w-full text-navy" aria-hidden="true">
        <rect x="4" y="4" width="312" height="192" fill="#fbf8f1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="8" width="170" height="120" fill="#f4efe6" stroke="currentColor" />
        <text x="93" y="72" textAnchor="middle" fontSize="11" fill="currentColor">
          Salon + kuchnia
        </text>
        <rect x="186" y="8" width="126" height="70" fill="#ebe4d6" stroke="currentColor" />
        <text x="249" y="48" textAnchor="middle" fontSize="11" fill="currentColor">
          Sypialnia
        </text>
        {rooms >= 2 ? (
          <>
            <rect x="186" y="86" width="126" height="42" fill="#ebe4d6" stroke="currentColor" />
            <text x="249" y="112" textAnchor="middle" fontSize="11" fill="currentColor">
              Pokój
            </text>
          </>
        ) : null}
        <rect x="8" y="136" width="90" height="56" fill="#e4ede5" stroke="currentColor" />
        <text x="53" y="168" textAnchor="middle" fontSize="11" fill="currentColor">
          Łazienka
        </text>
        <rect x="106" y="136" width="206" height="56" fill="#d9c4a8" stroke="currentColor" />
        <text x="209" y="168" textAnchor="middle" fontSize="11" fill="currentColor">
          Taras
        </text>
      </svg>
    </div>
  );
}
