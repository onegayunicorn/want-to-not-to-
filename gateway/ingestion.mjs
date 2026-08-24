import { verifyNote } from "../client/installation-signer.mjs";

export class IngestionGateway {
  constructor({ clock = () => Date.now(), maxAgeMs = 5 * 60 * 1000, moderator = defaultModerator } = {}) {
    this.clock = clock;
    this.maxAgeMs = maxAgeMs;
    this.moderator = moderator;
    this.replayCache = new Set();
    this.approved = new Map();
    this.rejected = [];
  }

  ingest(note) {
    const verification = verifyNote(note);
    if (!verification.valid) return this.reject(note, "verification_failed", verification.errors);
    const created = Date.parse(note.created_at);
    if (Math.abs(this.clock() - created) > this.maxAgeMs) return this.reject(note, "timestamp_out_of_window", []);
    if (this.replayCache.has(note.nonce)) return this.reject(note, "replay_detected", []);
    const moderation = this.moderator(note.content);
    if (!moderation.approved) return this.reject(note, "moderation_rejected", moderation.reasons);
    this.replayCache.add(note.nonce);
    if (this.approved.has(note.note_id)) return { accepted: true, duplicate: true, note_id: note.note_id };
    this.approved.set(note.note_id, { ...note, moderation: { label: "approved" } });
    return { accepted: true, duplicate: false, note_id: note.note_id };
  }

  reject(note, code, details) {
    const result = { accepted: false, code, details };
    this.rejected.push({ note_id: note?.note_id ?? null, ...result });
    return result;
  }

  commons() { return [...this.approved.values()].map(({ moderation, ...note }) => note); }
  stats() { return { approved: this.approved.size, rejected: this.rejected.length, replay_entries: this.replayCache.size }; }
}

export function defaultModerator(content) {
  const reasons = [];
  if (/https?:\/\//i.test(content)) reasons.push("links are not allowed in the prototype gateway");
  if (/\b(buy now|free money|guaranteed profit)\b/i.test(content)) reasons.push("promotional spam phrase");
  return { approved: reasons.length === 0, reasons };
}
