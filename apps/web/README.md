# Web application boundary

The current Learning Commons frontend lives at the repository root and remains the V1 source of truth. This directory records the planned extraction boundary for `write`, `commons`, `map`, `cards`, and `guide` modules without duplicating or replacing the verified browser-local app.

Any future global-share control must be explicit, opt-in, and disabled by default. It must preserve the original note text and communicate that the Stage B handler is only a local simulation until a separate production review approves a shared backend.

The biometric simulator remains outside this dependency graph.
