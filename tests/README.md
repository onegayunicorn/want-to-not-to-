# Stage B test layout

The Stage B simulation tests live under this directory and use mock `Request` objects only.

| Directory | Intended coverage |
| --- | --- |
| `api/` | Payload and public-contract tests |
| `moderation/` | State-machine and rule tests |
| `anonymity/` | No-identity-field and session-isolation tests |
| `abuse/` | Rate limits, duplicates, and flooding tests |
| `e2e/` | Local flow simulations |

The current consolidated fixture is `stageb.test.mjs`; these directories reserve the future split without adding external dependencies.
