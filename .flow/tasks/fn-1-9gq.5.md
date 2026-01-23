# fn-1-9gq.5 Update currency formatting in lib/utils.ts

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Added CURRENCIES configuration object with support for PHP, USD, EUR, GBP, and JPY. Updated formatCurrency() and formatCurrencyWithSign() to accept an optional currencyCode parameter with PHP as default, handling JPY special case (no decimals).
## Evidence
- Commits: d22293509cd1c02ad43732076819c0a42482c7e0
- Tests: npx tsc --noEmit
- PRs: