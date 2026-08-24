import test from "node:test";
import assert from "node:assert/strict";
import { BiometricAuthSimulator, STATES } from "../simulator/biometric-auth.mjs";

const clock = () => "2026-08-25T00:00:00.000Z";

test("face flow progresses through capture, quality, liveness, match, and verification", () => {
  const simulator = new BiometricAuthSimulator({ clock });
  assert.equal(simulator.captureSnapshot().state, STATES.CAPTURED);
  const result = simulator.startFaceMatch();
  assert.equal(result.state, STATES.VERIFIED);
  assert.ok(simulator.apiConsole().some((entry) => entry.event === "LIVENESS_CHECK"));
});

test("face match cannot start before a capture", () => {
  const simulator = new BiometricAuthSimulator({ clock });
  const result = simulator.startFaceMatch();
  assert.equal(result.state, STATES.DENIED);
  assert.equal(result.reason, "capture_required");
});

test("weak liveness or similarity is denied", () => {
  const simulator = new BiometricAuthSimulator({ clock });
  simulator.captureSnapshot({ quality: 0.99, liveness: 0.79, similarity: 0.99 });
  assert.equal(simulator.startFaceMatch().state, STATES.DENIED);

  const second = new BiometricAuthSimulator({ clock });
  second.captureSnapshot({ quality: 0.99, liveness: 0.99, similarity: 0.79 });
  assert.equal(second.startFaceMatch().state, STATES.DENIED);
});

test("fingerprint pad is explicitly simulated and never returns biometric material", () => {
  const simulator = new BiometricAuthSimulator({ clock });
  const result = simulator.tapFingerprintPad();
  assert.equal(result.state, STATES.VERIFIED);
  assert.equal(Object.hasOwn(result.result, "fingerprint_image"), false);
  assert.equal(Object.hasOwn(result.result, "fingerprint_token"), false);
  assert.equal(simulator.health().simulated, true);
});

test("health reports local replication and bounded console history", () => {
  const simulator = new BiometricAuthSimulator({ clock, directorySize: 12409 });
  for (let i = 0; i < 12; i += 1) simulator.log(`EVENT_${i}`);
  assert.deepEqual(simulator.health(), { directory: "healthy", identities: 12409, replication: "local", simulated: true });
  assert.equal(simulator.apiConsole().length, 8);
});
