import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
async function shot(url, path, w, h, extra) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  if (extra) await extra(page);
  await page.screenshot({ path, fullPage: false });
  await page.close();
}
await shot("http://127.0.0.1:8080/", "/workspace/screenshots/landing-hero.png", 1280, 800);
await shot("http://127.0.0.1:8080/", "/workspace/screenshots/landing-season.png", 1280, 800, async (p) => {
  await p.evaluate(() => window.scrollTo(0, 780));
  await p.waitForTimeout(400);
});
await shot("http://127.0.0.1:8080/", "/workspace/screenshots/landing-season-mobile.png", 390, 844, async (p) => {
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForTimeout(400);
});
await shot("http://127.0.0.1:8080/homes/scalea", "/workspace/screenshots/property.png", 1280, 800);
await shot("http://127.0.0.1:8080/homes/scalea", "/workspace/screenshots/property-mobile.png", 390, 844);
await shot("http://127.0.0.1:8080/homes/scalea", "/workspace/screenshots/property-season.png", 390, 844, async (p) => {
  await p.getByRole("button", { name: "Sezon" }).click();
  await p.waitForTimeout(400);
});
await shot("http://127.0.0.1:8080/homes/scalea", "/workspace/screenshots/property-cost.png", 390, 844, async (p) => {
  await p.getByRole("button", { name: "Koszt" }).click();
  await p.waitForTimeout(400);
});
await browser.close();
console.log("ok");
