# fn-1-9gq.7 Create Notification types and useNotifications hook

## Description
TBD

## Acceptance
- [ ] TBD

## Done summary
Added Notification types (NotificationType, Notification) to types/index.ts and created useNotifications hook with Firestore real-time subscription at users/{uid}/notifications. Hook provides addNotification, markAsRead, markAllAsRead, deleteNotification methods and computed unreadCount.
## Evidence
- Commits: 6450bc918581283b0efc9f792387a5ce256adfc8
- Tests: npx tsc --noEmit
- PRs: