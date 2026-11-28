
# Backend Recovery Procedures

## 1. Overview

Backend recovery occurs when an instance that was previously unavailable becomes operational again.

In a load-balanced environment, HAProxy periodically performs health checks on backend instances. When an unavailable instance starts passing the configured health checks, HAProxy can mark it as UP and resume routing traffic to it.

Recovery should be verified using multiple sources of diagnostic evidence rather than assuming that restarting a container guarantees successful recovery.

## 2. Common Recovery Indicators

- A previously DOWN backend is reported as UP by HAProxy.
- Health checks begin passing successfully.
- The backend becomes reachable through its health endpoint.
- The backend starts receiving application requests again.
- Application logs show successful startup.
- The number of healthy backend instances returns to its expected value.

## 3. Possible Recovery Scenarios

- A stopped container is restarted.
- A crashed application process is restarted.
- A temporary network connectivity issue is resolved.
- A failed health-check endpoint becomes operational.
- An application configuration or dependency issue is corrected.

A successful restart does not necessarily mean the original problem has been resolved permanently. The backend should be monitored through available diagnostic evidence during the investigation.

## 4. Diagnostic Data to Collect

### HAProxy Backend Status

Inspect the backend's current health-check status.

Relevant fields:
- `status`: Whether HAProxy considers the backend UP or DOWN.
- `check_status`: Result of the latest health check.
- `check_code`: HTTP status returned by the health check.
- `check_duration`: Time taken by the health check.
- `check_desc`: Description of the health-check result.
- `lastchg`: Time in seconds since the backend last changed state.

A transition from DOWN to UP indicates that HAProxy has detected that the configured health-check condition is passing again.

### Backend Health Checks

Inspect the Spring Boot Actuator endpoint:

`/actuator/health`

Relevant information:
- `status`: Application health status.
- `reachable`: Whether the endpoint could be reached successfully.

Compare the result with HAProxy's current health-check status.

### Application Logs

Retrieve recent logs from the recovered backend.

Look for:
- Application startup messages.
- Spring Boot initialization messages.
- Successful server startup.
- Configuration or dependency initialization errors.
- Repeated exceptions after startup.

Successful startup messages provide evidence that the application initialized, but do not guarantee that every application endpoint is working correctly.

### HAProxy Request Metrics

Inspect metrics at the frontend, backend and individual server levels.

Relevant fields:
- `totalSessions`: Total sessions handled.
- `activeSessions`: Currently active sessions.
- `http2xx`: Successful HTTP responses.
- `http4xx`: Client error responses.
- `http5xx`: Server error responses.
- `responseTime`: Average response time of recent requests, where available.

Compare metrics before and after recovery to identify changes in traffic distribution.

### HAProxy Access Logs

Inspect access logs to verify whether requests are being routed to the recovered backend.

Relevant fields:
- `timestamp`: When the request was processed.
- `server`: Backend instance handling the request.
- `statusCode`: HTTP response status.
- `path`: Requested endpoint.
- `responseTime`: Time taken to receive the backend response.

Successful requests routed to the recovered instance provide evidence that it has resumed handling traffic.

## 5. Recovery Verification Approach

1. Identify the backend instance that was previously unavailable.
2. Inspect its current HAProxy health-check status.
3. Verify whether HAProxy now reports the instance as UP.
4. Check whether the Actuator health endpoint is reachable.
5. Inspect application logs for successful startup and initialization.
6. Review HAProxy access logs to determine whether requests are reaching the recovered instance.
7. Inspect request metrics to compare its behavior with other healthy instances.
8. Check for recurring HTTP errors or unusually high response times.
9. Confirm whether the backend pool has returned to its expected healthy state.

## 6. Interpreting Findings

### Scenario A: Backend Transitions from DOWN to UP

If HAProxy previously reported the instance as DOWN and now reports it as UP:

- The configured health-check condition is passing again.
- HAProxy considers the backend eligible to receive traffic.
- Verify that application requests are reaching the instance.

### Scenario B: Actuator Is UP but HAProxy Still Reports DOWN

If the Actuator health endpoint is reachable but HAProxy continues to report DOWN:

- The two health checks may use different endpoints or conditions.
- Inspect HAProxy health-check configuration and failure details.
- Verify network connectivity between HAProxy and the backend.

### Scenario C: HAProxy Reports UP but Application Requests Fail

If the backend is UP but application requests continue returning errors:

- The health check may not cover the failing application functionality.
- Inspect access logs and application logs.
- Investigate application-level failures separately from backend availability.

### Scenario D: Backend Is UP but Receives No Traffic

If HAProxy reports the backend as UP but access logs do not show requests reaching it:

- Check whether application traffic is being generated.
- Inspect HAProxy backend configuration and load-balancing behavior.
- Consider whether the observation window contains enough requests to establish traffic distribution.

### Scenario E: Backend Recovers but Errors Continue

If the backend becomes UP but continues returning HTTP 5xx responses or unusually slow responses:

- Availability has recovered, but application behavior may still be degraded.
- Compare request metrics and access logs.
- Inspect recent application logs for recurring problems.

## 7. Important Considerations

- Restarting a container does not automatically prove that the application has recovered successfully.
- HAProxy marks a backend UP based on its configured health-check conditions.
- Health-check recovery and application-level recovery are not necessarily equivalent.
- A backend may need to pass multiple successful health checks before HAProxy marks it UP, depending on its configuration.
- Traffic distribution depends on the configured load-balancing algorithm and current backend state.
- A small number of requests may not be sufficient to establish normal traffic distribution.
- Recovery should be validated using health checks, application logs and actual request behavior.
- Do not claim that the original root cause has been fixed unless there is supporting evidence.

## 8. Expected Investigation Outcome

The investigation should establish:

- Whether the previously unavailable backend has recovered.
- Whether HAProxy recognizes the backend as UP.
- Whether the application health endpoint is reachable.
- Whether application startup completed successfully.
- Whether the backend has resumed receiving requests.
- Whether HTTP errors or latency issues remain.
- Whether the backend pool has returned to its expected state.
