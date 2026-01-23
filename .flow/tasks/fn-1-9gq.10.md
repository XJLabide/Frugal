# fn-1-9gq.10 Integrate budget alerts into Dashboard layout

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Integrated budget alerts into Dashboard layout by creating BudgetAlertMonitor component that runs on app load to check budget thresholds and show toast notifications. Also updated NotificationBell to navigate to /budgets when a budget_alert notification is clicked.
## Evidence
- Commits: dfc298aa0ce70169c14a454476d46645b1d0a9ab
- Tests: npm run build
- PRs: