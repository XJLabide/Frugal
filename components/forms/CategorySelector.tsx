
"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionType } from "@/types";

interface CategorySelectorProps {
    type: TransactionType;
    selectedCategory: string;
    selectedSubCategory?: string;
    onCategoryChange: (category: string) => void;
    onSubCategoryChange: (subCategory: string) => void;
}

export function CategorySelector({
    type,
    selectedCategory,
    selectedSubCategory,
    onCategoryChange,
    onSubCategoryChange
}: CategorySelectorProps) {
    const { categories, hasCategories, seedDefaults, updateCategory, loading } = useCategories();

    // Local state for adding new subcategory
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState("");

    const filteredCategories = categories.filter(c => c.type === type);
    const selectedCategoryData = categories.find(c => c.name === selectedCategory);
    const availableSubCategories = selectedCategoryData?.subCategories || [];

    const handleSaveNewSub = async () => {
        if (!selectedCategoryData || !newSubName.trim()) return;

        const trimmedName = newSubName.trim();
        // Don't duplicate if already exists
        if (!availableSubCategories.includes(trimmedName)) {
            const updatedSubs = [...availableSubCategories, trimmedName];
            await updateCategory(selectedCategoryData.id, {
                subCategories: updatedSubs
            });
        }

        onSubCategoryChange(trimmedName);
        setNewSubName("");
        setIsAddingSub(false);
    };

    return (
        <div className="space-y-4">
            {/* Category Select */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                {loading ? (
                    <p className="text-sm text-slate-500">Loading categories...</p>
                ) : !hasCategories ? (
                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        No categories found. <button type="button" onClick={() => seedDefaults()} className="underline font-bold hover:text-amber-800">Add Defaults</button>
                    </div>
                ) : (
                    <select
                        className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: 'var(--input-border)',
                            color: 'var(--input-text)',
                        }}
                        value={selectedCategory}
                        onChange={(e) => {
                            onCategoryChange(e.target.value);
                            // Subcategory reset logic should be handled by parent or here if we want to be strict
                            // But usually onCategoryChange implies potential subcategory invalidation
                        }}
                        required
                    >
                        <option value="">Select Category</option>
                        {filteredCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Subcategory Select (Conditional) */}
            {selectedCategory && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Subcategory</label>

                    {isAddingSub ? (
                        <div className="flex gap-2">
                            <Input
                                placeholder="New subcategory name"
                                value={newSubName}
                                onChange={(e) => setNewSubName(e.target.value)}
                                className="h-10 text-sm"
                                autoFocus
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveNewSub}
                                disabled={!newSubName.trim()}
                            >
                                Save
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsAddingSub(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <select
                                className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--input-border)',
                                    color: 'var(--input-text)',
                                }}
                                value={selectedSubCategory || ""}
                                onChange={(e) => {
                                    if (e.target.value === "ADD_NEW") {
                                        setIsAddingSub(true);
                                    } else {
                                        onSubCategoryChange(e.target.value);
                                    }
                                }}
                            >
                                <option value="">None</option>
                                {/* Optimistically show the selected subcategory if it's not in the loaded list yet */}
                                {availableSubCategories.includes(selectedSubCategory || "")
                                    ? null
                                    : selectedSubCategory && <option value={selectedSubCategory}>{selectedSubCategory}</option>
                                }
                                {availableSubCategories.map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                                <option disabled>──────────</option>
                                <option value="ADD_NEW">+ Add New Subcategory</option>
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
