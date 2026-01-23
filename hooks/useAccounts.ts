import { useState, useEffect, useMemo } from "react";
import {
    collection,
    query,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Account, AccountType, Transaction } from "@/types";

const DEFAULT_ACCOUNTS: Omit<Account, "id" | "userId" | "createdAt">[] = [
    { name: "Cash", type: "cash", startingBalance: 0, icon: "Wallet", color: "#22c55e", isDefault: true },
    { name: "Bank", type: "bank", startingBalance: 0, icon: "Building2", color: "#3b82f6" },
    { name: "E-Wallet", type: "ewallet", startingBalance: 0, icon: "Smartphone", color: "#8b5cf6" },
];

export function useAccounts() {
    const { user } = useAuthStore();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to accounts
    useEffect(() => {
        if (!user) {
            setAccounts([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, "users", user.uid, "accounts")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Account[];

                // Sort client-side: default account first, then by name
                data.sort((a, b) => {
                    if (a.isDefault && !b.isDefault) return -1;
                    if (!a.isDefault && b.isDefault) return 1;
                    return a.name.localeCompare(b.name);
                });

                setAccounts(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching accounts:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Subscribe to transactions for balance calculation
    useEffect(() => {
        if (!user) {
            setTransactions([]);
            return;
        }

        const q = query(
            collection(db, "users", user.uid, "transactions")
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Transaction[];
                setTransactions(data);
            },
            (error) => {
                console.error("Error fetching transactions for balance calculation:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Calculate balances: Record<accountId, number>
    // Balance = startingBalance + income(accountId) - expenses(accountId)
    const balances = useMemo(() => {
        const result: Record<string, number> = {};

        accounts.forEach(account => {
            let balance = account.startingBalance || 0;

            // Filter transactions for this account
            const accountTransactions = transactions.filter(
                t => t.accountId === account.id
            );

            // Add income, subtract expenses
            accountTransactions.forEach(t => {
                if (t.type === 'income') {
                    balance += t.amount;
                } else if (t.type === 'expense') {
                    balance -= t.amount;
                }
            });

            result[account.id] = balance;
        });

        return result;
    }, [accounts, transactions]);

    const addAccount = async (account: Omit<Account, "id" | "userId" | "createdAt">) => {
        if (!user) return;
        await addDoc(collection(db, "users", user.uid, "accounts"), {
            ...account,
            userId: user.uid,
            createdAt: Date.now(),
        });
    };

    const deleteAccount = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "accounts", id));
    };

    const updateAccount = async (id: string, updates: Partial<Omit<Account, "id" | "userId">>) => {
        if (!user) return;
        await updateDoc(doc(db, "users", user.uid, "accounts", id), updates);
    };

    const setDefaultAccount = async (id: string) => {
        if (!user) return;
        const batch = writeBatch(db);

        // Remove default from all accounts
        accounts.forEach(account => {
            if (account.isDefault) {
                batch.update(doc(db, "users", user.uid, "accounts", account.id), { isDefault: false });
            }
        });

        // Set the new default
        batch.update(doc(db, "users", user.uid, "accounts", id), { isDefault: true });

        await batch.commit();
    };

    const seedDefaults = async () => {
        if (!user) return;
        const batch = writeBatch(db);
        DEFAULT_ACCOUNTS.forEach(account => {
            const docRef = doc(collection(db, "users", user.uid, "accounts"));
            batch.set(docRef, {
                ...account,
                userId: user.uid,
                createdAt: Date.now(),
            });
        });
        await batch.commit();
    };

    const getDefaultAccount = () => {
        return accounts.find(account => account.isDefault) || accounts[0];
    };

    // Get balance for a specific account
    const getAccountBalance = (accountId: string): number => {
        return balances[accountId] ?? 0;
    };

    // Get total balance across all accounts
    const getTotalBalance = (): number => {
        return Object.values(balances).reduce((sum, balance) => sum + balance, 0);
    };

    return {
        accounts,
        loading,
        balances,
        addAccount,
        updateAccount,
        deleteAccount,
        setDefaultAccount,
        seedDefaults,
        getDefaultAccount,
        getAccountBalance,
        getTotalBalance,
        hasAccounts: accounts.length > 0
    };
}
