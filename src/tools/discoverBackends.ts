import axios from "axios";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

dotenv.config();

// HAPROXY STATS PATH
const HAPROXY_STATS_URL = process.env.HAPROXY_STATS_URL;

// interface for backend servers data
export interface BackendServer {
    name: string;
    backend: string;
    status: string;
    check_status?: string;
    check_code?: number;
    check_duration?: number;
    check_desc?: string;
    lastchg?: number;
}

// Function to discover backend servers from HAProxy stats
export const discoverBackends = async (): Promise<BackendServer[]> => {
    if (!HAPROXY_STATS_URL) {
        throw new Error("HAPROXY_STATS_URL is not defined");
    }

    // Fetch the HAProxy stats CSV data
    const response = await axios.get(HAPROXY_STATS_URL, {
        timeout: 5000,
    });

    // Parse the CSV data
    const csvData = parse(response.data, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    });

    // console.log("CSV Data:", csvData);
    
    // Filter the data to get only backend servers
    const backendServers: BackendServer[] = csvData.filter(
        (row: any) => 
            row['# pxname'] === "http_backend" &&
            row.svname !== "BACKEND"
    )
    .map((row: any) => ({
        name: row.svname,
        backend: row['# pxname'],
        status: row.status,
        check_status: row.check_status,
        check_code: Number(row.check_code),
        check_duration: Number(row.check_duration),
        check_desc: row.check_desc,
        lastchg: Number(row.lastchg)
    }));

    // console.log("Discovered Backend Servers:", backendServers);

    return backendServers;
}