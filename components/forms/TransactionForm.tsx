"use client";

import { useState, useEffect } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { CategorySelector } from "./CategorySelector";
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

            <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Location / Account</label>
                <Input
                    placeholder="e.g. Starbucks, GCash"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <Input
                    placeholder="Optional note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !category}>
                {isSubmitting ? (editingTransaction ? "Saving..." : "Adding...") : (editingTransaction ? "Save Changes" : "Add Transaction")}
            </Button>
        </form>
    );
}
