
# HAProxy Troubleshooting

## 1. Overview

HAProxy is a load balancer that distributes incoming client requests across configured backend servers.

It provides backend health checks, traffic distribution and request-level statistics that help identify availability and performance issues.

Troubleshooting HAProxy involves examining its backend configuration, server health, request metrics and access logs.

## 2. Common Symptoms

- Requests are not distributed as expected across backend servers.
- One or more backend instances are marked DOWN.
- Requests return HTTP 5xx responses.
- Increased request latency.
- Some backend instances receive significantly more traffic than others.
- Requests fail because no healthy backend servers are available.
- HAProxy statistics show unexpected traffic or error patterns.

## 3. Possible Causes

- Backend server failures or unavailability.
- Incorrect backend server configuration.
- Failed or misconfigured health checks.
- Load-balancing algorithm behavior.
- Backend connection limits or queueing.
- Network connectivity issues.
- Slow backend responses.
- Incorrect frontend or backend routing configuration.

These are possible causes, not confirmed root causes. Additional evidence is required to establish the actual issue.

## 4. Diagnostic Data to Collect

### Backend Discovery

Use HAProxy statistics to discover configured backend instances.

Relevant fields:
- `name`: Backend server name.
- `backend`: HAProxy backend name.
- `status`: Current server status.
- `check_status`: Latest health-check result.
- `check_code`: HTTP status returned by the health check.
- `check_duration`: Health-check duration.
- `lastchg`: Time in seconds since the server last changed state.

This information helps establish which servers HAProxy currently recognizes and their availability status.

### HAProxy Backend Status

Inspect the overall backend pool.

Relevant information:
- Total configured backend servers discovered.
- Number of healthy servers.
- Number of unavailable servers.
- Overall backend pool status.

A degraded backend pool indicates that at least one discovered server is not currently reported as UP.

### Request Metrics

Inspect frontend, backend and individual server metrics.

Relevant fields:

**Frontend metrics**
- `activeSessions`: Currently active sessions.
- `totalSessions`: Total sessions handled.
- `bytesIn`: Bytes received.
- `bytesOut`: Bytes sent.
- `http2xx`: Successful HTTP responses.
- `http4xx`: Client error responses.
- `http5xx`: Server error responses.
- `currentRequestRate`: Current request rate.
- `maxRequestRate`: Maximum observed request rate.
- `totalRequests`: Total HTTP requests.

**Backend and server metrics**
- `activeSessions`: Currently active sessions.
- `totalSessions`: Total sessions handled.
- `bytesIn`: Bytes received.
- `bytesOut`: Bytes sent.
- `http2xx`: Successful HTTP responses.
- `http4xx`: Client error responses.
- `http5xx`: Server error responses.
- `responseTime`: Average response time of recent requests, where available.
- `totalTime`: Average total session time, where available.

Compare frontend, backend and individual server metrics to identify traffic patterns and potential problems.

Note: HAProxy response-time and total-time metrics are rolling averages, not individual request durations.

### HAProxy Access Logs

Inspect HTTP access logs to understand request routing and backend behavior.

Relevant fields:
- `timestamp`: When the request was processed.
- `client`: Client address and port.
- `frontend`: HAProxy frontend handling the request.
- `backend`: HAProxy backend handling the request.
- `server`: Backend instance selected for the request.
- `statusCode`: HTTP response status.
- `bytesRead`: Response bytes recorded by HAProxy.
- `method`: HTTP request method.
- `path`: Requested endpoint.
- `queueTime`: Queue waiting time.
- `waitTime`: Server connection waiting time.
- `connectTime`: Connection establishment time.
- `responseTime`: Time taken to receive the backend response.
- `totalTime`: Total request processing time.

These logs provide request-level evidence that complements the aggregate HAProxy statistics.

## 5. Troubleshooting Approach

1. Discover the configured backend servers through HAProxy statistics.
2. Inspect the health-check status of each backend.
3. Determine whether any servers are DOWN or failing health checks.
4. Inspect backend and frontend request metrics.
5. Compare traffic and response metrics across individual backend instances.
6. Inspect access logs to identify which backend handled each request.
7. Correlate HTTP status codes with the selected backend and response timings.
8. Identify possible routing, availability or performance issues.
9. Use application logs and health-check results to investigate backend-specific problems.
10. Form conclusions only when supported by collected evidence.

## 6. Interpreting Findings

### Scenario A: Backend Server Is DOWN

If HAProxy reports a backend instance as DOWN:

- Inspect its health-check result and description.
- Determine whether other backend instances remain healthy.
- Check whether traffic continues through the remaining instances.
- Investigate the affected backend separately.

### Scenario B: Traffic Is Not Distributed Evenly

If some backend instances receive more requests than others:

- Inspect the configured load-balancing algorithm.
- Compare the number of requests handled by each instance.
- Consider the effect of persistent connections or session persistence, if configured.
- Generate sufficient requests before concluding that traffic distribution is abnormal.

An uneven distribution does not automatically indicate a HAProxy failure.

### Scenario C: One Backend Has Higher Response Times

If one backend consistently has higher response times:

- Identify the affected instance through server-level metrics.
- Inspect its individual access-log timings.
- Retrieve its application logs.
- Determine whether the delay occurs during connection establishment, queueing or backend response processing.

### Scenario D: HTTP 5xx Responses Are Increasing

If HAProxy metrics show increased HTTP 5xx responses:

- Inspect access logs to identify the backend instances returning errors.
- Compare error counts across servers.
- Retrieve application logs from affected instances.
- Distinguish backend-generated HTTP errors from failures generated by HAProxy itself.

### Scenario E: No Healthy Backend Servers Remain

If all backend instances are unavailable:

- HAProxy has no healthy backend server to route requests to.
- Client requests may receive gateway or service-unavailable errors, depending on the configuration.
- Investigate backend health-check failures and instance availability.

## 7. Important Considerations

- HAProxy backend status reflects configured health-check conditions.
- An UP backend is not guaranteed to return successful application responses.
- Aggregate metrics can hide problems affecting individual backend instances.
- Rolling response-time averages should not be interpreted as individual request timings.
- Uneven traffic distribution may be expected depending on the load-balancing algorithm and connection behavior.
- Access logs and statistics provide different levels of detail and should be correlated.
- HAProxy access logs may also contain requests to its statistics interface; exclude those when investigating application traffic.
- Do not assume that every HTTP 5xx response originates from HAProxy. Inspect the selected backend and request status.
- Do not claim a configuration issue without examining the relevant configuration or supporting evidence.

## 8. Expected Investigation Outcome

The investigation should establish:

- Whether HAProxy can discover the expected backend instances.
- Which backend instances are healthy or unavailable.
- Whether traffic is being distributed as expected.
- Whether request errors are concentrated on specific instances.
- Whether latency is associated with particular backends or request timings.
- Whether HAProxy access logs and application logs provide supporting evidence.
- Which possible causes are supported by the collected data.
- What additional investigation would help confirm the underlying issue.
