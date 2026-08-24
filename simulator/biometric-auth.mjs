export const STATES = Object.freeze({ IDLE: "IDLE", CAPTURED: "CAPTURED", QUALITY_CHECK: "QUALITY_CHECK", LIVENESS: "LIVENESS", FACE_MATCH: "FACE_MATCH", VERIFIED: "VERIFIED", DENIED: "DENIED" });

export class BiometricAuthSimulator {
  constructor({ clock = () => new Date().toISOString(), directorySize = 12409 } = {}) {
    this.clock = clock;
    this.directorySize = directorySize;
    this.state = STATES.IDLE;
    this.logs = [];
    this.lastResult = null;
  }

  log(event, details = {}) {
    this.logs.unshift({ at: this.clock(), event, ...details });
  }

  captureSnapshot({ quality = 0.987, liveness = 0.994, similarity = 0.987 } = {}) {
    this.state = STATES.CAPTURED;
    this.lastResult = { quality, liveness, similarity, confidence: Math.min(quality, liveness, similarity), latency_ms: 486 };
    this.log("CAPTURE_SIMULATED", { note: "No camera frame or biometric template was captured." });
    return { state: this.state, result: this.lastResult };
  }

  startFaceMatch() {
    if (this.state !== STATES.CAPTURED) return this.deny("capture_required");
    this.state = STATES.QUALITY_CHECK;
    this.log("QUALITY_CHECK", { result: "pass" });
    this.state = STATES.LIVENESS;
    this.log("LIVENESS_CHECK", { result: this.lastResult.liveness >= 0.8 ? "pass" : "fail" });
    this.state = STATES.FACE_MATCH;
    const passed = this.lastResult.quality >= 0.8 && this.lastResult.liveness >= 0.8 && this.lastResult.similarity >= 0.8;
    if (!passed) return this.deny("threshold_not_met");
    this.state = STATES.VERIFIED;
    this.log("FACE_MATCH", { result: "pass", confidence: this.lastResult.confidence });
    this.log("VERIFIED", { session: "simulated-local-session" });
    return { state: this.state, result: this.lastResult };
  }

  tapFingerprintPad({ liveness = 0.99 } = {}) {
    const passed = liveness >= 0.8;
    this.state = passed ? STATES.VERIFIED : STATES.DENIED;
    this.lastResult = { modality: "fingerprint", liveness, confidence: liveness, latency_ms: 486 };
    this.log("FINGERPRINT_SCAN_SIMULATED", { result: passed ? "pass" : "fail", note: "No fingerprint image or token was collected." });
    return { state: this.state, result: this.lastResult };
  }

  deny(reason) {
    this.state = STATES.DENIED;
    this.log("DENIED", { reason });
    return { state: this.state, reason, result: this.lastResult };
  }

  health() {
    return { directory: "healthy", identities: this.directorySize, replication: "local", simulated: true };
  }

  apiConsole() {
    return this.logs.slice(0, 8);
  }
}
