import test from "node:test";
import assert from "node:assert/strict";
import { createInstallation, signNote, verifyNote } from "../client/installation-signer.mjs";
import { IngestionGateway } from "../gateway/ingestion.mjs";
import { createSnapshot, merkleRoot } from "../provenance/merkle.mjs";

const NOW = Date.parse("2026-08-25T00:00:00.000Z");
const stamp = (offset = 0) => new Date(NOW + offset).toISOString();

test("signing creates a content-addressed note that verifies", () => {
  const installation = createInstallation();
  const note = signNote(installation, { content: "A useful observation.", created_at: stamp(), nonce: "nonce-signing-000001" });
  const result = verifyNote(note);
  assert.equal(result.valid, true);
  assert.equal(result.note_id, note.note_id);
  assert.match(note.content_hash, /^sha256:/);
  assert.equal(note.signature_algorithm, "Ed25519-development-only");
});

test("tampering with content or hash fails verification", () => {
  const installation = createInstallation();
  const note = signNote(installation, { content: "Original text.", created_at: stamp(), nonce: "nonce-tamper-000001" });
  assert.equal(verifyNote({ ...note, content: "Changed text." }).valid, false);
  assert.equal(verifyNote({ ...note, content_hash: "sha256:wrong" }).valid, false);
});

test("note schema rejects over-limit content", () => {
  const installation = createInstallation();
  assert.throws(() => signNote(installation, { content: "x".repeat(361), created_at: stamp(), nonce: "nonce-limit-0000001" }), /exceeds 360/);
});

test("gateway accepts once and rejects replay, stale, and moderated notes", () => {
  const installation = createInstallation();
  const gateway = new IngestionGateway({ clock: () => NOW, maxAgeMs: 60_000 });
  const note = signNote(installation, { content: "One note enters the commons.", created_at: stamp(), nonce: "nonce-gateway-000001" });
  assert.deepEqual(gateway.ingest(note), { accepted: true, duplicate: false, note_id: note.note_id });
  assert.equal(gateway.ingest(note).code, "replay_detected");
  const stale = signNote(installation, { content: "Too old.", created_at: stamp(-120_000), nonce: "nonce-stale-000001" });
  assert.equal(gateway.ingest(stale).code, "timestamp_out_of_window");
  const spam = signNote(installation, { content: "Buy now for guaranteed profit.", created_at: stamp(), nonce: "nonce-spam-000001" });
  assert.equal(gateway.ingest(spam).code, "moderation_rejected");
});

test("Merkle root is order-independent and snapshots deduplicate IDs", () => {
  const ids = ["sha256:a", "sha256:b", "sha256:a"];
  assert.equal(merkleRoot(ids), merkleRoot(["sha256:b", "sha256:a"]));
  const snapshot = createSnapshot([{ note_id: "sha256:a" }, { note_id: "sha256:b" }, { note_id: "sha256:a" }], { snapshotNumber: 7, created_at: stamp() });
  assert.equal(snapshot.snapshot_id, "ROOT-007");
  assert.equal(snapshot.note_count, 2);
  assert.equal(snapshot.note_ids.length, 2);
});
