"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Palette, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-indigo-500" />
                    Appearance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Switch between light and dark themes
                        </p>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={cn(
                            "relative inline-flex h-11 w-20 items-center rounded-full transition-colors",
                            isDark ? "bg-indigo-600" : "bg-slate-200"
                        )}
                    >
                        <span
                            className={cn(
                                "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform",
                                isDark ? "translate-x-10" : "translate-x-1"
                            )}
                        >
                            {isDark ? (
                                <Moon className="h-5 w-5 text-indigo-600" />
                            ) : (
                                <Sun className="h-5 w-5 text-amber-500" />
                            )}
                        </span>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
