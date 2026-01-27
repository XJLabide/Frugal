"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

// Diverse color palette for chart segments
const CHART_COLORS = [
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#8b5cf6", // Violet
    "#3b82f6", // Blue
    "#14b8a6", // Teal
    "#ef4444", // Red
    "#84cc16", // Lime
    "#f97316", // Orange
    "#06b6d4", // Cyan
    "#a855f7", // Purple
];

interface ExpensePieChartProps {
    transactions: Transaction[];
    categories?: unknown; // Kept for backwards compatibility, not used
}

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
    const { currencySymbol } = useCurrency();

    // Aggregate expenses by category
    const dataMap: Record<string, number> = {};

    transactions.forEach(t => {
        if (t.type === 'expense') {
            dataMap[t.categoryId] = (dataMap[t.categoryId] || 0) + t.amount;
        }
    });

    const data = Object.keys(dataMap).map((categoryName, index) => {
        return {
            name: categoryName,
            value: dataMap[categoryName],
            color: CHART_COLORS[index % CHART_COLORS.length]
        };
    }).filter(d => d.value > 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded shadow-sm">
                    <p className="text-sm font-medium">{payload[0].name}</p>
                    <p className="text-sm text-slate-500">
                        {currencySymbol}{payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-400 text-sm">No expense data</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
