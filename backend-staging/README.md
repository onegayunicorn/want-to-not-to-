# Backend staging

This directory contains a safe, deterministic rehearsal of the future shared Commons boundary. It is intentionally non-connected: the Worker-shaped handler uses an in-memory store, the rate limiter uses an expiring in-memory map, and moderation/map logic is local JavaScript.

Run the repository tests with `npm test`. The handler can be imported from `src/worker.mjs` and exercised with standard `Request` objects. No Cloudflare account, D1 database, API key, queue, embedding service, wallet, blockchain, biometric sensor, or identity provider is required.

The SQL migration is a schema draft only. Do not apply it to a live datastore without a separate privacy, security, moderation, and operations review.
