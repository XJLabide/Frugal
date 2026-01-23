"use client";

import { useState } from "react";
import { useTransfers } from "@/hooks/useTransfers";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ArrowRight, AlertCircle } from "lucide-react";

interface TransferFormProps {
    onSuccess: () => void;
}

export function TransferForm({ onSuccess }: TransferFormProps) {
    const { addTransfer } = useTransfers();
    const { accounts, loading: accountsLoading, hasAccounts, seedDefaults, getAccountBalance } = useAccounts();
    const { formatCurrency } = useCurrency();

    const [amount, setAmount] = useState("");
    const [fromAccountId, setFromAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);
    const fromBalance = fromAccountId ? getAccountBalance(fromAccountId) : 0;

    // Validate that source and destination are different
    const isSameAccount = fromAccountId && toAccountId && fromAccountId === toAccountId;
    // Validate sufficient funds
    const insufficientFunds = amount && fromAccountId && parseFloat(amount) > fromBalance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (isSameAccount) {
            setError("Source and destination accounts must be different");
            return;
        }

        if (insufficientFunds) {
            setError("Insufficient funds in source account");
            return;
        }

        setIsSubmitting(true);
        try {
            await addTransfer({
                amount: parseFloat(amount),
                fromAccountId,
                toAccountId,
                date,
                note: note || undefined,
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            setError("Failed to complete transfer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (accountsLoading) {
        return <p className="text-sm text-slate-500">Loading accounts...</p>;
    }

    if (!hasAccounts) {
        return (
            <div className="text-center py-6 space-y-4">
                <p className="text-sm text-slate-500">
                    You need at least two accounts to make a transfer.
                </p>
                <Button onClick={() => seedDefaults()}>
                    Add Default Accounts
                </Button>
            </div>
        );
    }

    if (accounts.length < 2) {
        return (
            <div className="text-center py-6 space-y-4">
                <p className="text-sm text-slate-500">
                    You need at least two accounts to make a transfer.
                    Please add another account in Settings.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            {/* From Account */}
            <div className="space-y-2">
                <label className="text-sm font-medium">From Account</label>
                <select
                    className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: isSameAccount || insufficientFunds ? '#ef4444' : 'var(--input-border)',
                        color: 'var(--input-text)',
                    }}
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    required
                >
                    <option value="">Select source account</option>
                    {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.name} ({formatCurrency(getAccountBalance(account.id))})
                        </option>
                    ))}
                </select>
                {fromAccount && (
                    <p className="text-xs text-slate-500">
                        Available balance: {formatCurrency(fromBalance)}
                    </p>
                )}
            </div>

            {/* Transfer Arrow Indicator */}
            <div className="flex justify-center py-2">
                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <ArrowRight className="h-5 w-5 text-indigo-500" />
                </div>
            </div>

            {/* To Account */}
            <div className="space-y-2">
                <label className="text-sm font-medium">To Account</label>
                <select
                    className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: isSameAccount ? '#ef4444' : 'var(--input-border)',
                        color: 'var(--input-text)',
                    }}
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    required
                >
                    <option value="">Select destination account</option>
                    {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.name} ({formatCurrency(getAccountBalance(account.id))})
                        </option>
                    ))}
                </select>
                {toAccount && amount && (
                    <p className="text-xs text-slate-500">
                        New balance after transfer: {formatCurrency(getAccountBalance(toAccountId) + parseFloat(amount || "0"))}
                    </p>
                )}
            </div>

            {/* Validation Messages */}
            {isSameAccount && (
                <p className="text-sm text-red-500">
                    Source and destination accounts must be different.
                </p>
            )}
            {insufficientFunds && (
                <p className="text-sm text-red-500">
                    Insufficient funds. You only have {formatCurrency(fromBalance)} available.
                </p>
            )}

            {/* Date */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            {/* Note */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Note (optional)</label>
                <Input
                    placeholder="e.g., Moving savings"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !fromAccountId || !toAccountId || !amount || isSameAccount || !!insufficientFunds}
            >
                {isSubmitting ? "Processing..." : "Transfer Funds"}
            </Button>
        </form>
    );
}
