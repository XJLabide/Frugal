"use client";

import { useState, useRef, useEffect } from "react";
import { format, setMonth, setYear, addYears, subYears } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
    date: Date;
    onChange: (date: Date) => void;
    className?: string;
}

export function MonthYearPicker({ date, onChange, className }: MonthYearPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(date.getFullYear());
    const containerRef = useRef<HTMLDivElement>(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Reset view year to current selected year when opening
            setViewYear(date.getFullYear());
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, date]);

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = setMonth(setYear(date, viewYear), monthIndex);
        onChange(newDate);
        setIsOpen(false);
    };

    const nextYear = () => setViewYear(prev => prev + 1);
    const prevYear = () => setViewYear(prev => prev - 1);

    return (
        <div className={cn("relative w-[200px]", className)} ref={containerRef}>
            <Button
                variant="outline"
                className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar className="mr-2 h-4 w-4 opacity-50" />
                {date ? format(date, "MMMM yyyy") : <span>Pick a date</span>}
            </Button>

            {isOpen && (
                <div className="absolute left-0 sm:left-auto top-full mt-2 p-3 w-[calc(100vw-2rem)] sm:w-[280px] max-w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={prevYear}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="font-semibold text-sm">
                            {viewYear}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={nextYear}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((month, index) => {
                            const isSelected = date.getMonth() === index && date.getFullYear() === viewYear;
                            const isCurrentMonth = new Date().getMonth() === index && new Date().getFullYear() === viewYear;

                            return (
                                <button
                                    key={month}
                                    onClick={() => handleMonthSelect(index)}
                                    className={cn(
                                        "text-xs px-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                                        isSelected && "bg-indigo-600 text-white hover:bg-indigo-700",
                                        !isSelected && isCurrentMonth && "text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20"
                                    )}
                                >
                                    {month.slice(0, 3)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
