"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Info } from "lucide-react";

interface GoalFormProps {
    onSuccess: () => void;
}

export function GoalForm({ onSuccess }: GoalFormProps) {
    const { addGoal } = useGoals();
    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("0");
    const [deadline, setDeadline] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const goalData: any = {
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount) || 0,
            };
            // Only add optional fields if they have values
            if (deadline) {
                goalData.deadline = deadline;
            }
            if (location) {
                goalData.location = location;
            }
            await addGoal(goalData);
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Name */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Goal Name</label>
                <Input
                    placeholder="e.g., Emergency Fund, Vacation, New Laptop"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            {/* Info */}
            <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">
                        Set a savings goal and track your progress. Add money whenever you save towards this goal.
                    </p>
                </div>
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Target Amount</label>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                />
            </div>

            {/* Current Saved (optional) */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Already Saved (optional)</label>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                />
            </div>

            {/* Storage Location */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Storage Location</label>
                <select
                    className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--input-text)',
                    }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                >
                    <option value="">Select where funds are stored</option>
                    <option value="Bank">🏦 Bank</option>
                    <option value="Wallet">💵 Wallet (Cash)</option>
                    <option value="GCash">📱 GCash</option>
                    <option value="Maya">📱 Maya</option>
                    <option value="Investment">📈 Investment Account</option>
                    <option value="Other">📦 Other</option>
                </select>
            </div>

            {/* Deadline (optional) */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Target Date (optional)</label>
                <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !name || !targetAmount}>
                {loading ? "Creating..." : "Create Goal"}
            </Button>
        </form>
    );
}
