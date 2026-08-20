export const COUNTERPARTIES: Record<
  string,
  { seller: string; notary: string; iban: string; bic: string; bank: string }
> = {
  scalea: {
    seller: "Maria Ferraro",
    notary: "Notaio Greco — conto dedicato proposta",
    iban: "IT60X0100503378000000123456",
    bic: "BNLIITRR",
    bank: "Banca Nazionale del Lavoro",
  },
  tropea: {
    seller: "Famiglia Coppola",
    notary: "Notaio Greco — conto dedicato proposta",
    iban: "IT60X0100503378000000123456",
    bic: "BNLIITRR",
    bank: "Banca Nazionale del Lavoro",
  },
  sirmione: {
    seller: "Elena Bianchi",
    notary: "Notaio Bianchi — conto dedicato",
    iban: "IT02L0569601601000000789012",
    bic: "POSOIT22",
    bank: "Banco BPM",
  },
  ostuni: {
    seller: "Nicola Greco",
    notary: "Notaio Greco — conto dedicato proposta",
    iban: "IT60X0100503378000000123456",
    bic: "BNLIITRR",
    bank: "Banca Nazionale del Lavoro",
  },
  levanto: {
    seller: "Paolo Viale",
    notary: "Notaio Fieschi — conto dedicato",
    iban: "IT15U0306909606100001234987",
    bic: "BCITITMM",
    bank: "Intesa Sanpaolo",
  },
  scanno: {
    seller: "Rosa D’Angelo",
    notary: "Notaio Di Carlo — conto dedicato",
    iban: "IT88W0538703600000002456781",
    bic: "BPALIT3P",
    bank: "BPER Banca",
  },
  catania: {
    seller: "Salvatore Arena",
    notary: "Notaio Arena — conto dedicato",
    iban: "IT09C0200804621000102345678",
    bic: "UNCRITMM",
    bank: "UniCredit",
  },
  viareggio: {
    seller: "Giulia Puccini",
    notary: "Notaio Puccini — conto dedicato",
    iban: "IT15U0306909606100001234987",
    bic: "BCITITMM",
    bank: "Intesa Sanpaolo",
  },
};

export function counterparty(propertyId: string) {
  return (
    COUNTERPARTIES[propertyId] ?? {
      seller: "Proprietario",
      notary: "Notaio — conto dedicato proposta",
      iban: "IT60X0100503378000000123456",
      bic: "BNLIITRR",
      bank: "Banca Nazionale del Lavoro",
    }
  );
}
