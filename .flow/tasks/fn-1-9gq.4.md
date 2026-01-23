# fn-1-9gq.4 Create useUserSettings hook for currency preference

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Created useUserSettings hook that stores currency preference and bill reminder settings in Firestore at users/{uid} document. Defaults to PHP currency with reminder days [1, 3, 7].
## Evidence
- Commits: b45eb6a5ce31f0ca2dbd6983bc3c20fc165c986e
- Tests: npx tsc --noEmit
- PRs: