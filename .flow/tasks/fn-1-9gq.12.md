# fn-1-9gq.12 Create useBillReminders hook

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Created useBillReminders hook that checks recurring transactions against billReminderDays from user settings, tracks sent reminders in Firestore to prevent duplicates, and creates notifications when bills are due.
## Evidence
- Commits: 9eec8e195ce400d4f574b72d3cc8f876b05bd581
- Tests: npx eslint hooks/useBillReminders.ts
- PRs: