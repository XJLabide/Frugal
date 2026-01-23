"use client";

import { useState, useRef, useEffect } from "react";
import { useTags } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Tag as TagIcon } from "lucide-react";

interface TagInputProps {
    selectedTagIds: string[];
    onTagsChange: (tagIds: string[]) => void;
}

export function TagInput({ selectedTagIds, onTagsChange }: TagInputProps) {
    const { tags, loading, addTag } = useTags();
    const [inputValue, setInputValue] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter tags based on input (autocomplete)
    const filteredTags = tags.filter(
        (tag) =>
            !selectedTagIds.includes(tag.id) &&
            tag.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Check if input matches an existing tag name exactly
    const exactMatch = tags.find(
        (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    );

    // Show "Create new tag" option if no exact match and input has value
    const showCreateOption = inputValue.trim() && !exactMatch;

    // Get selected tag objects
    const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectTag = (tagId: string) => {
        if (!selectedTagIds.includes(tagId)) {
            onTagsChange([...selectedTagIds, tagId]);
        }
        setInputValue("");
        setIsDropdownOpen(false);
    };

    const handleRemoveTag = (tagId: string) => {
        onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    };

    const handleCreateTag = async () => {
        if (!inputValue.trim() || isCreating) return;

        setIsCreating(true);
        try {
            await addTag({ name: inputValue.trim() });
            // The tag will appear in the tags list via real-time subscription
            // Find and select it after a brief delay
            setTimeout(() => {
                const newTag = tags.find(
                    (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
                );
                if (newTag) {
                    handleSelectTag(newTag.id);
                }
            }, 500);
            setInputValue("");
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Error creating tag:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filteredTags.length > 0) {
                handleSelectTag(filteredTags[0].id);
            } else if (showCreateOption) {
                handleCreateTag();
            }
        } else if (e.key === "Escape") {
            setIsDropdownOpen(false);
        } else if (e.key === "Backspace" && !inputValue && selectedTagIds.length > 0) {
            // Remove last tag when backspace is pressed on empty input
            handleRemoveTag(selectedTagIds[selectedTagIds.length - 1]);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>

            <div ref={containerRef} className="relative">
                {/* Selected tags chips */}
                <div
                    className="flex flex-wrap gap-2 min-h-[44px] p-2 rounded-xl border-2 cursor-text transition-all focus-within:ring-2 focus-within:ring-indigo-500/20"
                    style={{
                        backgroundColor: "var(--input-bg)",
                        borderColor: "var(--input-border)",
                    }}
                    onClick={() => inputRef.current?.focus()}
                >
                    {selectedTags.map((tag) => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium"
                            style={{
                                backgroundColor: tag.color || "#6366f1",
                                color: "#ffffff",
                            }}
                        >
                            <TagIcon className="w-3 h-3" />
                            {tag.name}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTag(tag.id);
                                }}
                                className="ml-1 hover:opacity-70 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}

                    {/* Input for typing/searching */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
                        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
                        style={{ color: "var(--input-text)" }}
                        disabled={loading}
                    />
                </div>

                {/* Dropdown */}
                {isDropdownOpen && (filteredTags.length > 0 || showCreateOption) && (
                    <div
                        className="absolute z-50 w-full mt-1 py-1 rounded-xl border-2 shadow-lg max-h-48 overflow-y-auto"
                        style={{
                            backgroundColor: "var(--input-bg)",
                            borderColor: "var(--input-border)",
                        }}
                    >
                        {/* Existing tags */}
                        {filteredTags.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleSelectTag(tag.id)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                            >
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color || "#6366f1" }}
                                />
                                <span style={{ color: "var(--input-text)" }}>{tag.name}</span>
                            </button>
                        ))}

                        {/* Separator if both options exist */}
                        {filteredTags.length > 0 && showCreateOption && (
                            <div className="my-1 border-t" style={{ borderColor: "var(--input-border)" }} />
                        )}

                        {/* Create new tag option */}
                        {showCreateOption && (
                            <button
                                type="button"
                                onClick={handleCreateTag}
                                disabled={isCreating}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors text-indigo-600 dark:text-indigo-400 font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                {isCreating ? "Creating..." : `Create "${inputValue.trim()}"`}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {loading && (
                <p className="text-sm text-slate-500">Loading tags...</p>
            )}
        </div>
    );
}
