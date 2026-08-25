# Learning Commons V1 launch plan

## Decision

Learning Commons V1 is a public, sign-in-free, biometric-free, and blockchain-free prototype. The intended path is:

> Open → write → private guide → optionally share → read the Commons.

The public interface does not require account creation, email, passwords, social login, face recognition, fingerprints, wallets, public profiles, follower graphs, or author lookup. Notes are content-only and browser-local in the prototype.

## What V1 includes

| Surface | V1 behavior |
|---|---|
| Write | A concise note composer with a 360-character limit, prompt chips, and a private conversational guide. |
| Guide | Redirects emotional descriptions toward observable events, actions, changes, and possible next experiments without rewriting the original text. |
| Share | An optional local share action that stores the note in the current browser. |
| Commons | Quiet shelf, study table, loose notes, single-card navigation, and a conceptual idea map. |
| Protocol rehearsal | Development-only signed-note, moderation, replay, Merkle, and ingestion simulations. |

The biometric console is kept as a separate simulator page for development and design rehearsal. It is not part of the Learning Commons V1 identity model and does not access sensors, capture images, create templates, or perform identity matching.

## Deployment stages

### Stage A — public prototype

```text
GitHub → Vercel or Netlify → Learning Commons → no sign-in → browser-local notes
```

This stage is suitable for UX testing. Each visitor's notes remain in that visitor's browser, so a note shared in one browser does not automatically appear in another browser.

### Stage B — shared Commons

```text
Write → private guide → share
       ↓
anonymous ingestion → moderation and abuse controls → shared Commons
       ↓
quiet shelf / study table / loose notes / idea map
```

Stage B requires a production datastore and an abuse-resistant write API. The existing Express gateway and protocol modules are a development foundation, not a claim that the current public prototype is already a multi-user service.

### Later stages

The signed-note and Merkle modules can support future integrity and provenance work after a security review. They do not make the current application production cryptography, post-quantum cryptography, or blockchain infrastructure. The current signer remains explicitly `Ed25519-development-only`.

Biometric research belongs in a separate project boundary. If high-assurance authentication is ever needed, evaluate passkeys/WebAuthn and reviewed identity infrastructure independently from the anonymous Commons.

## Deployment verification checklist

Before calling a public URL live, verify that the deployment contains the repository application rather than a placeholder page:

1. The root page renders the Learning Commons Write view.
2. The Commons route renders the reading controls and idea map.
3. `biometric.html` is visibly labeled as a simulator and remains separate from the public identity model.
4. The deployed build has no sign-in or account requirement.
5. Browser-local persistence behaves as documented.
6. If the Express server is deployed, `/health`, `/commons`, `/snapshot`, and `POST /ingest` are tested separately from static hosting.

## Explicit non-goals

The wealth, trading, NFT, wallet, blockchain-ledger, quantum-entanglement, and biometric-authentication snippets included in the supplied material are not integrated into Learning Commons V1. They are treated as reference material only and must not be presented as live financial, identity, or security functionality.
