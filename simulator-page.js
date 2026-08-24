import { BiometricAuthSimulator, STATES } from "./simulator/biometric-auth.mjs";
import { createMultimodalReference, summarizeMultimodalReference } from "./simulator/multimodal-reference.mjs";

const app = document.querySelector("#app");
const simulator = new BiometricAuthSimulator();
const reference = createMultimodalReference();

app.innerHTML = `
  <section class="simulator-shell" aria-label="Biometric simulator">
    <div class="simulator-header"><div><div class="kicker">Local protocol simulation</div><h1>Biometric console.</h1><p class="lede">A safe, deterministic rehearsal of capture and verification states. No camera, fingerprint reader, face image, or biometric template is accessed.</p></div><span class="sim-status">SIMULATED</span></div>
    <section class="simulator-panel">
      <div class="simulator-actions"><button class="primary" id="capture-sim">Capture snapshot</button><button class="secondary" id="match-sim">Start face match</button><button class="secondary" id="fingerprint-sim">Tap fingerprint pad</button></div>
      <div class="sim-console" id="sim-console" role="status" aria-live="polite">Awaiting operator input. All biometric results are simulated locally.</div>
      <div class="fingerprint-pad" id="fingerprint-pad" role="button" tabindex="0" aria-label="Tap fingerprint pad"><span class="fingerprint-icon">◉</span><div><strong>Fingerprint scanner pad</strong><p>Tap to emulate a liveness and ridge-pattern scan. No fingerprint material is collected.</p></div></div>
      <div class="sim-metrics"><div><strong id="sim-state">${STATES.IDLE}</strong><span>state</span></div><div><strong id="sim-confidence">—</strong><span>confidence</span></div><div><strong id="sim-latency">—</strong><span>latency</span></div></div>
    </section>
    <section class="simulator-panel"><div class="panel-heading"><h2>Local health</h2><span>mock api</span></div><div class="sim-console">Directory: healthy · Replication: local · Identities: ${simulator.health().identities} · No identity resolution</div></section>
    <section class="simulator-panel"><div class="panel-heading"><h2>Multimodal reference</h2><span>local adapter</span></div><p>${summarizeMultimodalReference(reference)}</p><div class="modality-grid">${reference.modalities.map((modality) => `<div class="modality"><span>${modality.name}</span><strong>${modality.status}</strong></div>`).join("")}</div></section>
    <section class="simulator-panel"><div class="panel-heading"><h2>Mock API console</h2><span>LOCAL STREAM</span></div><pre id="sim-log">No sensor events recorded.</pre></section>
  </section>`;

const state = document.querySelector("#sim-state");
const confidence = document.querySelector("#sim-confidence");
const latency = document.querySelector("#sim-latency");
const consoleEl = document.querySelector("#sim-console");
const logEl = document.querySelector("#sim-log");
const render = (result) => {
  state.textContent = result.state;
  confidence.textContent = result.result?.confidence ? `${(result.result.confidence * 100).toFixed(1)}%` : "—";
  latency.textContent = result.result?.latency_ms ? `${result.result.latency_ms} ms` : "—";
  consoleEl.textContent = result.state === STATES.VERIFIED ? "Verification simulated locally. No identity was resolved." : `Simulator state: ${result.state}.`;
  logEl.textContent = simulator.apiConsole().map((entry) => `${entry.at} ${entry.event} ${entry.result || ""}`).join("\n") || "No sensor events recorded.";
};

document.querySelector("#capture-sim").addEventListener("click", () => render(simulator.captureSnapshot()));
document.querySelector("#match-sim").addEventListener("click", () => render(simulator.startFaceMatch()));
document.querySelector("#fingerprint-sim").addEventListener("click", () => render(simulator.tapFingerprintPad()));
const fingerprintPad = document.querySelector("#fingerprint-pad");
fingerprintPad.addEventListener("click", () => render(simulator.tapFingerprintPad()));
fingerprintPad.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); render(simulator.tapFingerprintPad()); } });
