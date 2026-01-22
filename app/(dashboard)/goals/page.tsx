"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { GoalForm } from "@/components/forms/GoalForm";
import { Plus, Trash2, Target, Calendar, Sparkles, PiggyBank, Pencil, Wallet, MapPin } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { cn, CURRENCY_SYMBOL } from "@/lib/utils";
import { Goal } from "@/types";
import { FundGoalModal } from "@/components/modals/FundGoalModal";
import { useTransactions } from "@/hooks/useTransactions";

export default function GoalsPage() {
    const {
        goals,
        loading,
        addToGoal,
        updateGoal,
        deleteGoal,
        totalTargetAmount,
        totalSavedAmount,
        overallProgress
    } = useGoals();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addAmountModal, setAddAmountModal] = useState<string | null>(null);
    const [addAmount, setAddAmount] = useState("");
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [editName, setEditName] = useState("");
    const [editTarget, setEditTarget] = useState("");
    const [editCurrent, setEditCurrent] = useState("");
    const [editDeadline, setEditDeadline] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [fundGoal, setFundGoal] = useState<Goal | null>(null);

    const { transactions } = useTransactions();

    // Calculate available balance
    const balance = transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    const handleDelete = async () => {
        if (deleteId) {
            await deleteGoal(deleteId);
            setDeleteId(null);
        }
    };

    const handleAddAmount = async () => {
        if (addAmountModal && addAmount) {
            await addToGoal(addAmountModal, parseFloat(addAmount));
            setAddAmountModal(null);
            setAddAmount("");
        }
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setEditName(goal.name);
        setEditTarget(goal.targetAmount.toString());
        setEditCurrent(goal.currentAmount.toString());
        setEditDeadline(goal.deadline || "");
        setEditLocation(goal.location || "");
    };

    const handleSaveEdit = async () => {
        if (editingGoal) {
            const updateData: Partial<Goal> = {
                name: editName,
                targetAmount: parseFloat(editTarget),
                currentAmount: parseFloat(editCurrent),
            };
            if (editDeadline) {
                updateData.deadline = editDeadline;
            }
            if (editLocation) {
                updateData.location = editLocation;
            }
            await updateGoal(editingGoal.id, updateData);
            setEditingGoal(null);
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return "from-green-500 to-emerald-500";
        if (percentage >= 75) return "from-indigo-500 to-purple-500";
        if (percentage >= 50) return "from-blue-500 to-cyan-500";
        return "from-slate-400 to-slate-500";
    };

    const getDaysRemaining = (deadline: string) => {
        const days = differenceInDays(parseISO(deadline), new Date());
        if (days < 0) return { text: "Overdue", color: "text-red-500" };
        if (days === 0) return { text: "Due today", color: "text-amber-500" };
        if (days <= 7) return { text: `${days} days left`, color: "text-amber-500" };
        if (days <= 30) return { text: `${days} days left`, color: "text-blue-500" };
        return { text: `${days} days left`, color: "text-slate-500" };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Goals</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Track your savings goals and watch your progress
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="group w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                    New Goal
                </Button>
            </div>

            {/* Summary Card */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <PiggyBank className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Total Savings Progress</p>
                                {loading ? (
                                    <div className="h-9 w-40 bg-white/20 rounded animate-pulse mt-1" />
                                ) : (
                                    <p className="text-3xl font-bold">
                                        {CURRENCY_SYMBOL}{totalSavedAmount.toFixed(2)} <span className="text-lg opacity-80">/ {CURRENCY_SYMBOL}{totalTargetAmount.toFixed(2)}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        {goals.length > 0 && !loading && (
                            <div className="text-right">
                                <p className="text-4xl font-bold">{Math.round(overallProgress)}%</p>
                                <p className="text-sm opacity-80">Overall</p>
                            </div>
                        )}
                    </div>

                    {totalTargetAmount > 0 && (
                        <div className="space-y-2">
                            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min(overallProgress, 100)}%` }}
                                />
                            </div>
                            <p className="text-sm opacity-80">
                                {goals.length} goal{goals.length !== 1 ? 's' : ''} • {CURRENCY_SYMBOL}{(totalTargetAmount - totalSavedAmount).toFixed(2)} remaining
                            </p>
                        </div>
                    )}

                    {goals.length === 0 && !loading && (
                        <p className="text-white/80 text-sm">
                            Create your first savings goal to start tracking
                        </p>
                    )}
                </div>
            </Card>

            {/* Goals Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map(goal => {
                    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                    const isComplete = percentage >= 100;
                    const daysInfo = goal.deadline ? getDaysRemaining(goal.deadline) : null;

                    return (
                        <Card key={goal.id} className="group relative overflow-hidden">
                            {isComplete && (
                                <div className="absolute top-3 right-3">
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                </div>
                            )}
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2.5 rounded-xl bg-gradient-to-br",
                                            getProgressColor(percentage)
                                        )}>
                                            <Target className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{goal.name}</h4>
                                            {daysInfo && (
                                                <p className={cn("text-xs", daysInfo.color)}>
                                                    <Calendar className="inline h-3 w-3 mr-1" />
                                                    {daysInfo.text}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                                            onClick={() => handleEdit(goal)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                                            onClick={() => setDeleteId(goal.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xl font-bold">{CURRENCY_SYMBOL}{goal.currentAmount.toFixed(2)}</span>
                                        <span className="text-sm text-slate-500">of {CURRENCY_SYMBOL}{goal.targetAmount.toFixed(2)}</span>
                                    </div>

                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                                                getProgressColor(percentage)
                                            )}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">
                                                {isComplete ? "🎉 Goal reached!" : `${Math.round(percentage)}% saved`}
                                            </span>
                                            {goal.location && (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {goal.location}
                                                </span>
                                            )}
                                        </div>
                                        {!isComplete && (
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={() => setFundGoal(goal)}
                                                >
                                                    <Wallet className="h-3 w-3 mr-1" /> Fund
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Empty state */}
                {goals.length === 0 && !loading && (
                    <div className="col-span-full text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Target className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No goals yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            Create a savings goal to start tracking your progress
                        </p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Your First Goal
                        </Button>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <>
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                                        <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                                    </div>
                                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
            </div>

            {/* New Goal Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Goal"
            >
                <GoalForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>

            {/* Add Amount Modal */}
            <Modal
                isOpen={!!addAmountModal}
                onClose={() => { setAddAmountModal(null); setAddAmount(""); }}
                title="Add to Goal"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        How much are you adding to this goal?
                    </p>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        autoFocus
                    />
                    <Button onClick={handleAddAmount} className="w-full" disabled={!addAmount}>
                        Add {CURRENCY_SYMBOL}{addAmount || "0.00"}
                    </Button>
                </div>
            </Modal>

            {/* Edit Goal Modal */}
            <Modal
                isOpen={!!editingGoal}
                onClose={() => setEditingGoal(null)}
                title={`Edit Goal: ${editingGoal?.name}`}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Goal Name</label>
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Amount</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={editTarget}
                            onChange={(e) => setEditTarget(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Amount</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={editCurrent}
                            onChange={(e) => setEditCurrent(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Date (optional)</label>
                        <Input
                            type="date"
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Storage Location</label>
                        <select
                            className="flex h-11 w-full rounded-xl border-2 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                borderColor: 'var(--input-border)',
                                color: 'var(--input-text)',
                            }}
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
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
                    <Button onClick={handleSaveEdit} className="w-full">
                        Save Changes
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Goal"
                message="Are you sure you want to delete this savings goal? This action cannot be undone."
                confirmText="Delete"
            />

            {/* Fund Goal Modal */}
            {fundGoal && (
                <FundGoalModal
                    isOpen={!!fundGoal}
                    onClose={() => setFundGoal(null)}
                    goal={fundGoal}
                    availableBalance={balance}
                />
            )}
        </div>
    );
}
