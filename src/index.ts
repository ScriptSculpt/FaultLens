import { checkBackendHealth } from "./tools/checkBackendHealth.js";
import { discoverBackends } from "./tools/discoverBackends.js";
import { getHAProxyAccessLogs } from "./tools/getHAProxyAccessLogs.js";
import { getHAProxyStatus } from "./tools/getHAProxyStatus.js";
import { getRecentLogs } from "./tools/getRecentLogs.js";
import { getRequestMetrics } from "./tools/getRequestMetrics.js";
import { pool } from "./config/database.js";
import { loadDocuments } from "./rag/loadDocuments.js";
import { splitDocuments } from "./rag/splitDocuments.js";
import { embedDocuments } from "./rag/embedDocuments.js";
import { storeDocuments } from "./rag/storeDocuments.js";
import { retrieveDocuments } from "./rag/retrieveDocuments.js";

console.log("FaultLens is running!!!");

// const servers = await discoverBackends();

// const health = await checkBackendHealth(servers);

// const status = await getHAProxyStatus(servers);

// console.log("Backend Health Check Results:", health);
// console.log("HAProxy Status:", status);

// const logs = await getRecentLogs("server-2");

// console.log("Logs for server-2:", logs);

// getRecentLogs("server-1")
//     .then((logs) => console.dir(logs, { depth: null }))
//     .catch((err) => console.error(err));

// const requestMetrics = await getRequestMetrics();
// console.log("Request Metrics:", requestMetrics);


// const accessLog = await getHAProxyAccessLogs();
// console.log("HAProxy Access Log:", accessLog);



// pool.query("SELECT NOW()")
//     .then((res) => {
//         console.log("Database connected!");
//         console.log("Database time:", res.rows[0].now);
//     })
//     .catch((err) => {
//         console.error("Database connection failed:", err);
//     })
//     .finally(() => pool.end());

// const documents = await loadDocuments();
// console.log("Documents loaded:", documents.length);

// const chunks = await splitDocuments(documents);
// console.log("Chunks created:", chunks.length);

// const embeddings = await embedDocuments(chunks);
// console.log("Embeddings created:", embeddings.length);

// const storeResult = await storeDocuments(chunks, embeddings);
// console.log("Documents stored:", storeResult);

try {
    const results = await retrieveDocuments(
        "One of the backend servers is responding very slowly"
    );

    results.forEach((result, index) => {
        console.log(`\nResult ${index + 1}`);
        console.log("Source:", result.metadata.source);
        console.log("Distance:", result.distance);
        console.log("Content:", result.content);
    });
} catch (err) {
    console.error("Error retrieving documents:", err);
} finally {
    await pool.end();
}