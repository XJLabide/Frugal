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
}

export function AccountSelector({
    selectedAccountId,
    onAccountChange,
    location,
    onLocationChange,
    required = false,
    label = "Account",
    showBalance = true,
}: AccountSelectorProps) {
    const { accounts, loading, hasAccounts, seedDefaults } = useAccounts();
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
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            {loading ? (
                <p className="text-sm text-slate-500">Loading accounts...</p>
            ) : !hasAccounts ? (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    No accounts found.{" "}
                    <button
                        type="button"
                        onClick={() => seedDefaults()}
                        className="underline font-bold hover:text-amber-800"
                    >
                        Add Default Accounts
                    </button>
                </div>
            ) : (
                <select
                    className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
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
                            {showBalance && ` (${formatCurrency(account.startingBalance)})`}
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
