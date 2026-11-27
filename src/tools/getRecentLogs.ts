import { exec } from "child_process";
import { BackendServer, discoverBackends } from "./discoverBackends.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const LOKI_URL = process.env.LOKI_URL;

// Function to get recent logs of a backend server
export const getRecentLogs = async (serverName: string) => {
    // Verify if the serverName is valid
    const servers: BackendServer[] = await discoverBackends();
    const server = servers.find((s) => s.name === serverName);
    if (!server) {
        throw new Error(`Server ${serverName} not found`);
    }

    // Verify if loki is configured
    if (!LOKI_URL) {
        throw new Error("LOKI_URL is not defined");
    }

    // Fetch logs from loki
    return axios.get(`${LOKI_URL}/loki/api/v1/query_range`, {
        params: {
            query: `{container_name="/${serverName}"}`,
            limit: 20,
            direction: "backward",
        },
        timeout: 5000
    })
    .then((res) => {
        return res.data.data.result.flatMap((stream: any) =>
            stream.values
                .map(([timestamp, message]: [string, string]) => ({
                    timestamp: new Date(Number(timestamp) / 1_000_000).toISOString(),
                    message: JSON.parse(message).log
                }))
                .filter((log: any) => log.message?.trim() !== "")
        );
    })
    .catch((err) => {
        console.error(`Failed to fetch logs from loki for server ${serverName}:`, err);
        throw new Error(`Failed to fetch logs for server ${serverName}`);
    });
    
};