/** EPC QR payload (SCT) — Polish and Italian banks scan this. */
export function epcPayload(input: {
  bic: string;
  name: string;
  iban: string;
  amountEur: number;
  causal: string;
}) {
  const name = ascii(input.name).slice(0, 70);
  const iban = input.iban.replace(/\s/g, "").toUpperCase();
  const amount = `EUR${input.amountEur.toFixed(2)}`;
  const rem = ascii(input.causal).slice(0, 140);
  return ["BCD", "002", "1", "SCT", input.bic.replace(/\s/g, ""), name, iban, amount, "", rem].join("\n");
}

function ascii(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[—–]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ");
}
