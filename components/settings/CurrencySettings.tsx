"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { CURRENCIES } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

export function CurrencySettings() {
    const { currency, setCurrency, loading } = useCurrency();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-indigo-500" />
                    Currency
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="font-medium">Display Currency</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Choose your preferred currency for displaying amounts
                        </p>
                    </div>
                    <select
                        className="h-11 w-full sm:w-40 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500/20"
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: 'var(--input-border)',
                            color: 'var(--input-text)',
                        }}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        disabled={loading}
                    >
                        {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                            <option key={code} value={code}>
                                {symbol} {code} - {name}
                            </option>
                        ))}
                    </select>
                </div>
            </CardContent>
        </Card>
    );
}
