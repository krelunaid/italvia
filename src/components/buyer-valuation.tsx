import { useQuery } from "@tanstack/react-query";
import { getBuyerValuation } from "@/lib/server/valuation";
import { ValuationCard } from "@/components/valuation-card";
import { formatEur } from "@/lib/money";
import { useLang } from "@/lib/i18n";

export function BuyerValuation({ propertyId, variant }: { propertyId: string; variant: "peek" | "full" }) {
  const { tx, locale } = useLang();
  const q = useQuery({
    queryKey: ["buyer-val", propertyId],
    queryFn: () => getBuyerValuation({ data: propertyId }),
  });
  if (!q.data?.show || !q.data.valuation) return null;
  const v = q.data.valuation;
  if (variant === "full") {
    return <ValuationCard valuation={v} seller={q.data.seller} audience="buyer" />;
  }
  const label =
    v.stance === "below"
      ? tx("Poniżej wyceny ITALVIA", "Sotto la stima ITALVIA")
      : v.stance === "above"
        ? tx("Powyżej wyceny ITALVIA", "Sopra la stima ITALVIA")
        : tx("W widełkach wyceny ITALVIA", "In linea con la stima ITALVIA");
  return (
    <p className="mt-2 text-sm text-navy">
      {label}
      <span className="text-muted">
        {" "}
        · {formatEur(v.low, false, locale)}–{formatEur(v.high, false, locale)}
      </span>
    </p>
  );
}
