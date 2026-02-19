"use client";

import { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/NotificationProvider";

const COLLECTIONS_TO_DELETE = [
    "transactions",
    "categories",
    "budgets",
    "goals",
    "recurring_transactions",
    "tags",
    "accounts",
    "transfers",
    "notifications",
    "budget_alerts",
    "bill_reminders",
];

export function ResetSettings() {
    const { user } = useAuthStore();
    const { success, error: showError } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isResetting, setIsResetting] = useState(false);
    const [progress, setProgress] = useState("");

    const handleReset = async () => {
        if (!user || confirmText !== "DELETE") return;

        setIsResetting(true);
        try {
            for (const collectionName of COLLECTIONS_TO_DELETE) {
                setProgress(`Deleting ${collectionName}...`);
                const colRef = collection(db, "users", user.uid, collectionName);
                const snapshot = await getDocs(colRef);

                // Firestore batches have a 500 operation limit
                const batchSize = 500;
                let count = 0;
                let batch = writeBatch(db);

                for (const docSnapshot of snapshot.docs) {
                    batch.delete(doc(db, "users", user.uid, collectionName, docSnapshot.id));
                    count++;

                    if (count % batchSize === 0) {
                        await batch.commit();
                        batch = writeBatch(db);
                    }
                }

                // Commit remaining
                if (count % batchSize !== 0) {
                    await batch.commit();
                }
            }

            success({ title: "All data has been reset successfully." });
            setIsModalOpen(false);
            setConfirmText("");
        } catch (err) {
            console.error("Error resetting data:", err);
            showError({ title: "Failed to reset data. Please try again." });
        } finally {
            setIsResetting(false);
            setProgress("");
        }
    };

    return (
        <>
            <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Permanently delete all your data including transactions, budgets, goals,
                        categories, accounts, tags, and recurring transactions. This action cannot be undone.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Reset All Data
                    </Button>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (!isResetting) {
                        setIsModalOpen(false);
                        setConfirmText("");
                    }
                }}
                title="Reset All Data"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-red-700 dark:text-red-300">
                            <p className="font-semibold mb-1">This will permanently delete:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-red-600 dark:text-red-400">
                                <li>All transactions</li>
                                <li>All budgets</li>
                                <li>All savings goals</li>
                                <li>All categories</li>
                                <li>All accounts</li>
                                <li>All tags</li>
                                <li>All recurring transactions</li>
                                <li>All transfers</li>
                                <li>All notifications &amp; alerts</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Type <span className="font-bold text-red-600">DELETE</span> to confirm
                        </label>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            disabled={isResetting}
                            autoFocus
                        />
                    </div>

                    {progress && (
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {progress}
                        </p>
                    )}

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                setConfirmText("");
                            }}
                            disabled={isResetting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReset}
                            disabled={confirmText !== "DELETE" || isResetting}
                        >
                            {isResetting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Everything"
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
