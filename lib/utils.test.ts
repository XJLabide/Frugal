import { describe, it, expect } from "vitest";
import { cn, CURRENCIES, formatCurrency, formatCurrencyWithSign } from "./utils";

describe("cn (class name merger)", () => {
    it("merges class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("merges tailwind classes correctly", () => {
        expect(cn("p-4", "p-2")).toBe("p-2");
        expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });
});

describe("CURRENCIES", () => {
    it("has all expected currencies", () => {
        expect(Object.keys(CURRENCIES)).toEqual(["PHP", "USD", "EUR", "GBP", "JPY"]);
    });

    it("has correct symbols", () => {
        expect(CURRENCIES.PHP.symbol).toBe("₱");
        expect(CURRENCIES.USD.symbol).toBe("$");
        expect(CURRENCIES.EUR.symbol).toBe("€");
        expect(CURRENCIES.GBP.symbol).toBe("£");
        expect(CURRENCIES.JPY.symbol).toBe("¥");
    });
});

describe("formatCurrency", () => {
    it("formats PHP correctly with default", () => {
        expect(formatCurrency(1234.56)).toBe("₱1234.56");
        expect(formatCurrency(1234.56, "PHP")).toBe("₱1234.56");
    });

    it("formats USD correctly", () => {
        expect(formatCurrency(1234.56, "USD")).toBe("$1234.56");
    });

    it("formats EUR correctly", () => {
        expect(formatCurrency(1234.56, "EUR")).toBe("€1234.56");
    });

    it("formats GBP correctly", () => {
        expect(formatCurrency(1234.56, "GBP")).toBe("£1234.56");
    });

    it("formats JPY without decimals", () => {
        expect(formatCurrency(1234.56, "JPY")).toBe("¥1235");
        expect(formatCurrency(1234, "JPY")).toBe("¥1234");
    });

    it("handles zero", () => {
        expect(formatCurrency(0)).toBe("₱0.00");
        expect(formatCurrency(0, "JPY")).toBe("¥0");
    });

    it("handles negative amounts (converts to absolute)", () => {
        expect(formatCurrency(-100)).toBe("₱100.00");
        expect(formatCurrency(-100, "USD")).toBe("$100.00");
    });

    it("falls back to PHP for unknown currency", () => {
        expect(formatCurrency(100, "INVALID")).toBe("₱100.00");
    });

    it("handles very large amounts", () => {
        expect(formatCurrency(1000000.99, "USD")).toBe("$1000000.99");
    });

    it("handles very small amounts", () => {
        expect(formatCurrency(0.01, "USD")).toBe("$0.01");
        expect(formatCurrency(0.001, "USD")).toBe("$0.00");
    });
});

describe("formatCurrencyWithSign", () => {
    it("adds + for income", () => {
        expect(formatCurrencyWithSign(100, "income")).toBe("+₱100.00");
        expect(formatCurrencyWithSign(100, "income", "USD")).toBe("+$100.00");
    });

    it("adds - for expense", () => {
        expect(formatCurrencyWithSign(100, "expense")).toBe("-₱100.00");
        expect(formatCurrencyWithSign(100, "expense", "USD")).toBe("-$100.00");
    });

    it("handles JPY without decimals", () => {
        expect(formatCurrencyWithSign(1234, "income", "JPY")).toBe("+¥1234");
        expect(formatCurrencyWithSign(1234, "expense", "JPY")).toBe("-¥1234");
    });

    it("handles negative input (converts to absolute)", () => {
        expect(formatCurrencyWithSign(-100, "income")).toBe("+₱100.00");
        expect(formatCurrencyWithSign(-100, "expense")).toBe("-₱100.00");
    });
});
