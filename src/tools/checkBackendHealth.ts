import axios from "axios";
import { BackendServer } from "./discoverBackends.js";

// Function used to check the health of the backend servers
export const checkBackendHealth = async (servers: BackendServer[]) => {
    
    // return a promise that resolves when all health checks are complete
    return Promise.all(
        servers.map((server) => {
            // Perform health check for each server
            return axios.get(`http://${server.name}:8080/actuator/health`, 
                { timeout: 5000 }
            )
            .then((res) => ({
                name: server.name,
                status: res.data.status,
                reachable: true
            }))
            .catch((err) => ({
                name: server.name,
                status: "DOWN",
                reachable: false
            }));
        })
    )
};