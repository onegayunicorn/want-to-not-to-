# Production boundary and threat model

Learning Commons is a public knowledge commons, not a biometric identity system. The public protocol must answer **what was learned?**, not **who are you?**

## Trust boundaries

| Boundary | Allowed data | Never send or store |
|---|---|---|
| Device | Private signing key, draft text, local installation state | Raw fingerprint, face template, biometric token as identity proof |
| Ingestion gateway | Signed note, public key, timestamp, nonce, moderation result | Human identity, reusable biometric material |
| Commons replica | Approved content-addressed notes and verification metadata | Private keys, account profile, social graph |
| Optional ledger | Merkle root, snapshot timestamp, protocol version | Note text or personal data |

## Authentication distinction

If a future private administrative surface needs authentication, use WebAuthn/passkeys or platform biometric APIs. The server should verify a cryptographic assertion created after the operating system approves the local biometric check. It must not accept a client-supplied `fingerprint_token` as proof.

Remote face/KYC verification is a separate system with explicit consent, liveness, retention, vendor, and regulatory controls. It is excluded from the Learning Commons public-note protocol.

## Prototype limitations

The current repository uses an Ed25519 development signer implemented with Node's standard library. It demonstrates canonicalization, hashing, signing, verification, replay protection, moderation, and Merkle snapshots. It is not production-ready post-quantum cryptography. Before deployment, commission a security review, select a maintained ML-DSA implementation if post-quantum signatures are truly required, protect private keys with platform secure storage, and define retention and abuse-response policies.
