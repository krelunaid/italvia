import { renderSVG } from "uqr";
import { epcPayload } from "@/lib/epc";

export function EpcQr({
  bic,
  name,
  iban,
  amountEur,
  causal,
}: {
  bic: string;
  name: string;
  iban: string;
  amountEur: number;
  causal: string;
}) {
  const payload = epcPayload({ bic, name, iban, amountEur, causal });
  const svg = renderSVG(payload, { whiteColor: "#FBF8F1", blackColor: "#1C2C4A", border: 2 });
  return (
    <div className="rounded-lg bg-paper p-3">
      <div className="mx-auto w-44" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className="mt-2 text-center text-[11px] leading-relaxed text-muted">
        QR EPC — otwórz aplikację banku w Polsce i zeskanuj. Kwota i causale są już w kodzie.
      </p>
    </div>
  );
}
