# fn-1-9gq.6 Add Currency selector to Settings page with CurrencyContext

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Added CurrencyContext provider to share currency settings across the application, and added a Currency selector dropdown to the Settings page. Updated all dashboard pages and components to use the useCurrency() hook instead of hardcoded currency symbols.
## Evidence
- Commits: b3156325f3805ae3556931bce43fe688dbeb4311
- Tests: npm run build
- PRs: