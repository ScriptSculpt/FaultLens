
# High Latency Troubleshooting

## 1. Overview

High latency occurs when requests take longer than expected to complete. It can affect individual backend instances or the entire application.

In a load-balanced environment, identifying whether latency is isolated to a particular backend or shared across multiple instances is an important part of the investigation.

## 2. Common Symptoms

- API requests taking longer than usual.
- Increased response times across backend instances.
- One backend consistently responding slower than others.
- Increased total request processing time.
- Users experiencing intermittent slow responses.

## 3. Possible Causes

- Slow application processing or inefficient code.
- Expensive database queries.
- Resource contention, such as CPU or memory pressure.
- Slow downstream service dependencies.
- Network delays between services.
- Blocking operations or thread contention.
- Increased application workload.

These are possible causes, not confirmed root causes. Additional evidence is required to establish the actual cause.

## 4. Diagnostic Data to Collect

### HAProxy Backend Status

Inspect the status of all discovered backend instances.

Relevant fields:
- `status`: Whether HAProxy considers the backend UP or DOWN.
- `check_status`: Result of the latest health check.
- `check_duration`: Time taken by the HAProxy health check.

A backend can remain UP while responding slowly to application requests.

Note: Health-check duration is not the same as application request latency.

### HTTP Request Metrics

Inspect HAProxy metrics at the frontend, backend and individual server levels.

Relevant fields:
- `responseTime`: Average response time of recent requests, where available.
- `totalTime`: Average total session time, where available.
- `activeSessions`: Number of currently active sessions.
- `totalSessions`: Total sessions handled.
- `currentRequestRate`: Current frontend request rate.
- `maxRequestRate`: Maximum observed frontend request rate.

Compare response-time metrics across backend instances to identify potential latency hotspots.

Note: HAProxy `responseTime` and `totalTime` are rolling averages based on recent requests or sessions, not individual request timings.

### HAProxy Access Logs

Inspect access logs to identify slow individual requests.

Relevant fields:
- `timestamp`: When the request was processed.
- `server`: Backend instance handling the request.
- `statusCode`: HTTP response status.
- `path`: Requested endpoint.
- `queueTime`: Time spent waiting in the queue.
- `waitTime`: Time spent waiting for a connection from the server.
- `connectTime`: Time taken to establish the connection.
- `responseTime`: Time between sending the request to the backend and receiving its response.
- `totalTime`: Total time spent processing the request.

Compare these timings across requests and backend instances.

The HAProxy timing values are expressed in milliseconds.

### Application Logs

Inspect recent application logs from backends exhibiting higher response times.

Look for:
- Slow operation messages, if logged.
- Database or downstream dependency errors.
- Repeated warnings or exceptions.
- Long-running operations.
- Application-specific processing delays.

Application logs may provide additional context, but they do not necessarily record the duration of every request.

## 5. Understanding HAProxy Timing Values

HAProxy access logs provide five timing measurements:

- `Tq`: Time spent waiting in the queue.
- `Tw`: Time spent waiting for a connection from the server.
- `Tc`: Time required to establish the connection.
- `Tr`: Time until the server sends the complete response.
- `Tt`: Total time spent processing the request.

The values are recorded in milliseconds.

A higher `Tr` generally indicates that the backend took longer to produce its response.

A higher `Tq` or `Tw` may indicate queueing or connection availability issues rather than slow application execution.

## 6. Troubleshooting Approach

1. Inspect frontend and backend request metrics to determine whether latency is increasing.
2. Compare individual backend response-time averages.
3. Inspect HAProxy access logs for requests with unusually high response times.
4. Identify whether slow requests are concentrated on one backend or distributed across multiple instances.
5. Examine queue, connection and response timing values to understand where the delay occurs.
6. Retrieve recent application logs from the affected backend instances.
7. Correlate slow requests with application log timestamps and other available evidence.
8. Compare the affected instances with healthy or normally performing instances.
9. Form possible explanations based on the collected evidence.

## 7. Interpreting Findings

### Scenario A: One Backend Is Consistently Slow

If one backend has significantly higher response times than other instances:

- The latency may be isolated to that instance.
- Inspect its application logs for relevant errors or warnings.
- Compare its request timings with those of other backends.
- Investigate instance-specific resource or application issues if supporting evidence is available.

### Scenario B: All Backends Are Slow

If multiple backend instances show increased response times:

- The issue may involve shared dependencies or common application behavior.
- Investigate database and downstream service performance.
- Check whether increased request volume correlates with the latency.
- Look for similar patterns across application logs.

### Scenario C: High Response Time but Low Queue Time

If `Tr` is high while `Tq` and `Tw` remain low:

- The delay is more likely to occur after the request reaches the backend.
- Investigate application processing and backend dependencies.
- Do not assume the application itself is responsible without additional evidence.

### Scenario D: High Queue or Connection Wait Time

If `Tq` or `Tw` is unusually high:

- Requests may be waiting for available processing capacity or server connections.
- Investigate backend connection limits and queue behavior.
- Compare the timing patterns across instances.

## 8. Important Considerations

- A backend can be healthy according to HAProxy while still responding slowly.
- Health-check duration is not application request latency.
- Rolling averages can hide individual slow requests.
- A single slow request does not necessarily indicate a persistent latency problem.
- High total time does not automatically mean the backend application is slow.
- Do not infer CPU, memory or database problems unless supporting metrics or logs are available.
- Correlate multiple sources of evidence before identifying a likely cause.

## 9. Expected Investigation Outcome

The investigation should establish:

- Whether increased latency is occurring.
- Whether the latency is isolated to one backend or affects multiple instances.
- Which HAProxy timing components contribute to the delay.
- Whether application logs provide supporting evidence.
- Which possible causes are consistent with the observations.
- What additional investigation would help identify the underlying cause.
