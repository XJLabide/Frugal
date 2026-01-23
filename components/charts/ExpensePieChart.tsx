"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction, Category } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExpensePieChartProps {
    transactions: Transaction[];
    categories: Category[];
}

export function ExpensePieChart({ transactions, categories }: ExpensePieChartProps) {
    const { currencySymbol } = useCurrency();

    // Aggregate expenses by category
    const dataMap: Record<string, number> = {};

    transactions.forEach(t => {
        if (t.type === 'expense') {
            dataMap[t.categoryId] = (dataMap[t.categoryId] || 0) + t.amount;
        }
    });

    const data = Object.keys(dataMap).map(categoryName => {
        // Find category color
        const category = categories.find(c => c.name === categoryName);
        return {
            name: categoryName,
            value: dataMap[categoryName],
            color: category?.color || "#94a3b8" // Default slate-400
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
