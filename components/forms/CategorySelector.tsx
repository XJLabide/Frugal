
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
        <div className="space-y-3 sm:space-y-4">
            {/* Category and Subcategory - Side by side on mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Category Select */}
                <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Category</label>
                    {loading ? (
                        <p className="text-xs text-slate-500">Loading...</p>
                    ) : !hasCategories ? (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            <button type="button" onClick={() => seedDefaults()} className="underline font-bold hover:text-amber-800">Add Defaults</button>
                        </div>
                    ) : (
                        <select
                            className="flex h-9 sm:h-11 w-full rounded-xl border-2 px-2 sm:px-3 py-1.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--input-text)',
                            }}
                            value={selectedCategory}
                            onChange={(e) => {
                                onCategoryChange(e.target.value);
                            }}
                            required
                        >
                            <option value="">Select...</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Subcategory Select */}
                <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Subcategory</label>
                    {isAddingSub ? (
                        <div className="flex gap-1">
                            <Input
                                placeholder="Name"
                                value={newSubName}
                                onChange={(e) => setNewSubName(e.target.value)}
                                className="h-9 sm:h-11 text-sm"
                                autoFocus
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="h-9 sm:h-11 px-2"
                                onClick={handleSaveNewSub}
                                disabled={!newSubName.trim()}
                            >
                                OK
                            </Button>
                        </div>
                    ) : (
                        <select
                            className="flex h-9 sm:h-11 w-full rounded-xl border-2 px-2 sm:px-3 py-1.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
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
                            disabled={!selectedCategory}
                        >
                            <option value="">None</option>
                            {availableSubCategories.includes(selectedSubCategory || "")
                                ? null
                                : selectedSubCategory && <option value={selectedSubCategory}>{selectedSubCategory}</option>
                            }
                            {availableSubCategories.map((sub) => (
                                <option key={sub} value={sub}>
                                    {sub}
                                </option>
                            ))}
                            <option disabled>────────</option>
                            <option value="ADD_NEW">+ Add New</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
}
