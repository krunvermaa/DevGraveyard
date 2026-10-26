# DECISIONS.md
_Append-only. Format: `D-<n> | date | owner | decision | reason | alternatives`._

D-1 | iter0 | Architect | Anonymous author uid stored in `graves_private` only | prevents deanonymisation via public reads | storing hashed uid (rejected: still linkable)
D-2 | iter0 | Architect | Counts via subcollections + getCountFromServer | keeps security rules simple/safe | counter fields (rejected: rule complexity)
D-3 | iter0 | Orchestrator | No Cloud Functions | free tier, hackathon speed | functions for account cleanup (out of scope)
