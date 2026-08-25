# Stage B API contract (simulation)

The repository contains a local-only Worker-shaped handler at `backend-staging/src/worker.mjs`. It is a test fixture and architecture reference. It does not connect to Cloudflare, a database, a queue, an embedding provider, or any external service.

## `POST /submit`

Request body:

```json
{
  "note": "What I learned from trying again.",
  "concepts": ["trying again"]
}
```

The `note` value is required, trimmed, and limited to 360 characters. Identity fields such as `author`, `ip`, `session`, or `device` are rejected. Concept hints are optional and are used only by the deterministic idea-position helper.

Successful approval returns a simulated submission identifier and the public projection:

```json
{
  "id": "sim-opaque-id",
  "state": "approved",
  "note": { "id": "sim-opaque-id", "note": "What I learned from trying again." }
}
```

A duplicate returns `409`; a malformed or identity-bearing payload returns `400`; a basic spam rejection returns `422`; and a rate-limit rejection returns `429`.

## `GET /notes`

Returns approved notes only, in the public shape:

```json
[
  { "id": "sim-opaque-id", "note": "What I learned from trying again." }
]
```

## `GET /notes/:id`

Returns one approved `{ id, note }` object. Rejected, flagged, or unknown records return `404`.

## `GET /health`

Returns `{ "ok": true, "mode": "simulation" }` to make the non-connected boundary explicit.

## Not part of this API

There are no authentication routes, profiles, followers, payment routes, wallet routes, NFT routes, trading routes, biometric routes, or blockchain routes. Those concerns are intentionally excluded from Learning Commons.
