import assert from "node:assert/strict";
import { createInstallation, signNote } from "../client/installation-signer.mjs";
import { IngestionGateway } from "../gateway/ingestion.mjs";
import { createSnapshot } from "../provenance/merkle.mjs";

const now = Date.parse("2026-08-25T00:00:00.000Z");
const installation = createInstallation();
const gateway = new IngestionGateway({ clock: () => now, maxAgeMs: 60_000 });
const valid = signNote(installation, { content: "A small experiment is easier to begin when the next action is visible.", created_at: new Date(now).toISOString(), nonce: "nonce-valid-0000001" });
const accepted = gateway.ingest(valid);
assert.equal(accepted.accepted, true);
assert.equal(gateway.ingest(valid).code, "replay_detected");

const tampered = { ...signNote(installation, { content: "A second observation is worth writing down.", created_at: new Date(now).toISOString(), nonce: "nonce-tampered-0001" }), content: "Changed after signing." };
assert.equal(gateway.ingest(tampered).code, "verification_failed");

const stale = signNote(installation, { content: "This note arrived too late.", created_at: new Date(now - 120_000).toISOString(), nonce: "nonce-stale-000001" });
assert.equal(gateway.ingest(stale).code, "timestamp_out_of_window");

const spam = signNote(installation, { content: "Buy now for guaranteed profit.", created_at: new Date(now).toISOString(), nonce: "nonce-spam-00000001" });
assert.equal(gateway.ingest(spam).code, "moderation_rejected");

const second = signNote(installation, { content: "Writing one plain example before searching gives me a better question.", created_at: new Date(now).toISOString(), nonce: "nonce-second-00001" });
assert.equal(gateway.ingest(second).accepted, true);
const snapshot = createSnapshot(gateway.commons(), { snapshotNumber: 1, created_at: new Date(now).toISOString() });
assert.equal(snapshot.note_count, 2);
assert.match(snapshot.merkle_root, /^sha256:/);

console.log(JSON.stringify({ status: "all simulations passed", stats: gateway.stats(), snapshot }, null, 2));
