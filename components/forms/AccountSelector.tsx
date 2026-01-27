"use client";

import { useAccounts } from "@/hooks/useAccounts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Account } from "@/types";

interface AccountSelectorProps {
    selectedAccountId?: string;
    onAccountChange: (accountId: string) => void;
    /** @deprecated Use selectedAccountId instead. Kept for backwards compatibility. */
    location?: string;
    /** @deprecated Use onAccountChange instead. Kept for backwards compatibility. */
    onLocationChange?: (location: string) => void;
    required?: boolean;
    label?: string;
    showBalance?: boolean;
    /** Use compact styling to match other form fields */
    compact?: boolean;
}

export function AccountSelector({
    selectedAccountId,
    onAccountChange,
    location,
    onLocationChange,
    required = false,
    label = "Account",
    showBalance = true,
    compact = false,
}: AccountSelectorProps) {
    const { accounts, loading, hasAccounts, seedDefaults, getAccountBalance } = useAccounts();
    const { formatCurrency } = useCurrency();

    // Support backwards compatibility: if using legacy location prop, convert to account selection
    const effectiveAccountId = selectedAccountId || (location ? findAccountIdByName(accounts, location) : undefined);

    const handleChange = (value: string) => {
        onAccountChange(value);

        // Also call onLocationChange for backwards compatibility if provided
        if (onLocationChange) {
            const account = accounts.find(a => a.id === value);
            if (account) {
                onLocationChange(account.name);
            }
        }
    };

    return (
        <div className={compact ? "space-y-1.5" : "space-y-2"}>
            <label className={compact ? "text-xs sm:text-sm font-medium" : "text-sm font-medium"}>
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {loading ? (
                <div 
                    className={`flex items-center ${compact ? "h-9 sm:h-11" : "h-11"} w-full rounded-xl border-2 px-3`}
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
                        <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                    </div>
                </div>
            ) : !hasAccounts ? (
                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 p-2 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                    No accounts found.{" "}
                    <button
                        type="button"
                        onClick={() => seedDefaults()}
                        className="underline font-bold hover:text-amber-800 dark:hover:text-amber-300"
                    >
                        Add Default Accounts
                    </button>
                </div>
            ) : (
                <select
                    className={`flex ${compact ? "h-9 sm:h-11 text-sm" : "h-11 text-sm"} w-full rounded-xl border-2 px-3 py-2 transition-all focus:ring-2 focus:ring-indigo-500/20`}
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--input-text)',
                    }}
                    value={effectiveAccountId || ""}
                    onChange={(e) => handleChange(e.target.value)}
                    required={required}
                >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.name}
                            {showBalance && ` (${formatCurrency(getAccountBalance(account.id))})`}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}

/**
 * Helper to find account ID by name for backwards compatibility
 */
function findAccountIdByName(accounts: Account[], name: string): string | undefined {
    const account = accounts.find(a => a.name.toLowerCase() === name.toLowerCase());
    return account?.id;
}
