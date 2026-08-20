const GATE = "italvia-gate";

export function rememberGate(as: "buyer" | "agent") {
  try {
    sessionStorage.setItem(GATE, as);
  } catch {
    /* private mode */
  }
}

export function readGate(): "buyer" | "agent" {
  try {
    return sessionStorage.getItem(GATE) === "agent" ? "agent" : "buyer";
  } catch {
    return "buyer";
  }
}
