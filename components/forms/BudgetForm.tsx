"use client";

import { useState } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AlertTriangle, Info } from "lucide-react";

interface BudgetFormProps {
    onSuccess: () => void;
}

export function BudgetForm({ onSuccess }: BudgetFormProps) {
    const { addBudget, overallAmount, remainingToAllocate, isOverAllocated, categoryBudgets } = useBudgets();
    const { categories } = useCategories();
    const { currencySymbol } = useCurrency();
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("all");
    const [loading, setLoading] = useState(false);

    const expenseCategories = categories.filter(c => c.type === "expense");

    // Check if this category already has a budget (handle 'all' case specifically if needed, but 'all' is in budget list usually)
    const existingBudget = categoryId === 'all'
        ? (overallAmount > 0 ? { amount: overallAmount } as any : undefined)
        : categoryBudgets.find(b => b.categoryId === categoryId);

    // Calculate if this new budget would exceed overall
    const parsedAmount = parseFloat(amount) || 0;
    const wouldExceed = categoryId !== 'all' && overallAmount > 0 && parsedAmount > remainingToAllocate;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addBudget({
                amount: parsedAmount,
                categoryId,
                month: "recurring", // Fixed value - budgets are recurring monthly
            });
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Budget Type Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Budget Type</label>
                <select
                    className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--input-text)',
                    }}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="all" disabled={!!overallAmount}>
                        {overallAmount > 0 ? "📊 Overall Monthly Limit (Set)" : "📊 Overall Monthly Limit"}
                    </option>
                    <optgroup label="Category Budgets">
                        {expenseCategories.map((cat) => {
                            const hasBudget = categoryBudgets.some(b => b.categoryId === cat.name);
                            return (
                                <option key={cat.id} value={cat.name} disabled={hasBudget}>
                                    {cat.name} {hasBudget ? "(Budget Set)" : ""}
                                </option>
                            );
                        })}
                    </optgroup>
                </select>
            </div>

            {/* Info about what this budget type means */}
            <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">
                        {categoryId === 'all'
                            ? "Set your maximum monthly spending limit. This applies every month."
                            : `Set a monthly limit for ${categoryId}. This counts towards your overall budget.`
                        }
                    </p>
                </div>
            </div>

            {/* Show allocation status when adding category budget */}
            {categoryId !== 'all' && overallAmount > 0 && (
                <div className={`rounded-lg p-3 text-sm ${isOverAllocated ? 'bg-red-50 dark:bg-red-950/20' : 'bg-green-50 dark:bg-green-950/20'}`}>
                    <p className={isOverAllocated ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}>
                        <strong>Remaining to allocate:</strong> {currencySymbol}{remainingToAllocate.toFixed(2)} of {currencySymbol}{overallAmount.toFixed(2)}
                    </p>
                </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    {categoryId === 'all' ? 'Monthly Spending Limit' : 'Monthly Category Budget'}
                </label>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            {/* Warning if exceeds overall */}
            {wouldExceed && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-amber-700 dark:text-amber-400">
                        This amount exceeds your remaining allocation by {currencySymbol}{(parsedAmount - remainingToAllocate).toFixed(2)}
                    </p>
                </div>
            )}

            {/* Existing budget warning */}
            {existingBudget && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-red-700 dark:text-red-400 font-medium">
                            A budget for {categoryId === 'all' ? 'Overall' : categoryId} already exists.
                        </p>
                        <p className="text-red-600 dark:text-red-500 mt-1">
                            Current limit: {currencySymbol}{existingBudget.amount.toFixed(2)}. You cannot add a duplicate budget.
                        </p>
                    </div>
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !!existingBudget}>
                {loading ? "Adding..." : categoryId === 'all' ? "Set Monthly Limit" : "Set Category Budget"}
            </Button>
        </form>
    );
}
