import { generateKeyPairSync, sign, verify, randomBytes, createPublicKey } from "node:crypto";
import { base64url, fromBase64url, unsignedNote, hashCanonical, noteId, validateUnsignedNote } from "../protocol/note.mjs";

export const DEVELOPMENT_ALGORITHM = "Ed25519-development-only";

export function createInstallation() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    algorithm: DEVELOPMENT_ALGORITHM,
    public_key: base64url(publicKey.export({ type: "spki", format: "der" })),
    private_key: privateKey.export({ type: "pkcs8", format: "pem" })
  };
}

export function signNote(installation, { content, created_at = new Date().toISOString(), nonce = base64url(randomBytes(18)) }) {
  const unsigned = unsignedNote({ content, created_at, nonce });
  const errors = validateUnsignedNote(unsigned);
  if (errors.length) throw new Error(`Invalid note: ${errors.join(", ")}`);
  const content_hash = hashCanonical(unsigned);
  const signature = sign(null, Buffer.from(content_hash), installation.private_key);
  return { ...unsigned, content_hash, public_key: installation.public_key, signature_algorithm: DEVELOPMENT_ALGORITHM, signature: base64url(signature), note_id: noteId(unsigned) };
}

export function verifyNote(note) {
  const { note_id: _noteId, content_hash, public_key, signature_algorithm, signature, ...unsigned } = note ?? {};
  const errors = validateUnsignedNote(unsigned);
  if (errors.length) return { valid: false, errors };
  if (signature_algorithm !== DEVELOPMENT_ALGORITHM) return { valid: false, errors: ["unsupported development signature algorithm"] };
  const expectedHash = hashCanonical(unsigned);
  if (content_hash !== expectedHash) return { valid: false, errors: ["content hash mismatch"] };
  try {
    const key = createPublicKey({ key: fromBase64url(public_key), type: "spki", format: "der" });
    const valid = verify(null, Buffer.from(content_hash), key, fromBase64url(signature));
    return { valid, errors: valid ? [] : ["signature mismatch"], note_id: noteId(unsigned) };
  } catch {
    return { valid: false, errors: ["malformed public key or signature"] };
  }
}
