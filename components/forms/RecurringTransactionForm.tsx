"use client";

import { useState, useEffect } from "react";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useCategories } from "@/hooks/useCategories";
import { CategorySelector } from "./CategorySelector";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionType, RecurringFrequency, RecurringTransaction } from "@/types";
import { format } from "date-fns";

interface RecurringTransactionFormProps {
    onSuccess: () => void;
    editingTransaction?: RecurringTransaction | null;
}

export function RecurringTransactionForm({ onSuccess, editingTransaction }: RecurringTransactionFormProps) {
    const { addRecurringTransaction, updateRecurringTransaction } = useRecurringTransactions();
    const { categories } = useCategories(); // Kept for filteredCategories logic if needed, or remove if unused

    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<TransactionType>("expense");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
    const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [note, setNote] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter categories by type (still needed for default category selection fallback)
    const filteredCategories = categories.filter(c => c.type === type);

    // Load editing data
    useEffect(() => {
        if (editingTransaction) {
            setName(editingTransaction.name);
            setAmount(editingTransaction.amount.toString());
            setType(editingTransaction.type);
            setCategory(editingTransaction.categoryId);
            setSubCategory(editingTransaction.subCategory || "");
            setFrequency(editingTransaction.frequency);
            setStartDate(editingTransaction.startDate);
            setNote(editingTransaction.note || "");
            setSelectedTags(editingTransaction.tags || []);
        }
    }, [editingTransaction]);

    // Reset subcategory when category changes (but preserve if loading edit data)
    useEffect(() => {
        if (!editingTransaction || editingTransaction.categoryId !== category) {
            setSubCategory("");
        }
    }, [category, editingTransaction]);

    // REMOVED: selectedCategoryData, availableSubCategories, handleSaveNewSub

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingTransaction) {
                await updateRecurringTransaction(editingTransaction.id, {
                    name,
                    amount: parseFloat(amount),
                    type,
                    categoryId: category || (filteredCategories[0]?.name || "Uncategorized"),
                    frequency,
                    startDate,
                    note,
                    subCategory: subCategory || undefined,
                    tags: selectedTags.length > 0 ? selectedTags : undefined,
                });
            } else {
                await addRecurringTransaction({
                    name,
                    amount: parseFloat(amount),
                    type,
                    categoryId: category || (filteredCategories[0]?.name || "Uncategorized"),
                    frequency,
                    startDate,
                    isActive: true,
                    note,
                    subCategory: subCategory || undefined,
                    tags: selectedTags.length > 0 ? selectedTags : undefined,
                });
            }
            onSuccess();
            // Reset form
            if (!editingTransaction) {
                setName("");
                setAmount("");
                setNote("");
                setSubCategory("");
                setSelectedTags([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
                <Button
                    type="button"
                    variant={type === "expense" ? "destructive" : "outline"}
                    className="w-full"
                    onClick={() => setType("expense")}
                >
                    Expense
                </Button>
                <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setType("income")}
                >
                    Income
                </Button>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                    placeholder="e.g. Netflix Subscription"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            <CategorySelector
                type={type}
                selectedCategory={category}
                selectedSubCategory={subCategory}
                onCategoryChange={setCategory}
                onSubCategoryChange={setSubCategory}
            />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <select
                        className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: 'var(--input-border)',
                            color: 'var(--input-text)',
                        }}
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <Input
                    placeholder="Optional note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            <TagInput
                selectedTagIds={selectedTags}
                onTagsChange={setSelectedTags}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (editingTransaction ? "Update Recurring Transaction" : "Add Recurring Transaction")}
            </Button>
        </form>
    );
}
