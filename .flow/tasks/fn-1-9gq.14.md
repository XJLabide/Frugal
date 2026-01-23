# fn-1-9gq.14 Create Account types and useAccounts hook

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Added Account types (AccountType union, Account interface) and accountId to Transaction in types/index.ts. Created useAccounts hook with Firestore integration (users/{uid}/accounts) including CRUD operations, setDefaultAccount, and seedDefaults with Cash, Bank, E-Wallet presets.
## Evidence
- Commits: 30ecc2919e0a2708873670bbcff84b1fbd2d99da
- Tests: npx tsc --noEmit
- PRs: