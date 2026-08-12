import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function loadPage(relativePath) {
  const html = await readFile(join(root, relativePath), "utf8");
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: `https://berkisler.github.io/${relativePath}`,
  });
  dom.window.eval(await readFile(join(root, "profile.js"), "utf8"));
  dom.window.eval(await readFile(join(root, "script.js"), "utf8"));
  return dom;
}

test("homepage has one clear h1 and the lead case-study link", async () => {
  const dom = await loadPage("index.html");
  assert.equal(dom.window.document.querySelectorAll("h1").length, 1);
  assert.match(dom.window.document.querySelector("h1").textContent, /ML products/);
  assert.equal(
    dom.window.document.querySelector('a[href="projects/listinglens.html"]').textContent.trim(),
    "See the RAG case study →",
  );
});

test("interactive concept demo switches its evidence and comparison state", async () => {
  const dom = await loadPage("index.html");
  dom.window.document.querySelector('[data-demo="monthly"]').click();
  assert.match(dom.window.document.querySelector("[data-demo-question]").textContent, /monthly cost/i);
  assert.match(dom.window.document.querySelector("[data-demo-answer]").textContent, /service costs are missing/i);
  assert.equal(dom.window.document.querySelectorAll("[data-demo-citations] span").length, 3);
  assert.equal(dom.window.document.querySelector("[data-demo-metrics] strong").textContent, "Linden");
});

test("mobile navigation toggles accessibly", async () => {
  const dom = await loadPage("index.html");
  const button = dom.window.document.querySelector("[data-nav-toggle]");
  const nav = dom.window.document.querySelector("[data-nav]");
  button.click();
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.ok(nav.classList.contains("is-open"));
  nav.querySelector('a[href="#work"]').click();
  assert.equal(button.getAttribute("aria-expanded"), "false");
});

test("résumé contact details are enabled and point to verified destinations", async () => {
  const dom = await loadPage("index.html");
  const linkedin = dom.window.document.querySelector('[data-profile-link="linkedin"]');
  const email = dom.window.document.querySelector('[data-profile-link="email"]');
  const resume = dom.window.document.querySelector('[data-profile-link="resume"]');
  assert.equal(linkedin.href, "https://linkedin.com/in/berk-isler");
  assert.equal(email.href, "mailto:berk.isler94@gmail.com");
  assert.match(resume.href, /assets\/berke-isler-resume\.pdf$/);
  assert.equal(resume.getAttribute("download"), "Berke-Isler-Resume.pdf");
});

test("case study labels all prototype housing data as synthetic", async () => {
  const dom = await loadPage("projects/listinglens.html");
  assert.match(dom.window.document.body.textContent, /All properties and figures above are synthetic/i);
  assert.match(dom.window.document.body.textContent, /Metrics will be published.*evaluation set/is);
});

test("every local page, script, stylesheet, and image reference resolves", async () => {
  for (const relativePath of ["index.html", "projects/listinglens.html"]) {
    const html = await readFile(join(root, relativePath), "utf8");
    const dom = new JSDOM(html);
    const pageDirectory = dirname(join(root, relativePath));
    const references = [...dom.window.document.querySelectorAll("a[href], link[href], script[src]")]
      .map((node) => node.getAttribute("href") || node.getAttribute("src"))
      .filter((value) => value && !/^(#|https?:|mailto:)/.test(value));

    for (const reference of references) {
      await assert.doesNotReject(
        access(join(pageDirectory, reference.split("#")[0])),
        `${relativePath} points to missing local asset ${reference}`,
      );
    }
  }
});
