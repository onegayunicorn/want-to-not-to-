# Learning Commons canonical note schema

This schema defines the content-addressed object exchanged between an anonymous installation, the ingestion gateway, and mirrors. It contains no name, email, profile, biometric data, or social identifier.

```json
{
  "version": "1",
  "content": "A concise learning observation.",
  "created_at": "2026-08-25T00:00:00.000Z",
  "nonce": "random-unique-value",
  "protocol": "learning-commons",
  "content_hash": "sha256:...",
  "public_key": "base64url-encoded-public-key",
  "signature_algorithm": "ML-DSA-65",
  "signature": "base64url-encoded-signature"
}
```

`content_hash` is calculated over the canonical object containing `version`, `content`, `created_at`, `nonce`, and `protocol`. `note_id` is the hash of that canonical object and is used for deduplication. The signature covers the content hash and binds the note to the anonymous installation key.

The repository includes an **Ed25519 development adapter** so the complete flow can be tested without an external dependency. This is not a claim that Ed25519 is ML-DSA-65. A production deployment must replace the adapter with a reviewed, standards-compliant ML-DSA-65 implementation or a WebAuthn/passkey design appropriate to the authentication requirement.

## Invariants

| Invariant | Requirement |
|---|---|
| Content integrity | A changed content field must fail hash or signature verification. |
| Replay resistance | `nonce` must be unique within the gateway replay window. |
| Expiry | The gateway must reject notes outside the configured timestamp window. |
| Privacy | Public notes contain no human identity or biometric material. |
| Moderation | Notes are mutable and removable at the ingestion layer; they are not written directly to an immutable ledger. |
