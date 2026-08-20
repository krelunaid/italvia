import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(20000);

const email = `marek.${Date.now()}@italvia.test`;
const shots = "/workspace/screenshots";

try {
  await page.goto("http://127.0.0.1:8080/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Nie mam konta/ }).click();
  await page.getByPlaceholder("Imię").fill("Marek");
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder(/Hasło/).fill("italvia-demo-1");
  await page.getByRole("button", { name: "Utwórz konto" }).click();
  await page.waitForURL("**/onboarding", { timeout: 15000 });
  await page.screenshot({ path: `${shots}/onboarding.png`, fullPage: true });

  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Wakacje" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Dalej" }).click();
  await page.getByRole("button", { name: "Pokaż domy" }).click();
  await page.waitForURL("**/home", { timeout: 15000 });
  await page.screenshot({ path: `${shots}/home-signedin.png` });

  await page.goto("http://127.0.0.1:8080/homes/scalea", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Dossier" }).click();
  await page.screenshot({ path: `${shots}/dossier.png` });
  await page.getByRole("button", { name: "Koszt" }).click();
  await page.screenshot({ path: `${shots}/cost.png` });

  await page.goto("http://127.0.0.1:8080/desk", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shots}/desk.png` });

  await page.goto("http://127.0.0.1:8080/journey", { waitUntil: "networkidle" });
  await page.screenshot({ path: `${shots}/journey.png` });

  console.log(JSON.stringify({ ok: true, email, url: page.url() }));
} catch (err) {
  await page.screenshot({ path: `${shots}/qa-fail.png` });
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
