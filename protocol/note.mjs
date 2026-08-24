import { createHash } from "node:crypto";

export const PROTOCOL = "learning-commons";
export const NOTE_VERSION = "1";
export const MAX_CONTENT_LENGTH = 360;

export function base64url(buffer) {
  return Buffer.from(buffer).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64url(value) {
  return Buffer.from(String(value).replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function canonicalString(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalString).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalString(value[key])}`).join(",")}}`;
}

export function unsignedNote({ content, created_at, nonce, protocol = PROTOCOL, version = NOTE_VERSION }) {
  return { version, content: String(content ?? ""), created_at, nonce: String(nonce), protocol };
}

export function hashCanonical(value) {
  return `sha256:${createHash("sha256").update(canonicalString(value)).digest("hex")}`;
}

export function noteId(note) {
  return hashCanonical(unsignedNote(note));
}

export function validateUnsignedNote(note) {
  const errors = [];
  if (!note || typeof note !== "object") return ["note must be an object"];
  if (note.version !== NOTE_VERSION) errors.push("unsupported version");
  if (note.protocol !== PROTOCOL) errors.push("unsupported protocol");
  if (typeof note.content !== "string" || note.content.trim().length === 0) errors.push("content is required");
  if (typeof note.content === "string" && note.content.length > MAX_CONTENT_LENGTH) errors.push("content exceeds 360 characters");
  if (!note.created_at || Number.isNaN(Date.parse(note.created_at))) errors.push("created_at must be ISO 8601");
  if (typeof note.nonce !== "string" || note.nonce.length < 16) errors.push("nonce must be at least 16 characters");
  return errors;
}
