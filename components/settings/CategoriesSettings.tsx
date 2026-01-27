"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useCategories";
import { Tags, Plus, Trash2 } from "lucide-react";

export function CategoriesSettings() {
    const { categories, addCategory, deleteCategory, seedDefaults, hasCategories, loading } = useCategories();
    const [newCatName, setNewCatName] = useState("");
    const [newCatType, setNewCatType] = useState<"income" | "expense">("expense");

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName) return;
        await addCategory({
            name: newCatName,
            type: newCatType,
            color: newCatType === "income" ? "#22c55e" : "#ef4444",
            isDefault: false
        });
        setNewCatName("");
    };

    const expenseCategories = categories.filter(c => c.type === "expense");
    const incomeCategories = categories.filter(c => c.type === "income");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tags className="h-5 w-5 text-indigo-500" />
                    Categories
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {!hasCategories && !loading && (
                    <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-teal-500/10 p-4 border border-indigo-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500 rounded-lg">
                                <Tags className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">No categories found</p>
                                <p className="text-xs text-slate-500">Add default categories to get started quickly</p>
                            </div>
                            <Button size="sm" onClick={() => seedDefaults()}>
                                Add Defaults
                            </Button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleAddCategory} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">New Category</label>
                        <Input
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Category name..."
                        />
                    </div>
                    <div className="w-full sm:w-32 space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                            className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--input-text)',
                            }}
                            value={newCatType}
                            onChange={(e) => setNewCatType(e.target.value as "income" | "expense")}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <Button type="submit" size="icon" className="h-11 w-11">
                        <Plus className="h-5 w-5" />
                    </Button>
                </form>

                {hasCategories && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Expense Categories
                            </h4>
                            <div className="space-y-2">
                                {expenseCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3 group hover:border-red-300 dark:hover:border-red-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className="font-medium">{cat.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                                            onClick={() => deleteCategory(cat.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {expenseCategories.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No expense categories</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Income Categories
                            </h4>
                            <div className="space-y-2">
                                {incomeCategories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3 group hover:border-green-300 dark:hover:border-green-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <span className="font-medium">{cat.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                                            onClick={() => deleteCategory(cat.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {incomeCategories.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">No income categories</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
