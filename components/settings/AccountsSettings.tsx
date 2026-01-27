"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Account, AccountType } from "@/types";
import { cn } from "@/lib/utils";
import {
    Wallet,
    Building2,
    Smartphone,
    CreditCard,
    CircleDollarSign,
    Plus,
    Pencil,
    Trash2,
    Star,
    Check,
} from "lucide-react";

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string; icon: string }[] = [
    { value: "cash", label: "Cash", icon: "Wallet" },
    { value: "bank", label: "Bank", icon: "Building2" },
    { value: "ewallet", label: "E-Wallet", icon: "Smartphone" },
    { value: "credit", label: "Credit Card", icon: "CreditCard" },
    { value: "other", label: "Other", icon: "CircleDollarSign" },
];

const ACCOUNT_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    Wallet,
    Building2,
    Smartphone,
    CreditCard,
    CircleDollarSign,
};

export function AccountsSettings() {
    const {
        accounts,
        loading,
        hasAccounts,
        addAccount,
        updateAccount,
        deleteAccount,
        setDefaultAccount,
        seedDefaults,
        getAccountBalance
    } = useAccounts();
    const { formatCurrency } = useCurrency();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
    const [accountForm, setAccountForm] = useState({
        name: "",
        type: "cash" as AccountType,
        startingBalance: 0,
        icon: "Wallet",
        color: "#22c55e",
    });

    const openModal = (account?: Account) => {
        if (account) {
            setEditingAccount(account);
            setAccountForm({
                name: account.name,
                type: account.type,
                startingBalance: account.startingBalance,
                icon: account.icon || "Wallet",
                color: account.color || "#22c55e",
            });
        } else {
            setEditingAccount(null);
            setAccountForm({
                name: "",
                type: "cash",
                startingBalance: 0,
                icon: "Wallet",
                color: "#22c55e",
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountForm.name.trim()) return;

        if (editingAccount) {
            await updateAccount(editingAccount.id, {
                name: accountForm.name,
                type: accountForm.type,
                startingBalance: accountForm.startingBalance,
                icon: accountForm.icon,
                color: accountForm.color,
            });
        } else {
            await addAccount({
                name: accountForm.name,
                type: accountForm.type,
                startingBalance: accountForm.startingBalance,
                icon: accountForm.icon,
                color: accountForm.color,
            });
        }
        setIsModalOpen(false);
    };

    const getAccountIcon = (iconName?: string) => {
        return ACCOUNT_ICONS[iconName || "Wallet"] || Wallet;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-indigo-500" />
                            Accounts
                        </div>
                        <Button size="sm" onClick={() => openModal()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!hasAccounts && !loading && (
                        <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 p-4 border border-indigo-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-lg">
                                    <Wallet className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">No accounts found</p>
                                    <p className="text-xs text-slate-500">Add default accounts to get started quickly</p>
                                </div>
                                <Button size="sm" onClick={() => seedDefaults()}>
                                    Add Defaults
                                </Button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <p className="text-sm text-slate-500">Loading accounts...</p>
                    ) : hasAccounts && (
                        <div className="space-y-3">
                            {accounts.map((account) => {
                                const IconComponent = getAccountIcon(account.icon);
                                const balance = getAccountBalance(account.id);
                                return (
                                    <div
                                        key={account.id}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div
                                                className="p-2 rounded-lg shrink-0 flex items-center justify-center"
                                                style={{ backgroundColor: account.color ? `${account.color}20` : '#e2e8f0', color: account.color || '#64748b' }}
                                            >
                                                <IconComponent className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold truncate">{account.name}</span>
                                                    {account.isDefault && (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shrink-0">
                                                            <Star className="h-3 w-3" />
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                                    {ACCOUNT_TYPE_OPTIONS.find(t => t.value === account.type)?.label || account.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                                            <span className={cn(
                                                "font-bold text-lg",
                                                balance >= 0 ? "text-slate-900 dark:text-white" : "text-red-600 dark:text-red-400"
                                            )}>
                                                {formatCurrency(balance)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {!account.isDefault && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                        onClick={() => setDefaultAccount(account.id)}
                                                        title="Set as default"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                    onClick={() => openModal(account)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={() => setDeleteAccountId(account.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAccount ? "Edit Account" : "Add Account"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Account Name</label>
                        <Input
                            value={accountForm.name}
                            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                            placeholder="e.g., Main Bank Account"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Account Type</label>
                        <select
                            className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--input-text)',
                            }}
                            value={accountForm.type}
                            onChange={(e) => {
                                const type = e.target.value as AccountType;
                                const typeOption = ACCOUNT_TYPE_OPTIONS.find(t => t.value === type);
                                setAccountForm({
                                    ...accountForm,
                                    type,
                                    icon: typeOption?.icon || "Wallet",
                                });
                            }}
                        >
                            {ACCOUNT_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Starting Balance</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={accountForm.startingBalance}
                            onChange={(e) => setAccountForm({ ...accountForm, startingBalance: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                        <p className="text-xs text-slate-500">
                            The initial balance when you start tracking this account
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={accountForm.color}
                                onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                                className="h-11 w-14 rounded-lg border-2 cursor-pointer"
                            />
                            <span className="text-sm text-slate-500">{accountForm.color}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingAccount ? "Save Changes" : "Add Account"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteAccountId}
                onClose={() => setDeleteAccountId(null)}
                onConfirm={async () => {
                    if (deleteAccountId) {
                        await deleteAccount(deleteAccountId);
                        setDeleteAccountId(null);
                    }
                }}
                title="Delete Account"
                message="Are you sure you want to delete this account? Transactions associated with this account will not be deleted but will no longer be linked to an account."
                confirmText="Delete Account"
            />
        </>
    );
}
