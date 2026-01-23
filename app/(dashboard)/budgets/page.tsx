"use client";

import { useState } from "react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, AlertTriangle, Target, Wallet, PieChart, Pencil, ChevronDown, ChevronUp, GripVertical, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BudgetForm } from "@/components/forms/BudgetForm";
import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Budget } from "@/types";
import { MonthYearPicker } from "@/components/ui/month-year-picker";

export default function BudgetsPage() {
    const { currencySymbol } = useCurrency();
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const selectedMonthKey = format(selectedMonth, "yyyy-MM");
    const {
        loading: budgetsLoading,
        deleteBudget,
        updateBudget,
        overallBudget,
        overallAmount,
        categoryBudgets,
        totalAllocated,
        remainingToAllocate,
        isOverAllocated
    } = useBudgets();
    const { categories, updateCategory } = useCategories();
    const { transactions, renameSubcategory } = useTransactions();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Check if we are checking "overall" or a specific category budget
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [editAmount, setEditAmount] = useState("");

    // Subcategory management state
    const [editSubcategories, setEditSubcategories] = useState<string[]>([]);
    const [newSubcategory, setNewSubcategory] = useState("");
    const [editingSubIndex, setEditingSubIndex] = useState<number | null>(null);
    const [editingSubValue, setEditingSubValue] = useState("");
    const [renames, setRenames] = useState<Record<string, string>>({}); // oldName -> newName

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [expandedBudgets, setExpandedBudgets] = useState<Record<string, boolean>>({});

    const handleDelete = async () => {
        if (deleteId) {
            await deleteBudget(deleteId);
            setDeleteId(null);
        }
    };

    // Calculate spending per category for the selected month
    const spendingMap: Record<string, number> = {};
    const subSpendingMap: Record<string, Record<string, number>> = {};
    let totalSpending = 0;

    transactions.forEach(t => {
        if (t.date.startsWith(selectedMonthKey) && t.type === 'expense') {
            spendingMap[t.categoryId] = (spendingMap[t.categoryId] || 0) + t.amount;
            totalSpending += t.amount;

            if (t.subCategory) {
                if (!subSpendingMap[t.categoryId]) subSpendingMap[t.categoryId] = {};
                subSpendingMap[t.categoryId][t.subCategory] = (subSpendingMap[t.categoryId][t.subCategory] || 0) + t.amount;
            }
        }
    });

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return "bg-red-500";
        if (percentage >= 80) return "bg-amber-500";
        return "bg-green-500";
    };

    const getStatusLabel = (percentage: number) => {
        if (percentage >= 100) return { text: "Over Budget", color: "text-red-600 bg-red-50 dark:bg-red-950/30" };
        if (percentage >= 80) return { text: "Almost There", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" };
        return { text: "On Track", color: "text-green-600 bg-green-50 dark:bg-green-950/30" };
    };

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setEditAmount(budget.amount.toString());

        // Find category to get current subcategories
        if (budget.categoryId !== 'all') {
            const budgetCategory = categories.find(c => c.name === budget.categoryId);
            setEditSubcategories(budgetCategory?.subCategories || []);
        } else {
            setEditSubcategories([]);
        }
        setNewSubcategory("");
        setEditingSubIndex(null);
        setRenames({});
    };

    const toggleExpand = (budgetId: string) => {
        setExpandedBudgets(prev => ({
            ...prev,
            [budgetId]: !prev[budgetId]
        }));
    };

    const handleSaveEdit = async () => {
        if (editingBudget && editAmount) {
            // Update budget amount
            await updateBudget(editingBudget.id, parseFloat(editAmount));

            // Update subcategories if it's a category budget (not overall)
            if (editingBudget.categoryId !== 'all') {
                const budgetCategory = categories.find(c => c.name === editingBudget.categoryId);
                if (budgetCategory) {
                    await updateCategory(budgetCategory.id, {
                        subCategories: editSubcategories
                    });

                    // Process renames for existing transactions
                    for (const [oldName, newName] of Object.entries(renames)) {
                        if (oldName !== newName) {
                            await renameSubcategory(editingBudget.categoryId, oldName, newName);
                        }
                    }
                }
            }

            setEditingBudget(null);
            setEditAmount("");
            setRenames({});
        }
    };

    const addSubcategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubcategory && !editSubcategories.includes(newSubcategory)) {
            setEditSubcategories([...editSubcategories, newSubcategory]);
            setNewSubcategory("");
        }
    };

    const removeSubcategory = (sub: string, index: number) => {
        const newSubs = [...editSubcategories];
        newSubs.splice(index, 1);
        setEditSubcategories(newSubs);
    };

    const startEditingSub = (sub: string, index: number) => {
        setEditingSubIndex(index);
        setEditingSubValue(sub);
    };

    const saveEditingSub = (index: number) => {
        if (editingSubValue.trim() && editingSubIndex !== null) {
            const oldName = editSubcategories[index];
            const newName = editingSubValue.trim();

            if (oldName !== newName) {
                const newSubs = [...editSubcategories];
                newSubs[index] = newName;
                setEditSubcategories(newSubs);

                // Track rename
                setRenames(prev => ({
                    ...prev,
                    [oldName]: newName
                }));
            }
            setEditingSubIndex(null);
            setEditingSubValue("");
        }
    };

    const overallSpentPercentage = overallAmount > 0 ? (totalSpending / overallAmount) * 100 : 0;
    const allocationPercentage = overallAmount > 0 ? (totalAllocated / overallAmount) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Budgets</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Set monthly spending limits and track your progress
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Month selector for viewing spending */}
                    <div className="flex items-center gap-2 flex-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0"
                            onClick={() => setSelectedMonth(prev => subMonths(prev, 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <MonthYearPicker
                            date={selectedMonth}
                            onChange={setSelectedMonth}
                            className="flex-1 sm:w-[160px] sm:flex-none shrink-0"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0"
                            onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="group w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                        Set Budget
                    </Button>
                </div>
            </div>

            {/* Overall Budget Card - The Main Limit */}
            <Card className="overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Monthly Spending Limit</p>
                                {budgetsLoading ? (
                                    <div className="h-9 w-32 bg-white/20 rounded animate-pulse mt-1" />
                                ) : (
                                    <p className="text-3xl font-bold">
                                        {overallAmount > 0 ? `${currencySymbol}${overallAmount.toFixed(2)}` : "Not Set"}
                                    </p>
                                )}
                            </div>
                        </div>
                        {overallBudget && !budgetsLoading && (
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/70 hover:text-white hover:bg-white/20"
                                    onClick={() => handleEdit(overallBudget)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/70 hover:text-white hover:bg-white/20"
                                    onClick={() => deleteBudget(overallBudget.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {overallAmount > 0 && (
                        <>
                            {/* Spending Progress */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-80">Spent in {format(selectedMonth, "MMMM yyyy")}</span>
                                    <span className="font-medium">{currencySymbol}{totalSpending.toFixed(2)} ({Math.round(overallSpentPercentage)}%)</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700",
                                            overallSpentPercentage >= 100 ? "bg-red-300" : "bg-white"
                                        )}
                                        style={{ width: `${Math.min(overallSpentPercentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Allocation Progress */}
                            <div className="space-y-2 border-t border-white/20 pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-80">Allocated to categories</span>
                                    <span className={cn("font-medium", isOverAllocated && "text-amber-200")}>
                                        {currencySymbol}{totalAllocated.toFixed(2)} ({Math.round(allocationPercentage)}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700",
                                            isOverAllocated ? "bg-amber-300" : "bg-white/60"
                                        )}
                                        style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                                    />
                                </div>
                                {isOverAllocated && (
                                    <p className="text-amber-200 text-sm flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        Over-allocated by {currencySymbol}{(totalAllocated - overallAmount).toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {!overallBudget && !budgetsLoading && (
                        <p className="text-white/80 text-sm mt-2">
                            Set a monthly spending limit to track your overall budget
                        </p>
                    )}
                </div>
            </Card>

            {/* Category Budgets Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold">Category Budgets</h3>
                    {categoryBudgets.length > 0 && (
                        <span className="text-sm text-slate-500">
                            ({categoryBudgets.length} categories)
                        </span>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {categoryBudgets.map(budget => {
                        const spent = spendingMap[budget.categoryId] || 0;
                        const percentage = (spent / budget.amount) * 100;
                        const status = getStatusLabel(percentage);

                        return (
                            <Card key={budget.id} className="group">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2.5 rounded-xl text-white",
                                                getProgressColor(percentage)
                                            )}>
                                                <Target className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{budget.categoryId}</h4>
                                                <span className={cn(
                                                    "text-xs font-medium px-2 py-0.5 rounded-full",
                                                    status.color
                                                )}>
                                                    {status.text}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                                onClick={() => handleEdit(budget)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                onClick={() => setDeleteId(budget.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xl font-bold">{currencySymbol}{spent.toFixed(2)}</span>
                                            <span className="text-sm text-slate-500">of {currencySymbol}{budget.amount.toFixed(2)}</span>
                                        </div>

                                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700",
                                                    getProgressColor(percentage)
                                                )}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            {/* Subcategories Breakdown Toggle */}
                                            <button
                                                onClick={() => toggleExpand(budget.id)}
                                                className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                {expandedBudgets[budget.id] ? (
                                                    <><ChevronUp className="h-3 w-3 mr-1" /> Hide Breakdown</>
                                                ) : (
                                                    <><ChevronDown className="h-3 w-3 mr-1" /> View Breakdown</>
                                                )}
                                            </button>

                                            <p className="text-right text-xs text-slate-500">
                                                {Math.round(percentage)}% used
                                            </p>
                                        </div>

                                        {/* Breakdown Content */}
                                        {expandedBudgets[budget.id] && (
                                            <div className="mt-3 space-y-2 pl-2 border-l-2 border-slate-100 dark:border-slate-800">
                                                {categories.find(c => c.name === budget.categoryId)?.subCategories?.map(sub => {
                                                    const subSpent = subSpendingMap[budget.categoryId]?.[sub] || 0;
                                                    return (
                                                        <div key={sub} className="flex justify-between text-xs">
                                                            <span className="text-slate-600 dark:text-slate-400">{sub}</span>
                                                            <span className="font-medium">{currencySymbol}{subSpent.toFixed(2)}</span>
                                                        </div>
                                                    );
                                                })}
                                                {(!categories.find(c => c.name === budget.categoryId)?.subCategories?.length) && (
                                                    <p className="text-xs text-slate-400 italic">No subcategories defined</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {categoryBudgets.length === 0 && !budgetsLoading && (
                        <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-3">
                                <Target className="h-6 w-6 text-slate-400" />
                            </div>
                            <h4 className="font-medium mb-1">No category budgets</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                {overallAmount > 0
                                    ? `Allocate your ${currencySymbol}${overallAmount.toFixed(2)} limit to specific categories`
                                    : "Set an overall limit first, then allocate to categories"
                                }
                            </p>
                            {overallAmount > 0 && (
                                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                                    <Plus className="mr-1 h-4 w-4" /> Add Category Budget
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* New Budget Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Set Budget"
            >
                <BudgetForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>

            {/* Edit Budget Modal */}
            <Modal
                isOpen={!!editingBudget}
                onClose={() => { setEditingBudget(null); setEditAmount(""); }}
                title={`Edit ${editingBudget?.categoryId === 'all' ? 'Overall Budget' : editingBudget?.categoryId}`}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Budget Limit</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500 font-bold">{currencySymbol}</span>
                            <Input
                                type="number"
                                step="0.01"
                                className="pl-8"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {editingBudget?.categoryId !== 'all' && (
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-sm font-medium flex items-center gap-2">
                                Subcategories
                                <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    {editSubcategories.length}
                                </span>
                            </label>

                            <form onSubmit={addSubcategory} className="flex gap-2">
                                <Input
                                    placeholder="Add subcategory (e.g. Taxi)"
                                    value={newSubcategory}
                                    onChange={(e) => setNewSubcategory(e.target.value)}
                                    className="h-9 text-sm"
                                />
                                <Button type="submit" size="sm" variant="outline" disabled={!newSubcategory}>
                                    Add
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {editSubcategories.map((sub, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg text-sm group">
                                        <div className="flex items-center gap-2 flex-1">
                                            <GripVertical className="h-3 w-3 text-slate-300 cursor-move" />
                                            {editingSubIndex === idx ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        value={editingSubValue}
                                                        onChange={(e) => setEditingSubValue(e.target.value)}
                                                        className="h-7 text-sm py-0 px-2"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                saveEditingSub(idx);
                                                            }
                                                        }}
                                                        onBlur={() => saveEditingSub(idx)}
                                                    />
                                                </div>
                                            ) : (
                                                <span
                                                    className="cursor-pointer hover:text-indigo-600 transition-colors w-full"
                                                    onClick={() => startEditingSub(sub, idx)}
                                                    title="Click to edit"
                                                >
                                                    {sub}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeSubcategory(sub, idx)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {editSubcategories.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-2 italic">
                                        No subcategories yet. Add one above.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <Button onClick={handleSaveEdit} className="w-full" disabled={!editAmount}>
                        Save Changes
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Budget"
                message="Are you sure you want to delete this budget? This action cannot be undone."
                confirmText="Delete"
            />
        </div>
    );
}
