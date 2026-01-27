import { NextResponse } from "next/server";

interface HealthCheckResponse {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    version: string;
    uptime: number;
    checks: {
        name: string;
        status: "pass" | "fail";
        message?: string;
    }[];
}

export async function GET() {
    const startTime = Date.now();

    const checks: HealthCheckResponse["checks"] = [];

    // Check if environment is properly configured
    const hasFirebaseConfig = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );

    checks.push({
        name: "firebase_config",
        status: hasFirebaseConfig ? "pass" : "fail",
        message: hasFirebaseConfig
            ? "Firebase configuration present"
            : "Missing Firebase environment variables",
    });

    // Determine overall status
    const failedChecks = checks.filter((c) => c.status === "fail");
    let status: HealthCheckResponse["status"] = "healthy";
    if (failedChecks.length > 0) {
        status = failedChecks.length === checks.length ? "unhealthy" : "degraded";
    }

    const response: HealthCheckResponse = {
        status,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
        uptime: process.uptime(),
        checks,
    };

    const statusCode = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

    return NextResponse.json(response, {
        status: statusCode,
        headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    });
}
