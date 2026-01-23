# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint
npm test          # Run Vitest tests
npm run test:watch # Run tests in watch mode
```

## Architecture

### Tech Stack
- **Next.js 16** with App Router, React 19, TypeScript
- **TailwindCSS v4** for styling
- **Firebase**: Firestore (database) + Auth (authentication)
- **Zustand** for global auth state
- **Recharts** for data visualization

### Data Layer

All data is stored in Firestore under `users/{userId}/`:
- `transactions` - Income/expense entries
- `categories` - User-defined categories with subcategories
- `budgets` - Monthly budget limits (overall or per-category)
- `goals` - Savings goals with progress tracking
- `recurring_transactions` - Auto-generated bills/income
- `tags` - Custom labels for transactions
- `accounts` - Bank/wallet accounts with balances
- `transfers` - Money transfers between accounts
- `notifications` - In-app notifications
- `budget_alerts` - Tracks which budget alerts have been sent
- `bill_reminders` - Tracks which bill reminders have been sent

User settings (currency, reminder preferences) are stored on the `users/{userId}` document itself.

### Hook Pattern

All Firebase data access uses custom hooks in `hooks/` with real-time `onSnapshot` listeners. Each hook:
- Gets `user` from `useAuthStore`
- Returns `{ data, loading, ...mutations }`
- Handles auth state (returns empty when no user)

Key hooks: `useTransactions`, `useBudgets`, `useCategories`, `useGoals`, `useRecurringTransactions`, `useTags`, `useAccounts`, `useNotifications`, `useUserSettings`

### Contexts

- **CurrencyContext** (`contexts/CurrencyContext.tsx`): Provides `useCurrency()` hook for dynamic currency formatting based on user preference
- **NotificationProvider** (`components/NotificationProvider.tsx`): Provides `useToast()` hook for toast notifications

### Route Structure

- `app/(auth)/` - Login/signup pages (public)
- `app/(dashboard)/` - Protected routes with shared layout (sidebar + header)
  - `/` - Dashboard with stats, charts, upcoming bills
  - `/transactions` - Transaction list with filters
  - `/budgets` - Budget management
  - `/goals` - Savings goals
  - `/analytics` - Spending charts
  - `/settings` - User preferences, categories, accounts

### Type Definitions

All interfaces are in `types/index.ts`: Transaction, Category, Budget, Goal, RecurringTransaction, Tag, Account, Transfer, Notification, UserSettings

### Utilities

`lib/utils.ts` exports:
- `cn()` - Tailwind class merger
- `formatCurrency(amount, currencyCode)` - Currency formatting
- `CURRENCIES` - Supported currency config (PHP, USD, EUR, GBP, JPY)

### Component Patterns

- Forms in `components/forms/` (TransactionForm, BudgetForm, GoalForm, TagInput, AccountSelector)
- Base UI in `components/ui/` (Button, Input, Card, Modal, Toast)
- Charts in `components/charts/`
- Alert monitors (`BudgetAlertMonitor`, `BillReminderMonitor`) run in dashboard layout to check thresholds on load
