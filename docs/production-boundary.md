# Production boundary and threat model

Learning Commons is a public knowledge commons, not a biometric identity system. The public protocol must answer **what was learned?**, not **who are you?**

## Current V1 and staged boundary

Learning Commons V1 is intentionally **not** a global publishing system. It is a local browser prototype with no sign-in, no profile graph, no biometric dependency, no blockchain, and no financial functionality.

The `backend-staging/` directory is a non-connected rehearsal boundary. Its Worker-shaped handler uses an in-memory map and deterministic rules so that API behavior can be tested without creating a public datastore or sending data to a third party. The existence of these files does not imply that public writes or shared persistence are enabled.

## Trust boundaries

| Boundary | Allowed data | Never send or store |
|---|---|---|
| Device | Private signing key, draft text, local installation state | Raw fingerprint, face template, biometric token as identity proof |
| Staged submit handler | Mock note payload and an expiring test bucket | Human identity, reusable biometric material, external service credentials |
| Ingestion gateway | Signed note, public key, timestamp, nonce, moderation result | Human identity, reusable biometric material |
| Commons replica | Approved content-addressed notes and verification metadata | Private keys, account profile, social graph |
| Optional ledger | Merkle root, snapshot timestamp, protocol version | Note text or personal data |

## Authentication distinction

If a future private administrative surface needs authentication, use WebAuthn/passkeys or platform biometric APIs. The server should verify a cryptographic assertion created after the operating system approves the local biometric check. It must not accept a client-supplied `fingerprint_token` as proof.

Remote face/KYC verification is a separate system with explicit consent, liveness, retention, vendor, and regulatory controls. It is excluded from the Learning Commons public-note protocol.

## Future production prerequisites

Before any real global write capability is considered, the project would require explicit review of payload validation, abuse controls, moderation operations, takedown, retention, CORS, security headers, logging, backup/restore, and cross-browser privacy behavior. A production deployment must not be inferred from the staging files.

## Prototype limitations

The current repository uses an Ed25519 development signer implemented with Node's standard library. It demonstrates canonicalization, hashing, signing, verification, replay protection, moderation, and Merkle snapshots. It is not production-ready post-quantum cryptography. Before deployment, commission a security review, select a maintained ML-DSA implementation if post-quantum signatures are truly required, protect private keys with platform secure storage, and define retention and abuse-response policies.
