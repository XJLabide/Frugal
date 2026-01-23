"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { CURRENCIES, formatCurrency as formatCurrencyUtil, formatCurrencyWithSign as formatCurrencyWithSignUtil } from "@/lib/utils";

interface CurrencyContextType {
    currency: string;
    currencySymbol: string;
    currencyName: string;
    loading: boolean;
    setCurrency: (currency: string) => Promise<void>;
    formatCurrency: (amount: number) => string;
    formatCurrencyWithSign: (amount: number, type: 'income' | 'expense') => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { settings, loading, setCurrency } = useUserSettings();

    const currency = settings.currency;
    const currencyInfo = CURRENCIES[currency] || CURRENCIES.PHP;

    const formatCurrency = (amount: number) => {
        return formatCurrencyUtil(amount, currency);
    };

    const formatCurrencyWithSign = (amount: number, type: 'income' | 'expense') => {
        return formatCurrencyWithSignUtil(amount, type, currency);
    };

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                currencySymbol: currencyInfo.symbol,
                currencyName: currencyInfo.name,
                loading,
                setCurrency,
                formatCurrency,
                formatCurrencyWithSign,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
