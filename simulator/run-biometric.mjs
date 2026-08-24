import { BiometricAuthSimulator } from "./biometric-auth.mjs";

const simulator = new BiometricAuthSimulator({ clock: () => "2026-08-25T00:00:00.000Z" });
const face = simulator.captureSnapshot({ quality: 0.987, liveness: 0.994, similarity: 0.987 });
const faceMatch = simulator.startFaceMatch();
const denied = new BiometricAuthSimulator({ clock: () => "2026-08-25T00:00:00.000Z" }).startFaceMatch();
const fingerprint = simulator.tapFingerprintPad({ liveness: 0.987 });

console.log(JSON.stringify({ health: simulator.health(), face, faceMatch, denied, fingerprint, api_console: simulator.apiConsole() }, null, 2));
