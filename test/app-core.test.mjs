import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_LENGTH,
  canAsk,
  canShare,
  nextSingleIndex,
  normalizeNote,
  noteLength,
  readingTime,
  routeFromHash,
  guideResponse,
} from "../app-core.mjs";

test("the 360-character limit is exact and enforced before sharing", () => {
  const exact = "x".repeat(MAX_LENGTH);
  const over = `${exact}overflow`;

  assert.equal(noteLength(exact), 360);
  assert.equal(normalizeNote(exact).length, 360);
  assert.equal(normalizeNote(over).length, 360);
  assert.equal(canAsk(exact), true);
  assert.equal(canAsk(over), false);
  assert.equal(canShare(over), true, "over-limit content can still be normalized at the share boundary");
});

test("empty, whitespace-only, and short notes cannot be asked or shared", () => {
  assert.equal(normalizeNote("   \n\t  "), "");
  assert.equal(canAsk(""), false);
  assert.equal(canAsk("123456789"), false);
  assert.equal(canAsk("1234567890"), true);
  assert.equal(canShare(""), false);
  assert.equal(canShare("  useful trace  "), true);
});

test("normalization tolerates nullish and non-string values", () => {
  assert.equal(normalizeNote(null), "");
  assert.equal(normalizeNote(undefined), "");
  assert.equal(normalizeNote(12345), "12345");
  assert.equal(noteLength({}), 15);
});

test("single-card navigation stays bounded at both ends", () => {
  assert.equal(nextSingleIndex(0, "prev", 3), 0);
  assert.equal(nextSingleIndex(0, "next", 3), 1);
  assert.equal(nextSingleIndex(2, "next", 3), 2);
  assert.equal(nextSingleIndex(2, "prev", 3), 1);
  assert.equal(nextSingleIndex(-20, "next", 3), 0);
  assert.equal(nextSingleIndex(20, "next", 3), 2);
  assert.equal(nextSingleIndex(0, "next", 0), 0);
  assert.equal(nextSingleIndex(0, "next", Number.NaN), 0);
});

test("route parsing keeps unknown hashes on the safe writing route", () => {
  assert.equal(routeFromHash("#commons"), "commons");
  assert.equal(routeFromHash("commons"), "commons");
  assert.equal(routeFromHash("#write"), "write");
  assert.equal(routeFromHash("#not-a-route"), "write");
  assert.equal(routeFromHash(undefined), "write");
});

test("reading time is at least one minute and scales with long notes", () => {
  assert.equal(readingTime(""), 1);
  assert.equal(readingTime("one two three"), 1);
  assert.equal(readingTime("word ".repeat(220)), 1);
  assert.equal(readingTime("word ".repeat(440)), 2);
});

test("conversational guide opens with a capture question", () => {
  const response = guideResponse("   ");
  assert.equal(response.tone, "open");
  assert.match(response.message, /What are you trying to capture here/);
  assert.deepEqual(response.prompts, ["What did you notice?", "What did you try?", "What changed?"]);
});

test("conversational guide redirects emotional descriptions toward observable action", () => {
  const response = guideResponse("I feel overwhelmed when I open the long reading list.");
  assert.equal(response.tone, "redirect");
  assert.match(response.message, /what happened rather than the feeling/);
  assert.deepEqual(response.prompts, ["What did you notice?", "What did you do?", "What changed?", "What might you try next time?"]);
});

test("conversational guide develops short notes and reflects on developed notes", () => {
  assert.equal(guideResponse("I moved one task.").tone, "develop");
  assert.equal(guideResponse("I moved one task from a long list onto a blank card. It became easier to begin because the card had an edge and gave me one clear place to start.").tone, "reflect");
});
