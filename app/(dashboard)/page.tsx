"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useBudgets } from "@/hooks/useBudgets";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useBillReminders } from "@/hooks/useBillReminders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown, Target, Calendar, Bell, BellRing, AlertTriangle } from "lucide-react";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { BillReminderMonitor } from "@/components/BillReminderMonitor";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function DashboardPage() {
    const { transactions, loading: transactionsLoading } = useTransactions();
    const { categories } = useCategories();
    const { overallBudget } = useBudgets();
    const { goals } = useGoals();
    const { recurringTransactions } = useRecurringTransactions();
    const { upcomingBills } = useBillReminders();
    const { currencySymbol, formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const currentMonthTransactions = transactions.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
    });

    const totalIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    // Calculate Overall Budget Status
    let budgetRemainingPercent = 0;
    let budgetRemainingAmt = 0;
    let budgetTotal = 0;

    if (overallBudget) {
        budgetTotal = overallBudget.amount;
        budgetRemainingAmt = overallBudget.amount - totalExpenses;
        budgetRemainingPercent = Math.max(0, (budgetRemainingAmt / overallBudget.amount) * 100);
    }

    const statCards = [
        {
            title: "Total Balance",
            value: `${currencySymbol}${balance.toFixed(2)}`,
            subtitle: "All time",
            icon: Wallet,
            iconBg: "from-indigo-500 to-purple-500",
            valueColor: ""
        },
        {
            title: "Income",
            value: `+${currencySymbol}${totalIncome.toFixed(2)}`,
            subtitle: format(now, 'MMMM yyyy'),
            icon: TrendingUp,
            iconBg: "from-green-500 to-emerald-500",
            valueColor: "text-green-600 dark:text-green-500"
        },
        {
            title: "Expenses",
            value: `-${currencySymbol}${totalExpenses.toFixed(2)}`,
            subtitle: format(now, 'MMMM yyyy'),
            icon: TrendingDown,
            iconBg: "from-red-500 to-rose-500",
            valueColor: "text-red-600 dark:text-red-500"
        },
        {
            title: "Budget Left",
            value: overallBudget ? `${Math.round(budgetRemainingPercent)}%` : "—",
            subtitle: overallBudget ? `${currencySymbol}${budgetRemainingAmt.toFixed(0)} of ${currencySymbol}${budgetTotal}` : "No budget set",
            icon: Target,
            iconBg: "from-amber-500 to-orange-500",
            valueColor: "",
            link: !overallBudget ? "/budgets" : undefined
        },
    ];

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Welcome back! Here's your financial overview.
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="group w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                    Quick Add
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-3 md:gap-5 grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="relative overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                                    <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                                        {stat.title}
                                    </p>
                                    <p className={cn("text-lg md:text-2xl font-bold truncate", stat.valueColor)}>
                                        {stat.value}
                                    </p>
                                    {stat.link ? (
                                        <Link href={stat.link} className="text-xs text-indigo-500 hover:underline">
                                            {stat.subtitle}
                                        </Link>
                                    ) : (
                                        <p className="text-xs text-slate-400">{stat.subtitle}</p>
                                    )}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-xl bg-gradient-to-br",
                                    stat.iconBg
                                )}>
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                        {/* Decorative gradient line */}
                        <div className={cn(
                            "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r",
                            stat.iconBg
                        )} />
                    </Card>
                ))}
            </div>

            {/* Charts & Transactions */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Pie Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            Spending by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ExpensePieChart transactions={currentMonthTransactions} categories={categories} />
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="lg:col-span-3 h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between shrink-0">
                        <CardTitle>Recent Transactions</CardTitle>
                        <Link href="/transactions" className="text-sm text-indigo-500 hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <div className="space-y-4">
                            {currentMonthTransactions.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Wallet className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No transactions this month.</p>
                                    <Button
                                        variant="link"
                                        className="text-indigo-500 mt-2"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Add your first one
                                    </Button>
                                </div>
                            ) : (
                                currentMonthTransactions.slice(0, 4).map(t => (
                                    <div key={t.id} className="flex items-center group p-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-colors">
                                        <div className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                                            t.type === 'income'
                                                ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                                                : "bg-gradient-to-br from-red-500/20 to-rose-500/20"
                                        )}>
                                            {t.type === 'income'
                                                ? <ArrowUpRight className="h-5 w-5 text-green-600" />
                                                : <ArrowDownLeft className="h-5 w-5 text-red-600" />}
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{t.categoryId}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {t.note || t.location || format(parseISO(t.date), 'MMM d')}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "font-semibold text-sm",
                                            t.type === 'income' ? "text-green-600" : "text-red-600"
                                        )}>
                                            {t.type === 'income' ? "+" : "-"}{currencySymbol}{t.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Goals & Upcoming */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Financial Goals */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-500" />
                            Financial Goals
                        </CardTitle>
                        <Link href="/goals" className="text-sm text-indigo-500 hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent className="max-h-[280px] overflow-y-auto">
                        {goals.length === 0 ? (
                            <div className="text-center py-6 text-slate-400">
                                <p className="text-sm">No goals set yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {goals.slice(0, 4).map(goal => (
                                    <div key={goal.id} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{goal.name}</span>
                                            <span className="text-slate-500">
                                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                                style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Bills */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-amber-500" />
                            Upcoming Bills
                            {upcomingBills.filter(b => b.daysUntilDue <= 3).length > 0 && (
                                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                                    {upcomingBills.filter(b => b.daysUntilDue <= 3).length}
                                </span>
                            )}
                        </CardTitle>
                        <Link href="/transactions?tab=recurring" className="text-sm text-indigo-500 hover:underline">
                            Manage
                        </Link>
                    </CardHeader>
                    <CardContent className="max-h-[280px] overflow-y-auto">
                        {recurringTransactions.length === 0 ? (
                            <div className="text-center py-6 text-slate-400">
                                <p className="text-sm">No recurring bills set.</p>
                            </div>
                        ) : upcomingBills.length === 0 ? (
                            <div className="text-center py-6 text-slate-400">
                                <p className="text-sm">No bills due soon.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingBills
                                    .slice(0, 5)
                                    .map((bill) => {
                                        const rt = bill.recurringTransaction;
                                        const isUrgent = bill.daysUntilDue <= 3;
                                        const isDueToday = bill.daysUntilDue === 0;
                                        const isDueTomorrow = bill.daysUntilDue === 1;

                                        return (
                                            <div
                                                key={rt.id}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border transition-colors",
                                                    isUrgent
                                                        ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
                                                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Date indicator with urgency styling */}
                                                    <div className={cn(
                                                        "flex flex-col items-center justify-center w-12",
                                                        isUrgent
                                                            ? "text-amber-600 dark:text-amber-400"
                                                            : "text-slate-500 dark:text-slate-400"
                                                    )}>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider">
                                                            {format(parseISO(rt.nextDueDate), 'MMM')}
                                                        </span>
                                                        <span className={cn(
                                                            "text-xl font-bold leading-none",
                                                            isUrgent
                                                                ? "text-amber-700 dark:text-amber-300"
                                                                : "text-slate-700 dark:text-slate-200"
                                                        )}>
                                                            {format(parseISO(rt.nextDueDate), 'd')}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium truncate">{rt.name}</p>
                                                            {/* Reminder indicator icons */}
                                                            {isDueToday && (
                                                                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                            )}
                                                            {isDueTomorrow && (
                                                                <BellRing className="h-4 w-4 text-amber-500 flex-shrink-0 animate-pulse" />
                                                            )}
                                                            {bill.reminderStatus === "reminded" && !isDueToday && !isDueTomorrow && (
                                                                <Bell className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className={cn(
                                                            "text-xs",
                                                            isUrgent
                                                                ? "text-amber-600 dark:text-amber-400 font-medium"
                                                                : "text-slate-500"
                                                        )}>
                                                            {isDueToday
                                                                ? "Due today!"
                                                                : isDueTomorrow
                                                                ? "Due tomorrow"
                                                                : `Due in ${bill.daysUntilDue} days`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className={cn(
                                                    "font-semibold text-sm flex-shrink-0",
                                                    isUrgent && "text-amber-700 dark:text-amber-300"
                                                )}>
                                                    {formatCurrency(rt.amount)}
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </CardContent>
                </Card>
                {/* Bill Reminder Monitor - runs check on dashboard load */}
                <BillReminderMonitor />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Transaction"
            >
                <TransactionForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
