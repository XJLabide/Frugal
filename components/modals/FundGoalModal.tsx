"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Goal } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Target, ArrowRight, Wallet } from "lucide-react";
import { format } from "date-fns";

interface FundGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal;
    availableBalance: number;
}

export function FundGoalModal({ isOpen, onClose, goal, availableBalance }: FundGoalModalProps) {
    const { addToGoal } = useGoals();
    const { addTransaction } = useTransactions();
    const { currencySymbol, formatCurrency } = useCurrency();
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const parsedAmount = parseFloat(amount) || 0;
    const exceedsBalance = parsedAmount > availableBalance;
    const remaining = goal.targetAmount - goal.currentAmount;

    const handleFund = async () => {
        if (!parsedAmount || parsedAmount <= 0) return;

        setLoading(true);
        try {
            // 1. Create an expense transaction (subtracts from balance)
            await addTransaction({
                amount: parsedAmount,
                categoryId: "Goal Funding",
                date: format(new Date(), "yyyy-MM-dd"),
                note: `Funded goal: ${goal.name}`,
                location: goal.location || "Savings",
                type: "expense",
            });

            // 2. Add to the goal's current amount
            await addToGoal(goal.id, parsedAmount);

            setAmount("");
            onClose();
        } catch (error) {
            console.error("Error funding goal:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Fund "${goal.name}"`}>
            <div className="space-y-6">
                {/* Goal Progress */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                            <Target className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                            <p className="font-semibold">{goal.name}</p>
                            <p className="text-sm text-slate-500">
                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                            </p>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                            style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {formatCurrency(remaining)} left to reach goal
                    </p>
                </div>

                {/* Available Balance */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Available Balance</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(availableBalance)}</span>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount to Fund</label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    {exceedsBalance && (
                        <p className="text-xs text-red-500">Amount exceeds your available balance</p>
                    )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(Math.min(100, availableBalance).toString())}
                    >
                        {currencySymbol}100
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(Math.min(500, availableBalance).toString())}
                    >
                        {currencySymbol}500
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(Math.min(remaining, availableBalance).toString())}
                    >
                        Fill Remaining
                    </Button>
                </div>

                {/* Action */}
                <Button
                    className="w-full"
                    onClick={handleFund}
                    disabled={loading || !parsedAmount || parsedAmount <= 0 || exceedsBalance}
                >
                    {loading ? "Funding..." : (
                        <>
                            Fund Goal <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </Modal>
    );
}
