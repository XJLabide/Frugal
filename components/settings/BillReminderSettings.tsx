"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Plus, X } from "lucide-react";
import { useUserSettings } from "@/hooks/useUserSettings";

export function BillReminderSettings() {
    const { settings, setBillReminderDays, loading } = useUserSettings();
    const [newReminderDay, setNewReminderDay] = useState("");

    const handleAddReminderDay = async () => {
        const day = parseInt(newReminderDay, 10);
        if (day && day >= 1 && day <= 30) {
            const currentDays = settings.billReminderDays || [];
            if (!currentDays.includes(day)) {
                await setBillReminderDays([...currentDays, day]);
            }
            setNewReminderDay("");
        }
    };

    const handleRemoveReminderDay = async (day: number) => {
        const newDays = (settings.billReminderDays || []).filter(d => d !== day);
        await setBillReminderDays(newDays);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-500" />
                    Bill Reminders
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <p className="font-medium">Reminder Days</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Get notified before upcoming bills are due
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {(settings.billReminderDays || [1, 3]).sort((a, b) => a - b).map((day) => (
                        <div
                            key={day}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
                        >
                            <span>{day} day{day !== 1 ? 's' : ''} before</span>
                            <button
                                onClick={() => handleRemoveReminderDay(day)}
                                disabled={loading}
                                className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                    {(settings.billReminderDays || []).length === 0 && (
                        <p className="text-sm text-slate-400 italic">No reminders set</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1 sm:max-w-[200px]">
                        <Input
                            type="number"
                            min="1"
                            max="30"
                            value={newReminderDay}
                            onChange={(e) => setNewReminderDay(e.target.value)}
                            placeholder="Days before..."
                            className="h-10"
                        />
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAddReminderDay}
                        disabled={loading || !newReminderDay}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Add up to 30 days before the due date. Common choices: 1, 3, 7 days.
                </p>
            </CardContent>
        </Card>
    );
}
