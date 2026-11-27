import axios from "axios";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

dotenv.config();

// HAPROXY STATS PATH
const HAPROXY_STATS_URL = process.env.HAPROXY_STATS_URL;

// Function to convert string to number, returning null for empty strings
const toNumber = (value: string) => value === "" ? null : Number(value);

interface ServerMetrics {
    name: string;
    status: string;
    activeSessions: number | null;
    totalSessions: number | null;
    bytesIn: number | null;
    bytesOut: number | null;
    requestErrors: number | null;
    responseErrors: number | null;
    http2xx: number | null;
    http4xx: number | null;
    http5xx: number | null;
    responseTime: number | null;
    totalTime: number | null;
}

interface BackendSummaryMetrics {
    activeSessions: number | null;
    totalSessions: number | null;
    bytesIn: number | null;
    bytesOut: number | null;
    requestErrors: number | null;
    responseErrors: number | null;
    http2xx: number | null;
    http4xx: number | null;
    http5xx: number | null;
    responseTime: number | null;
    totalTime: number | null;
}

interface FrontendMetrics {
    activeSessions: number | null;
    totalSessions: number | null;
    bytesIn: number | null;
    bytesOut: number | null;
    requestErrors: number | null;
    http2xx: number | null;
    http4xx: number | null;
    http5xx: number | null;
    currentRequestRate: number | null;
    maxRequestRate: number | null;
    totalRequests: number | null;
}

export interface RequestMetrics {
    frontend: FrontendMetrics;
    backend: BackendSummaryMetrics;
    servers: ServerMetrics[];
}

// Function to get request metrics from HAProxy stats
export const getRequestMetrics = async () => {
    if (!HAPROXY_STATS_URL) {
        throw new Error("HAPROXY_STATS_URL is not defined");
    }

    // Format the response to get the request metrics
    return axios.get(HAPROXY_STATS_URL, {
        timeout: 5000,
    })
    .then((response) => {
        const csvData = parse(response.data, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true
        });

        const frontend: any = csvData.find((row: any) =>
            row['# pxname'] === "http_frontend" &&
            row.svname === "FRONTEND"
        );

        const frontendMetrics: FrontendMetrics = {
            activeSessions: toNumber(frontend.scur),
            totalSessions: toNumber(frontend.stot),
            bytesIn: toNumber(frontend.bin),
            bytesOut: toNumber(frontend.bout),
            requestErrors: toNumber(frontend.ereq),
            http2xx: toNumber(frontend.hrsp_2xx),
            http4xx: toNumber(frontend.hrsp_4xx),
            http5xx: toNumber(frontend.hrsp_5xx),
            currentRequestRate: toNumber(frontend.req_rate),
            maxRequestRate: toNumber(frontend.req_rate_max),
            totalRequests: toNumber(frontend.req_tot)
        };

        const backendSummary: any = csvData.find((row: any) =>
            row['# pxname'] === "http_backend" &&
            row.svname === "BACKEND"
        );

        const backendMetrics: BackendSummaryMetrics = {
            activeSessions: toNumber(backendSummary.scur),
            totalSessions: toNumber(backendSummary.stot),
            bytesIn: toNumber(backendSummary.bin),
            bytesOut: toNumber(backendSummary.bout),
            requestErrors: toNumber(backendSummary.ereq),
            responseErrors: toNumber(backendSummary.eresp),
            http2xx: toNumber(backendSummary.hrsp_2xx),
            http4xx: toNumber(backendSummary.hrsp_4xx),
            http5xx: toNumber(backendSummary.hrsp_5xx),
            responseTime: toNumber(backendSummary.rtime),
            totalTime: toNumber(backendSummary.ttime)
        };

        const backendServers: any[] = csvData.filter((row: any) =>
            row['# pxname'] === "http_backend" &&
            row.svname !== "BACKEND"
        );

        const serverMetrics: ServerMetrics[] = backendServers.map((server: any) => ({
            name: server.svname,
            status: server.status,
            activeSessions: toNumber(server.scur),
            totalSessions: toNumber(server.stot),
            bytesIn: toNumber(server.bin),
            bytesOut: toNumber(server.bout),
            requestErrors: toNumber(server.ereq),
            responseErrors: toNumber(server.eresp),
            http2xx: toNumber(server.hrsp_2xx),
            http4xx: toNumber(server.hrsp_4xx),
            http5xx: toNumber(server.hrsp_5xx),
            responseTime: toNumber(server.rtime),
            totalTime: toNumber(server.ttime)
        }));

        const metrics: RequestMetrics = {
            frontend: frontendMetrics,
            backend: backendMetrics,
            servers: serverMetrics
        };

        return metrics;
    })
    .catch((err) => {
        console.error("Failed to fetch request metrics from HAProxy:", err);
        throw new Error("Failed to fetch request metrics from HAProxy");
    });

}
