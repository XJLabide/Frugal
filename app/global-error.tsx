"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global application error:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f8fafc",
                    padding: "1rem",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                    <div style={{
                        maxWidth: "28rem",
                        width: "100%",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "4rem",
                            height: "4rem",
                            borderRadius: "50%",
                            backgroundColor: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.5rem"
                        }}>
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#dc2626"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                            </svg>
                        </div>

                        <h1 style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "#0f172a",
                            marginBottom: "0.5rem"
                        }}>
                            Critical Error
                        </h1>
                        <p style={{
                            color: "#64748b",
                            marginBottom: "1.5rem"
                        }}>
                            A critical error occurred. Please refresh the page to continue.
                        </p>

                        {error.digest && (
                            <p style={{
                                fontSize: "0.75rem",
                                color: "#94a3b8",
                                fontFamily: "monospace",
                                marginBottom: "1rem"
                            }}>
                                Error ID: {error.digest}
                            </p>
                        )}

                        <button
                            onClick={reset}
                            style={{
                                backgroundColor: "#0f172a",
                                color: "white",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                fontWeight: "500"
                            }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
