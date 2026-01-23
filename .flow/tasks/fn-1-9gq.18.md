# fn-1-9gq.18 Implement Transfers between accounts

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Implemented account transfers feature: added Transfer interface to types, created useTransfers hook with Firestore integration (users/{uid}/transfers), built TransferForm component with source/destination account selection and validation (balance check, same-account prevention), and added Transfer button to dashboard. Transfers atomically create paired expense/income transactions for proper account balance tracking.
## Evidence
- Commits: 771b6054567cf854936e2809ffaeb2c772146037, 6f4422f64b8e2403c45c0b00bf8bff9be6ed50ff
- Tests: npm run build
- PRs: