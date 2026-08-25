# Learning Commons privacy model

Learning Commons is anonymous by design rather than account-based. The product prioritizes what was learned over who wrote it.

## Data locations

| Data | V1 location | Staged/global status |
| --- | --- | --- |
| Drafts and guide context | Browser local storage | Never sent automatically |
| User-approved original note | Browser until explicit share | Accepted only by the mock handler |
| Public note | None in V1 | In-memory staging record only |
| Abuse signal | Not used by V1 | Mock rate-limit bucket, expires and is not linked to notes |
| Identity/profile data | Not collected | Not supported |
| Biometric data | Separate simulator only | Never a dependency |

The public projection is exactly `{ id, note }`. It excludes author, IP, session, device, moderation details, internal timestamps, and request headers. A deterministic IP hash is not considered anonymous; the safe design does not persist one with a note.

## User control

Sharing is an explicit user action. The guide may ask questions about observable events, but it never rewrites the original words. A note that remains private is not part of the staged Commons.

## Retention boundary

The current staging store is process-local and has no durability. Any future durable store would require a documented retention period, deletion/takedown process, migration and backup plan, and an updated threat-model review.
