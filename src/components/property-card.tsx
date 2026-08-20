import { Link } from "@tanstack/react-router";
import type { Property } from "@/data/properties";
import { completedChecks } from "@/data/properties";
import { seasonOf } from "@/data/life";
import { estimatePurchase } from "@/lib/costs";
import { formatEur, formatPln, eurToPln } from "@/lib/money";
import { matchScore, remoteScore } from "@/lib/score";
import type { BuyerProfile } from "@/lib/score";
import { MapPin } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function PropertyCard({
  property,
  profile,
  featured = false,
}: {
  property: Property;
  profile?: BuyerProfile | null;
  featured?: boolean;
}) {
  const { lang, t, tx, locale } = useLang();
  const costs = estimatePurchase(property);
  const match = matchScore(profile, property);
  const docs = completedChecks(property);
  const remote = remoteScore(property);
  const season = seasonOf(property.id);
  const title = lang === "it" ? property.titleIt : property.titlePl;

  return (
    <Link
      to="/homes/$id"
      params={{ id: property.id }}
      className="group block overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-card)]"
    >
      <div className={featured ? "relative aspect-[3/2] overflow-hidden" : "relative aspect-[4/3] overflow-hidden"}>
        <img
          src={property.images[0]}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-navy/70 to-transparent" />
        {season ? (
          <p className="absolute top-3 left-3 rounded-full bg-navy/75 px-2.5 py-1 text-[10px] tracking-[0.14em] text-paper uppercase">
            {season.winterLives ? tx("Żyje zimą", "Vive d’inverno") : tx("Sezonowy", "Stagionale")}
          </p>
        ) : null}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <p className="font-display text-xl font-semibold text-paper">{formatEur(property.priceEur, false, locale)}</p>
          <p className="text-xs text-paper/80">
            {tx("ok.", "circa")} {formatPln(eurToPln(property.priceEur))}
          </p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-navy">{title}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" />
            {property.city}, {property.region}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
          <Meta k={t("match")} v={`${match}%`} />
          <Meta k={t("docs")} v={`${docs}/10`} />
          <Meta k={tx("Koszt całk.", "Costo tot.")} v={formatEur(costs.totalMid, false, locale)} />
        </div>
        <p className="text-xs text-faint">
          {t("remote")} {remote}/100
        </p>
      </div>
    </Link>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-faint">{k}</p>
      <p className="font-medium tabular-nums text-navy">{v}</p>
    </div>
  );
}
