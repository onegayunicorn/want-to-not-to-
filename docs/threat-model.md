# Learning Commons threat model

The primary privacy objective is to prevent the shared object from becoming a proxy for the person who submitted it. The system therefore treats request-level abuse signals and public learning content as separate domains.

| Risk | Why it matters | Safe design response |
| --- | --- | --- |
| Timing correlation | A small population may make submission time distinctive | Public projections omit timestamps; ordering is not an identity signal |
| IP or device correlation | Hashing can still create a pseudonymous identifier | Any abuse bucket is operational, short-lived, and never attached to a note |
| Distinctive writing | Content itself may reveal a person | User decides what leaves private storage; moderation and takedown are required before public launch |
| Duplicate flooding | Repeated payloads can consume moderation capacity | Content hashes reject duplicates in the simulation |
| Link or repetition spam | Links and repeated characters can be automated abuse signals | Deterministic mock rules reject them |
| Sensitive content | Safety risks can require review | Safety terms are flagged rather than published automatically |
| Map inference | Clustering could accidentally model people | Positioning accepts only note text and concept hints; no identity fields exist |
| Logging leakage | Logs can expose text or headers | Production design must use health-focused logs and exclude note content |

## Non-goals

This threat model does not claim anonymity against every external observer. It defines a minimal safe boundary for the local prototype and makes the risks that require a production review explicit.

## Launch rule

No global anonymous write feature should be enabled until moderation, takedown, retention, abuse controls, restricted CORS, security headers, operational logging review, migration/backup procedures, and cross-session tests are approved together.
