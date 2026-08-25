import test from "node:test";
import assert from "node:assert/strict";
import { createStageBApp } from "../backend-staging/src/worker.mjs";

const request = (path, options = {}) => new Request(`http://simulation.local${path}`, options);
const jsonRequest = (path, body, headers = {}) => request(path, {
  method: "POST",
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(body)
});
const json = async (response) => response.json();

test("approved submissions expose only the anonymous public contract", async () => {
  const app = createStageBApp();
  const response = await app.handle(jsonRequest("/submit", { note: "I learned to pause before replying.", concepts: ["self-checking"] }));
  assert.equal(response.status, 201);
  const body = await json(response);
  assert.equal(body.state, "approved");
  assert.deepEqual(Object.keys(body.note).sort(), ["id", "note"]);
  assert.equal(body.note.note, "I learned to pause before replying.");
  assert.doesNotMatch(JSON.stringify(body), /author|ip|session|device|created_at/);
});

test("the 360 character boundary is enforced without rewriting content", async () => {
  const app = createStageBApp();
  const exact = Array.from({ length: 360 }, (_, index) => String.fromCharCode(97 + (index % 26))).join("");
  const accepted = await app.handle(jsonRequest("/submit", { note: exact }));
  assert.equal(accepted.status, 201);
  assert.equal((await json(accepted)).note.note, exact);
  const tooLong = await app.handle(jsonRequest("/submit", { note: `${exact}x` }));
  assert.equal(tooLong.status, 400);
  assert.equal((await json(tooLong)).error, "note_too_long");
});

test("identity-bearing payloads are rejected", async () => {
  const app = createStageBApp();
  const response = await app.handle(jsonRequest("/submit", { note: "A useful observation.", author: "someone" }));
  assert.equal(response.status, 400);
  assert.equal((await json(response)).error, "identity_fields_forbidden");
});

test("spam is rejected and safety-sensitive text is not published automatically", async () => {
  const app = createStageBApp();
  const spam = await app.handle(jsonRequest("/submit", { note: "Read https://example.invalid now" }));
  assert.equal(spam.status, 422);
  const flagged = await app.handle(jsonRequest("/submit", { note: "Please review this seed phrase concern." }));
  assert.equal(flagged.status, 201);
  assert.equal((await json(flagged)).state, "flagged");
  const notes = await app.handle(request("/notes"));
  assert.deepEqual(await json(notes), []);
});

test("duplicates are detected by content hash", async () => {
  const app = createStageBApp();
  await app.handle(jsonRequest("/submit", { note: "Same learning trace." }));
  const duplicate = await app.handle(jsonRequest("/submit", { note: "Same learning trace." }));
  assert.equal(duplicate.status, 409);
  assert.equal((await json(duplicate)).error, "duplicate_note");
});

test("rate limits are isolated by bucket and expire deterministically", async () => {
  let now = 1_000;
  const app = createStageBApp({ clock: () => now });
  for (let index = 0; index < 3; index += 1) {
    const response = await app.handle(jsonRequest("/submit", { note: `Learning ${index}` }, { "x-simulation-bucket": "A" }));
    assert.equal(response.status, 201);
  }
  const limited = await app.handle(jsonRequest("/submit", { note: "Learning blocked" }, { "x-simulation-bucket": "A" }));
  assert.equal(limited.status, 429);
  const otherBucket = await app.handle(jsonRequest("/submit", { note: "Learning elsewhere" }, { "x-simulation-bucket": "B" }));
  assert.equal(otherBucket.status, 201);
  now += 60_000;
  const afterExpiry = await app.handle(jsonRequest("/submit", { note: "Learning again" }, { "x-simulation-bucket": "A" }));
  assert.equal(afterExpiry.status, 201);
});

test("idea positions are deterministic and never require identity", async () => {
  const app = createStageBApp();
  const first = await app.handle(jsonRequest("/submit", { note: "I tried again.", concepts: ["trying again"] }));
  const firstBody = await json(first);
  const stored = [...app.notes.values()][0];
  assert.equal(stored.idea_position.concept, "trying again");
  const second = await app.handle(jsonRequest("/submit", { note: "A different learning." }));
  assert.equal(second.status, 201);
  assert.equal(typeof [...app.notes.values()][1].idea_position.x, "number");
  assert.equal(firstBody.note.id, stored.id);
});
