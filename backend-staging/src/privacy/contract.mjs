export const MAX_NOTE_LENGTH = 360;

export function validateSubmitPayload(payload) {
  if (!payload || typeof payload !== "object") return { ok: false, reason: "payload_object_required" };
  if (typeof payload.note !== "string") return { ok: false, reason: "note_string_required" };
  const note = payload.note.trim();
  if (!note) return { ok: false, reason: "note_required" };
  if (note.length > MAX_NOTE_LENGTH) return { ok: false, reason: "note_too_long" };
  if (Object.hasOwn(payload, "author") || Object.hasOwn(payload, "ip") || Object.hasOwn(payload, "session") || Object.hasOwn(payload, "device")) {
    return { ok: false, reason: "identity_fields_forbidden" };
  }
  return { ok: true, note };
}

export function publicNote(note) {
  return { id: note.id, note: note.content };
}

export function publicNotes(notes) {
  return notes.filter((note) => note.moderation_state === "approved").map(publicNote);
}
