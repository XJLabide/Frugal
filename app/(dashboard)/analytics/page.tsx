"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3 } from "lucide-react";

const COLORS = [
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#8b5cf6", // Violet
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#14b8a6", // Teal
];

export default function AnalyticsPage() {
    const { transactions, loading } = useTransactions();
    const { currencySymbol } = useCurrency();
    const [timeRange, setTimeRange] = useState(6); // Months

    // 1. Monthly Trends (Income vs Expense)
    const monthlyData = useMemo(() => {
        const today = new Date();
        const months = eachMonthOfInterval({
            start: subMonths(today, timeRange - 1),
            end: today
        });

        return months.map(month => {
            const monthStr = format(month, 'yyyy-MM');
            const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                name: format(month, 'MMM'),
                fullDate: monthStr,
                income,
                expense,
                net: income - expense
            };
        });
    }, [transactions, timeRange]);

    // 2. Spending by Category (Current Month vs Last Month)
    const categoryData = useMemo(() => {
        const currentMonth = format(new Date(), 'yyyy-MM');

        const currentMonthExpenses = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

        const byCategory = currentMonthExpenses.reduce((acc, t) => {
            acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(byCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // 3. KPI stats
    const stats = useMemo(() => {
        if (monthlyData.length < 2) return null;
        const current = monthlyData[monthlyData.length - 1];
        const prev = monthlyData[monthlyData.length - 2];

        const spendingChange = prev.expense > 0
            ? ((current.expense - prev.expense) / prev.expense) * 100
            : 0;

        const incomeChange = prev.income > 0
            ? ((current.income - prev.income) / prev.income) * 100
            : 0;

        return {
            spendingChange,
            incomeChange,
            currentMonth: current
        };
    }, [monthlyData]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
                    Visualize your financial health and spending patterns
                </p>
            </div>

            {/* KPI Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Monthly Spending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">
                                    {currencySymbol}{stats.currentMonth.expense.toFixed(2)}
                                </span>
                                <div className={cn(
                                    "flex items-center text-sm font-medium",
                                    stats.spendingChange > 0 ? "text-red-600" : "text-green-600"
                                )}>
                                    {stats.spendingChange > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                                    {Math.abs(stats.spendingChange).toFixed(1)}%
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">vs last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Monthly Income
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">
                                    {currencySymbol}{stats.currentMonth.income.toFixed(2)}
                                </span>
                                <div className={cn(
                                    "flex items-center text-sm font-medium",
                                    stats.incomeChange < 0 ? "text-red-600" : "text-green-600"
                                )}>
                                    {stats.incomeChange < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                                    {Math.abs(stats.incomeChange).toFixed(1)}%
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">vs last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                Net Savings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-2xl font-bold",
                                    stats.currentMonth.net >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    {stats.currentMonth.net >= 0 ? '+' : ''}{currencySymbol}{stats.currentMonth.net.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    {stats.currentMonth.income > 0
                                        ? ((stats.currentMonth.net / stats.currentMonth.income) * 100).toFixed(0) + '% Rate'
                                        : '0% Rate'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Savings rate this month</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Income vs Expense Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-500" />
                            Income vs Expenses
                        </CardTitle>
                        <CardDescription>
                            Financial performance over the last {timeRange} months
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[240px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 12 }}
                                        tickFormatter={(value) => `${currencySymbol}${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                        contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', padding: '12px' }}
                                        itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                                        formatter={(value: number | undefined) => [`${currencySymbol}${(value ?? 0).toFixed(2)}`, '']}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
                                    <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Spending by Category */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-indigo-500" />
                            Spending Breakdown (Current Month)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="h-[240px] sm:h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number | undefined) => `${currencySymbol}${(value ?? 0).toFixed(2)}`}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {categoryData.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="font-medium text-sm">{entry.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm">
                                                {currencySymbol}{entry.value.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {((entry.value / stats!.currentMonth.expense) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
