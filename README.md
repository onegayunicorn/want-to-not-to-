# Learning Commons

Learning Commons is an anonymous-by-design static prototype for sharing **what people learn, how they learn, how they deal with things, and ideas for dealing with things** without turning the public space into a social network.

> People are anonymous. Ideas are visible.

## Product interpretation

The supplied PDF and notes describe a practice of testing wants against needs, treating small mistakes as safe data, and converting reactions into observable learning. The interface therefore keeps the writer's original words intact while offering a quiet guide that asks for observations, methods, experiments, decisions, and ideas. It does not diagnose, moralize, or rewrite the entry.

The public object is intentionally content-only. There are no public names, avatars, profiles, follower counts, likes, popularity metrics, or author pages. The prototype includes the supplied learning note as its initial anonymous seed.

## Implemented experience

The app now includes a writing route with prompt chips, a 360-character counter, a local guidance pass, an explicit original-text guarantee, and browser-local anonymous persistence. The guide flags feeling-language gently and redirects toward what happened, what was noticed, what was learned, what was tried, and what could be tested next.

The Commons route supports three reading arrangements: **Crowd**, **Small crowd**, and **Single card**. Single card includes previous and next navigation and a lightweight reading-time indicator. The additional **Map / ideas** presentation renders notes as an organic idea field with conceptual proximity language, subtle relationship lines, zoom controls, reset behavior, and click-through to a single note. The map represents relationships between ideas, never relationships between people.

The visual system follows the supplied reference: warm ivory and cream surfaces, muted green accents, editorial serif typography, rounded tactile cards, restrained shadows, responsive layout, visible focus states, and reduced-motion support.

## Run locally

This is intentionally zero-dependency at runtime and can be opened directly in a modern browser. For local routing and smoke testing, serve the repository directory with any static HTTP server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Validation

The repository includes a small Node-based validation harness with no install step:

```bash
npm run check
npm test
```

`npm run check` validates browser-script syntax. `npm test` verifies the anonymous persistence boundary, writing-guide rules, all reading modes, idea-map affordances, accessible navigation, and reduced-motion styling.

## Production boundary

User-created notes currently persist only in each browser with `localStorage`. This makes the prototype runnable without credentials, but it is **not a multi-user production datastore**. A production release should replace the local persistence adapter with an authenticated and abuse-resistant write API plus a database while keeping the public read model content-only.

The server-side model should contain an opaque note ID, content, created timestamp, moderation state, an optional private ownership key that is never returned by public APIs, rate limiting, spam controls, and a moderation/audit pipeline. The public endpoint must not expose user identity fields, profile relationships, or author lookup routes.

## Public testing deployment

This repository is a plain static site: `index.html`, `styles.css`, `app.js`, and `app-core.mjs` are served directly, with `server.js` providing the optional Express API and static server. For a temporary public URL, connect the GitHub repository `onegayunicorn/want-to-not-to-` to either Vercel or Netlify. Both platforms can create a production URL and preview deployments for later branch or pull-request changes. Vercel documents automatic deployments for connected GitHub projects and preview URLs for pushes and pull requests [1]. Netlify documents Git-connected continuous deployment and confirms that manual static deploys do not run a build command [2].

| Platform | Recommended settings for this repository | Result |
|---|---|---|
| Vercel | Import `onegayunicorn/want-to-not-to-`; Framework preset **Other**; root directory `/`; leave the build command empty; output directory `.` or the repository root | Production deployment plus preview URLs for branch and pull-request changes |
| Netlify | Add a new site from Git; choose `onegayunicorn/want-to-not-to-`; base directory empty; build command empty; publish directory `.` | Production deployment plus Deploy Previews for pull requests |

### Vercel dashboard path

Open [Vercel](https://vercel.com/new), sign in with GitHub, choose **Import Third-Party Git Repository** or the GitHub repository selector, select `want-to-not-to-`, and deploy. Because the repository is already a static root site, do not add a framework build command. After the first deployment, pushes to the configured production branch update the production URL and pull requests receive preview URLs.

For a CLI-based deployment, install the Vercel CLI locally, authenticate, and run `vercel` from the repository root. Use `vercel --prod` only when you explicitly want to update the production URL; ordinary `vercel` deployments are safer for review previews.

### Netlify dashboard path

Open [Netlify](https://app.netlify.com/), choose **Add new site → Import an existing project**, authorize GitHub, select `want-to-not-to-`, leave the base directory and build command blank, set the publish directory to `.`, and choose **Deploy site**. Netlify will keep the site synchronized with Git pushes. Its **Deploy Previews** can be used to review pull requests before merging.

For a one-off public test without Git integration, use [Netlify Drop](https://app.netlify.com/drop) and upload a zip of the repository root. This is convenient for a disposable demo, but the Git-connected path is preferable because it keeps the public preview reproducible from the committed source.

### Important prototype limitation

The public URL will share the static application files, but notes will still be stored separately in each visitor's browser through `localStorage`. A note submitted by one tester will not appear for another tester. Shared multi-user notes require the production backend described above; do not treat the current public deployment as a networked datastore.

### References

[1]: https://vercel.com/docs/git/vercel-for-github "Deploying GitHub Projects with Vercel"
[2]: https://docs.netlify.com/deploy/create-deploys/ "Create deploys | Netlify Docs"


## Distributed protocol prototype

The repository now includes a dependency-free prototype of the account-less Learning Commons protocol. It keeps the public layer detached from names, accounts, biometrics, and social graphs while demonstrating cryptographic integrity and moderation boundaries.

| Layer | Location | Responsibility |
|---|---|---|
| Canonical note contract | `protocol/note.mjs` | Stable serialization, SHA-256 content hashes, note IDs, and schema validation. |
| Installation signer | `client/installation-signer.mjs` | Local key generation and signed-note creation using an Ed25519 development adapter. |
| Ingestion gateway | `gateway/ingestion.mjs` | Signature checks, timestamp windows, replay protection, moderation, deduplication, and Commons reads. |
| HTTP gateway | `gateway/server.mjs` | `GET /health`, `POST /ingest`, `GET /commons`, and `GET /snapshot`. |
| Provenance | `provenance/merkle.mjs` | Order-independent Merkle roots over approved note IDs; note content stays outside the ledger layer. |
| End-to-end simulation | `simulation/run-all.mjs` | Valid, replayed, tampered, stale, moderated, and snapshot scenarios. |

Run every check and simulation with:

```bash
npm run verify
```

Generate the Node coverage summary with:

```bash
npm run coverage
```

Start the integrated Express server with:

```bash
npm run dev
```

The dedicated safe biometric simulator is available at `/biometric.html`; it never accesses real sensors or stores biometric templates.

The current signer is explicitly marked `Ed25519-development-only`. It is a test adapter, not a production ML-DSA implementation. For a real deployment, replace it with a reviewed ML-DSA-65 library or use WebAuthn/passkeys for private administrative authentication, protect private keys with platform secure storage, and complete a security, privacy, moderation, and retention review. See `docs/note-schema.md` and `docs/production-boundary.md`.


## Local biometric simulator reference

The `simulator/` folder mirrors the supplied dark biometric-console reference as a **local simulation only**. `simulator/biometric-auth.mjs` models capture, quality, liveness, face-match, fingerprint-pad, denial, health, and console-log states without accessing a camera, fingerprint reader, face image, biometric template, or remote identity database.

Run the simulator independently with:

```bash
node simulator/run-biometric.mjs
```

The reference material also contains wealth, trading, NFT, wallet, and blockchain claims. Those are not treated as live financial functionality and are not connected to credentials, payments, exchanges, wallets, or real biometric authentication. The repository keeps the Learning Commons protocol and the biometric screen as deterministic demos with explicit security boundaries.


## V1 launch boundary

Learning Commons V1 is intentionally **sign-in-free, biometric-free, and blockchain-free**. The public path is: **open → write → private guide → optionally share → read the Commons**. There are no accounts, email or password flows, social logins, public profiles, followers, author lookup, wallet, or biometric identity features.

The current public prototype stores notes in each visitor's browser through `localStorage`; it is suitable for UX testing but is not yet a shared multi-user Commons. The Express gateway and signed-note modules are development foundations for a later anonymous-ingestion stage and must not be described as production cryptography or a production datastore.

The biometric console at `biometric.html` remains a separate simulator. It does not participate in the Learning Commons V1 identity model and does not access cameras, fingerprint hardware, biometric images, templates, or remote identity services.

Before calling a hosted URL live, verify that it serves this repository's actual `index.html`, `app.js`, and `styles.css`, rather than a placeholder page. See [`docs/v1-launch-plan.md`](docs/v1-launch-plan.md) for the staged deployment plan and verification checklist. The wealth, trading, NFT, wallet, quantum, and blockchain snippets in supplied reference material were not integrated as live functionality.
