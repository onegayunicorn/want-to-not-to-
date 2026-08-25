# Moderation policy (staging)

The Stage B implementation is a local simulation of moderation behavior. It is not a substitute for a staffed moderation process and must not be treated as permission to open public writes.

## States

| State | Meaning | Publicly readable in staging |
| --- | --- | --- |
| `pending` | Reserved for a future queue-driven workflow | No |
| `approved` | Passed the basic deterministic rules | Yes, as `{ id, note }` |
| `rejected` | Clear spam or invalid content signal | No |
| `flagged` | Requires safety review | No |

The current fixture marks ordinary learning notes approved, rejects obvious links and repeated-character flooding, and flags a small set of safety-sensitive terms. These are deliberately narrow mock rules intended for tests.

## Principles

The system preserves the original note text. It does not rewrite content to make it pass moderation, and the private conversational guide is not part of the public note object. A future operational system would need transparent policy, appeal/takedown handling, reviewer access controls, retention limits, and audit procedures.
