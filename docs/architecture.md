# Learning Commons architecture

## Invariant

> The system publishes learning, not identity. People are anonymous; ideas are visible.

Learning Commons V1 is a browser-local, sign-in-free prototype. The existing root-level web application remains the source of truth for the private writing guide, local persistence, reading modes, and biometric simulator boundary.

## Safe Stage B shape

The staged backend is a deterministic simulation of a future Cloudflare Worker and D1 deployment. It accepts an original note, applies local validation and moderation rules, records no requester identity, and exposes only approved `{ id, note }` objects. It has no real Cloudflare bindings, external API keys, queues, accounts, wallets, blockchain, biometric sensors, or financial functionality.

| Boundary | Responsibility | Identity policy |
| --- | --- | --- |
| Private browser | Write, guide, local persistence | No account or profile |
| Staged submit handler | Validate, rate-limit, screen, deduplicate | Ephemeral mock bucket only |
| Mock note store | Hold simulated notes and moderation state | No requester foreign key |
| Public projection | Return approved learning | Only `{ id, note }` |
| Idea map helper | Assign deterministic idea-level position | No person-level input |
| Biometric simulator | Design rehearsal only | Separate dependency graph |

## Request flow

`private writing → user decision → simulated moderation boundary → anonymous note → public learning projection → idea-level map`

The default V1 experience remains local-only. The staged handler is for tests and architecture rehearsal, not public writes.

## Future migration boundary

A production implementation would need a separately reviewed deployment configuration, an actual D1 migration, expiring operational abuse controls, moderation operations, takedown controls, observability that excludes note content, and a threat-model review. None of those live services are enabled by this change.
