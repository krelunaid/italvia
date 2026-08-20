import { chromium } from "playwright";

const email = `marek.${Date.now()}@italvia.test`;
const shots = "/workspace/screenshots";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(25000);
page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.error("CONSOLE", m.text());
});

try {
  await page.goto("http://127.0.0.1:8080/homes/scalea", { waitUntil: "networkidle" });
  await page.evaluate(() => document.getElementById("trattativa")?.scrollIntoView());
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${shots}/trattativa-property.png` });

  await page.goto("http://127.0.0.1:8080/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Nie mam konta/ }).click();
  await page.getByPlaceholder("Imię").fill("Marek Kowalski");
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder(/Hasło/).fill("italvia-demo-1");
  await page.getByRole("button", { name: "Utwórz konto" }).click();
  await page.waitForURL("**/onboarding", { timeout: 20000 });

  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Wakacje" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Pokaż domy" }).click();
  await page.waitForURL("**/home", { timeout: 20000 });

  await page.goto("http://127.0.0.1:8080/homes/scalea/offer", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shots}/offer-composer-step0.png` });
  await page.getByRole("button", { name: "Warunki" }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Podsumowanie" }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${shots}/offer-composer.png`, fullPage: true });
  await page.getByRole("button", { name: "Wyślij do agenta" }).click();
  await page.waitForURL(/offers\//, { timeout: 20000 });
  await page.screenshot({ path: `${shots}/offer-sent.png`, fullPage: true });

  await page.goto("http://127.0.0.1:8080/desk/offers", { waitUntil: "networkidle" });
  await page.getByRole("link").filter({ hasText: "Scalea" }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Prepara proposta ufficiale" }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/offer-desk.png`, fullPage: true });

  const offerUrl = page.url();
  const id = offerUrl.split("/").pop();
  await page.goto(`http://127.0.0.1:8080/offers/${id}`, { waitUntil: "networkidle" });
  await page.getByText("Mam paszport albo dowód").click();
  await page.getByRole("button", { name: "Rozpocznij identyfikację wideo" }).click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${shots}/offer-eidas.png`, fullPage: true });
  for (const box of await page.locator("form input[type=\"checkbox\"]").all()) {
    await box.check();
  }
  await page.getByPlaceholder("Marek Kowalski").fill("Marek Kowalski");
  await page.getByPlaceholder("np. architekt").fill("architekt");
  await page.getByPlaceholder("ul. Długa 1, Warszawa").fill("ul. Długa 1, Warszawa");
  await page.getByPlaceholder("PESEL albo CF").fill("44051401359");
  await page.getByPlaceholder("np. oszczędności").fill("oszczędności z wynagrodzenia i sprzedaż mieszkania w Krakowie");
  await page.getByPlaceholder("PL...").fill("PL61109010140000071219812874");
  await page.getByRole("button", { name: /Podpisz/ }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${shots}/offer-signed.png`, fullPage: true });

  await page.goto(`http://127.0.0.1:8080/desk/offers/${id}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Il venditore accetta" }).click();
  await page.waitForTimeout(600);

  await page.goto(`http://127.0.0.1:8080/offers/${id}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shots}/offer-sepa.png`, fullPage: true });

  await page.getByPlaceholder("np. 12345678901").fill("CRO99887766");
  await page.getByRole("button", { name: "Zgłoś przelew" }).click();
  await page.waitForTimeout(500);

  await page.goto(`http://127.0.0.1:8080/desk/offers/${id}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Conferma caparra ricevuta (notaio)" }).click();
  await page.waitForTimeout(600);

  await page.goto(`http://127.0.0.1:8080/offers/${id}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shots}/offer-contract.png`, fullPage: true });

  console.log("offer flow ok", id);
} catch (err) {
  await page.screenshot({ path: `${shots}/qa-fail.png`, fullPage: true });
  console.error("FAIL at", page.url());
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
