"use client";

import {
    AppearanceSettings,
    CurrencySettings,
    AccountsSettings,
    BillReminderSettings,
    RecurringTransactionsSettings,
    CategoriesSettings,
    ResetSettings,
} from "@/components/settings";

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                    Customize your Frugal experience
                </p>
            </div>

            <AppearanceSettings />
            <CurrencySettings />
            <AccountsSettings />
            <BillReminderSettings />
            <RecurringTransactionsSettings />
            <CategoriesSettings />
            <ResetSettings />
        </div>
    );
}
