import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const core = fs.readFileSync(new URL("../app-core.mjs", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");

test("prototype contains the anonymous seed note and browser persistence", () => {
  assert.match(app, /const SEED/);
  assert.match(app, /localStorage\.getItem\(KEY/);
  assert.match(app, /localStorage\.setItem\(KEY/);
  assert.match(app, /No profiles|public note|anonymous/i);
});

test("writing guide preserves user text and redirects feeling language", () => {
  assert.match(app, /does not rewrite your words|original words stay intact/);
  assert.match(core, /feelingWords/);
  assert.match(core, /what happened rather than the feeling/);
  assert.match(app, /maxlength=\"\$\{MAX_LENGTH\}\"/);
});

test("commons provides all reading arrangements and the idea map", () => {
  assert.match(app, /data-view=\"crowd\"/);
  assert.match(app, /data-view=\"small\"/);
  assert.match(app, /data-view=\"single\"/);
  assert.match(app, /data-mode=\"map\"/);
  assert.match(app, /data-node-index/);
  assert.match(app, /Proximity suggests conceptual similarity/);
});

test("single-card navigation and accessible page shell are present", () => {
  assert.match(app, /data-single=\"prev\"/);
  assert.match(app, /data-single=\"next\"/);
  assert.match(html, /aria-label=\"Primary navigation\"/);
  assert.match(html, /meta name=\"description\"/);
  assert.match(css, /prefers-reduced-motion/);
});

test("view and arrangement controls have intact labels", () => {
  assert.match(app, /data-view=\"single\" class=\"\$\{view === \"single\" \? \"active\" : \"\"\}\">Loose notes/);
  assert.match(app, /data-mode=\"map\" class=\"\$\{commonsMode === \"map\" \? \"active\" : \"\"\}\">Map \/ ideas/);
});

test("public V1 shell has no identity or sensor workflow", () => {
  assert.doesNotMatch(html, /sign[ -]?in|log[ -]?in|password|create account/i);
  assert.doesNotMatch(html, /camera|fingerprint|face recognition|wallet/i);
  assert.match(html, /biometric\.html/);
  assert.match(html, /Simulator/);
  assert.match(app, /localStorage/);
  assert.doesNotMatch(app, /blockchain|wallet|author lookup|followers/i);
});
