import { BackendServer } from "./discoverBackends.js";


// Function to get the status of HAProxy
export const getHAProxyStatus = async (servers: BackendServer[]) => {
    const totalServers = servers.length;
    const upServers = servers.filter(server => server.status === "UP").length;
    const downServers = totalServers - upServers;

    return {
        backend: servers[0]?.backend || "Unknown",
        totalServers,
        upServers,
        downServers,
        status: downServers > 0 ? "DEGRADED" : "UP"
    };
};