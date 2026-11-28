
# Backend Unavailability Troubleshooting

## 1. Overview

A backend is considered unavailable when it cannot accept or successfully respond to requests according to the configured health-check conditions.

In a load-balanced environment, HAProxy periodically performs health checks on backend instances. When an instance fails the configured checks, HAProxy can mark it as DOWN and stop routing traffic to it.

Backend unavailability can result from container failures, application crashes, network connectivity problems or failed health checks.

## 2. Common Symptoms

- A backend instance is marked DOWN by HAProxy.
- Requests are no longer routed to a particular backend.
- The number of healthy backend instances decreases.
- HAProxy access logs show requests being handled by the remaining instances.
- Backend health-check failures appear in HAProxy statistics.
- Requests may fail if no usable backend instances remain.

## 3. Possible Causes

- Backend container or process has stopped.
- Application server has crashed.
- Backend is unreachable over the network.
- Health-check endpoint is returning an unsuccessful response.
- Health-check connection or response timeout.
- Incorrect backend configuration or service discovery.
- Resource exhaustion preventing the backend from responding.

These are possible causes, not confirmed root causes. Additional evidence is required to establish why an instance became unavailable.

## 4. Diagnostic Data to Collect

### HAProxy Backend Status

Inspect the discovered backend instances and their health-check information.

Relevant fields:
- `name`: Backend server instance name.
- `status`: Whether HAProxy considers the instance UP or DOWN.
- `check_status`: Result of the latest health check.
- `check_code`: HTTP status returned by the health check, where available.
- `check_duration`: Time taken by the health check.
- `check_desc`: Description of the health-check result.
- `lastchg`: Time in seconds since the backend last changed state.

A DOWN status indicates that the backend is failing HAProxy's configured availability checks.

### Backend Health Checks

Inspect the Spring Boot Actuator health endpoint for each discovered backend.

Endpoint:

`/actuator/health`

Relevant information:
- `status`: Application health status.
- `reachable`: Whether the endpoint could be reached successfully.

Compare the Actuator result with HAProxy's health-check status.

Important: The Actuator endpoint and HAProxy health checks may use different endpoints and conditions. Their results may therefore differ.

### HAProxy Request Metrics

Inspect frontend, backend and individual server metrics.

Relevant fields:
- `activeSessions`: Currently active sessions.
- `totalSessions`: Total sessions handled.
- `http2xx`: Successful HTTP responses.
- `http4xx`: Client error responses.
- `http5xx`: Server error responses.
- `responseTime`: Average response time of recent requests, where available.

A decrease in active backend participation may indicate that an instance is no longer receiving traffic.

### HAProxy Access Logs

Inspect access logs to understand how requests are being routed.

Relevant fields:
- `timestamp`: When the request was processed.
- `server`: Backend instance handling the request.
- `statusCode`: HTTP response status.
- `path`: Requested endpoint.
- `responseTime`: Time taken to receive the backend response.

Compare traffic before and after the suspected outage to identify whether requests stopped reaching the affected instance.

### Application Logs

Retrieve recent logs from the affected backend instance.

Look for:
- Application startup or shutdown messages.
- Exceptions and fatal errors.
- Configuration failures.
- Database or downstream connectivity errors.
- Unexpected process termination messages.

If the container is stopped, recent logs may be the only available application-level evidence.

## 5. Troubleshooting Approach

1. Discover all configured backend instances through HAProxy statistics.
2. Identify instances marked DOWN or failing health checks.
3. Compare HAProxy status with the results of backend Actuator health checks.
4. Inspect backend metrics to understand whether traffic is still reaching the affected instance.
5. Examine HAProxy access logs for changes in traffic distribution.
6. Retrieve recent application logs from the affected instance, if available.
7. Compare the affected instance with healthy instances.
8. Determine whether the evidence indicates a stopped process, failed health check, connectivity problem or another possible issue.
9. Record any uncertainty when the available diagnostic data cannot establish the cause.

## 6. Interpreting Findings

### Scenario A: Backend Marked DOWN by HAProxy

If HAProxy reports an instance as DOWN:

- HAProxy has detected a failure according to its configured health checks.
- Requests should no longer be routed to that instance while it remains unavailable.
- Inspect health-check details and application logs for additional evidence.

### Scenario B: Backend Is DOWN and Actuator Is Unreachable

If HAProxy marks an instance DOWN and its Actuator endpoint cannot be reached:

- The instance may be stopped, crashed or unreachable.
- Inspect container logs and infrastructure state if available.
- Do not assume the process has crashed solely because the endpoint is unreachable.

### Scenario C: Backend Is UP but Application Requests Fail

If HAProxy reports an instance as UP but application requests return errors:

- The instance is reachable according to the configured health check.
- The issue may be limited to application-level request processing.
- Investigate HTTP response codes and application logs.

### Scenario D: Traffic Continues Through Remaining Instances

If one backend becomes DOWN while other instances remain UP:

- HAProxy can continue distributing requests among the remaining healthy instances.
- The backend pool has reduced capacity.
- Investigate whether the remaining instances are experiencing increased traffic or latency.

### Scenario E: All Backend Instances Are DOWN

If no usable backend instances remain:

- HAProxy cannot route requests to a healthy backend.
- Client requests may fail with gateway or service-unavailable errors, depending on the configuration.
- Investigate the backend instances and HAProxy health-check failures.

## 7. Important Considerations

- HAProxy's UP/DOWN status reflects its configured health-check conditions.
- An Actuator health endpoint reporting UP does not guarantee that all application endpoints are functioning correctly.
- A failed health check does not automatically prove that the application process has stopped.
- When a backend is DOWN, HAProxy may continue serving requests through other available instances.
- Missing logs from an unavailable container do not establish the exact reason for the outage.
- Do not assume that a backend is permanently unavailable based on a single failed health check.
- Distinguish backend unavailability from application-level HTTP 5xx errors.

## 8. Expected Investigation Outcome

The investigation should establish:

- Which backend instances are unavailable.
- Whether HAProxy has removed them from traffic distribution.
- Whether the Actuator health endpoint is reachable.
- How traffic is being handled by the remaining instances.
- What evidence exists about the cause of unavailability.
- Whether the backend pool has sufficient healthy instances to continue serving traffic.
- What additional investigation would help determine the root cause.
