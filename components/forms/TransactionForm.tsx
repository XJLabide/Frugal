"use client";

import { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { CategorySelector } from "./CategorySelector";
import { TagInput } from "./TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction, TransactionType } from "@/types";
import { format } from "date-fns";

interface TransactionFormProps {
    onSuccess: () => void;
    editingTransaction?: Transaction;
}

export function TransactionForm({ onSuccess, editingTransaction }: TransactionFormProps) {
    const { addTransaction, updateTransaction } = useTransactions();
    const { categories } = useCategories(); // Kept for filteredCategories logic fallback

    const [amount, setAmount] = useState(editingTransaction?.amount.toString() || "");
    const [type, setType] = useState<TransactionType>(editingTransaction?.type || "expense");
    const [category, setCategory] = useState(editingTransaction?.categoryId || "");
    const [subCategory, setSubCategory] = useState(editingTransaction?.subCategory || "");
    const [date, setDate] = useState(editingTransaction?.date || format(new Date(), "yyyy-MM-dd"));
    const [note, setNote] = useState(editingTransaction?.note || "");
    const [location, setLocation] = useState(editingTransaction?.location || "");
    const [selectedTags, setSelectedTags] = useState<string[]>(editingTransaction?.tags || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter categories by type (still needed for default category selection fallback)
    const filteredCategories = categories.filter(c => c.type === type);

    useEffect(() => {
        // Only auto-select first category if not editing
        if (!editingTransaction && filteredCategories.length > 0 && !filteredCategories.find(c => c.name === category)) {
            setCategory(filteredCategories[0].name);
        } else if (filteredCategories.length === 0) {
            setCategory("");
        }
    }, [type, categories, editingTransaction, category, filteredCategories]);

    // Reset subcategory when category changes
    useEffect(() => {
        if (!editingTransaction || editingTransaction.categoryId !== category) {
            setSubCategory("");
        }
    }, [category, editingTransaction]);

    // REMOVED: selectedCategoryData, availableSubCategories

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const transactionData = {
                amount: parseFloat(amount),
                type,
                categoryId: category,
                date,
                note,
                location,
                subCategory: subCategory || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
            };

            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, transactionData);
            } else {
                await addTransaction(transactionData);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Type Toggle - More compact */}
            <div className="flex space-x-2">
                <Button
                    type="button"
                    variant={type === "expense" ? "destructive" : "outline"}
                    className="w-full h-9 sm:h-10 text-sm"
                    onClick={() => setType("expense")}
                >
                    Expense
                </Button>
                <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    className="w-full h-9 sm:h-10 text-sm"
                    onClick={() => setType("income")}
                >
                    Income
                </Button>
            </div>

            {/* Amount - Prominent field */}
            <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium">Amount</label>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-10 sm:h-11 text-base"
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

            {/* Date and Location - Side by side on mobile to save space */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Date</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-9 sm:h-11 text-sm"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Location</label>
                    <Input
                        placeholder="GCash, etc."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-9 sm:h-11 text-sm"
                    />
                </div>
            </div>

            {/* Note - Compact */}
            <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium">Note <span className="text-slate-400 font-normal">(optional)</span></label>
                <Input
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-9 sm:h-11 text-sm"
                />
            </div>

            <TagInput
                selectedTagIds={selectedTags}
                onTagsChange={setSelectedTags}
            />

            <Button type="submit" className="w-full h-10 sm:h-11 mt-2" disabled={isSubmitting || !category}>
                {isSubmitting ? (editingTransaction ? "Saving..." : "Adding...") : (editingTransaction ? "Save Changes" : "Add Transaction")}
            </Button>
        </form>
    );
}
