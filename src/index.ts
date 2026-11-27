import { checkBackendHealth } from "./tools/checkBackendHealth.js";
import { discoverBackends } from "./tools/discoverBackends.js";
import { getHAProxyAccessLogs } from "./tools/getHAProxyAccessLogs.js";
import { getHAProxyStatus } from "./tools/getHAProxyStatus.js";
import { getRecentLogs } from "./tools/getRecentLogs.js";
import { getRequestMetrics } from "./tools/getRequestMetrics.js";

console.log("FaultLens is running!!!");

const servers = await discoverBackends();

const health = await checkBackendHealth(servers);

const status = await getHAProxyStatus(servers);

// console.log("Backend Health Check Results:", health);
// console.log("HAProxy Status:", status);

// const logs = await getRecentLogs("server-2");

// console.log("Logs for server-2:", logs);

// getRecentLogs("server-1")
//     .then((logs) => console.dir(logs, { depth: null }))
//     .catch((err) => console.error(err));

// const requestMetrics = await getRequestMetrics();
// console.log("Request Metrics:", requestMetrics);

const sampleLog = `192.168.65.1:43221 [27/Nov/2026:17:41:39.847] http_frontend http_backend/server-2 0/0/1/32/33 500 156 - - ---- 1/1/0/0/0 0/0 "GET / HTTP/1.1"`;
const accessLog = await getHAProxyAccessLogs();
console.log("HAProxy Access Log:", accessLog);