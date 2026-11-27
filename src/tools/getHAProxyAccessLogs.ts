import axios from "axios";
import dotenv from "dotenv";


dotenv.config();

const LOKI_URL = process.env.LOKI_URL;


export interface HAProxyAccessLog {
    timestamp: string;
    client: string;
    frontend: string;
    backend: string;
    server: string;
    queueTime: number;
    waitTime: number;
    connectTime: number;
    responseTime: number;
    totalTime: number;
    statusCode: number;
    bytesRead: number;
    method: string;
    path: string;
    httpVersion: string;
}

const parseAccessLog = (log: string): HAProxyAccessLog | null => {
    const match = log.match(
        /^(\S+) \[([^\]]+)\] (\S+) (\S+) (\d+\/\d+\/\d+\/\d+\/\d+) (\d{3}) (\d+) .*"(\S+) (\S+) (HTTP\/\S+)"/
    );

    if(!match) {
        return null;
    }

    const [ , client, timestamp, frontend, backendServer,
        timings, statusCode, bytesRead, method, path, httpVersion
    ] = match;

    const [queueTime, waitTime, connectTime, responseTime, totalTime] = timings.split('/').map(Number);

    const [backend, server] = backendServer.split('/');

    return {
        timestamp,
        client,
        frontend,
        backend,
        server,
        queueTime,
        waitTime,
        connectTime,
        responseTime,
        totalTime,
        statusCode: Number(statusCode),
        bytesRead: Number(bytesRead),
        method,
        path,
        httpVersion
    };
}

export const getHAProxyAccessLogs = () => {
    if(!LOKI_URL) {
        throw new Error("LOKI_URL is not defined");
    }

    return axios.get(`${LOKI_URL}/loki/api/v1/query_range`, {
        params: {
            query: `{container_name="/haproxy", source="stdout"} |= "http_frontend"`,
            limit: 50,
            direction: "backward",
        },
        timeout: 5000
    })
    .then((res) => {
        return res.data.data.result.flatMap((stream: any) =>
            stream.values
                .map(([timestamp, message]: [string, string]) => {
                    const logMessage = JSON.parse(message).log;
                    return parseAccessLog(logMessage);
                })
                .filter((log: HAProxyAccessLog | null) => log !== null)
        );
    })
    .catch((err) => {
        console.error("Failed to get HAProxy access logs", err);
        throw new Error("Failed to get HAProxy access logs");
    });
}