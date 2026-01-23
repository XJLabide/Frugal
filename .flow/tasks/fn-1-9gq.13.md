# fn-1-9gq.13 Enhance Upcoming Bills section on Dashboard

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Enhanced the Upcoming Bills section on Dashboard with bill reminder integration. Created BillReminderMonitor component that checks and sends reminders on dashboard load. Bills due within 3 days are highlighted with amber styling and urgency indicators (AlertTriangle for due today, BellRing for tomorrow, Bell for reminded status). Added badge counter showing number of urgent bills in the section header.
## Evidence
- Commits: 0fb8e6966f6d2ade1c5f2956909e49531e253df1
- Tests: npx tsc --noEmit, npm run lint
- PRs: