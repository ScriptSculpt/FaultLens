
# Backend Error Troubleshooting

## 1. Overview

Backend errors occur when an application server fails to process a request successfully. These failures may result in HTTP 5xx responses being returned to clients.

A backend can remain reachable and still return application-level errors. Therefore, backend availability and application correctness must be investigated separately.

## 2. Common Symptoms

- HTTP 500 Internal Server Error responses.
- Increased HTTP 5xx response counts.
- Requests consistently failing on a particular backend instance.
- HAProxy access logs showing requests routed to a backend that returned an error.
- Application logs containing exceptions or error messages.

## 3. Possible Causes

- Unhandled exceptions in application code.
- Invalid application state or unexpected input.
- Database connectivity or query failures.
- Missing configuration or environment variables.
- Failures in downstream services.
- Resource exhaustion or application-level failures.

These are possible causes, not confirmed root causes. Additional evidence is required before identifying the actual cause.

## 4. Diagnostic Data to Collect

### HAProxy Backend Status

Inspect the discovered backend instances and their HAProxy health-check status.

Relevant fields:
- `status`: Whether HAProxy considers the backend UP or DOWN.
- `check_status`: Result of the latest health check.
- `check_code`: HTTP status returned by the health check.
- `lastchg`: Time in seconds since the backend last changed state.

An UP status does not guarantee that every application endpoint is functioning correctly.

### HTTP Request Metrics

Inspect HAProxy request metrics at the frontend, backend and individual server levels.

Relevant fields:
- `http2xx`: Successful HTTP responses.
- `http4xx`: Client error responses.
- `http5xx`: Server error responses.
- `responseTime`: Average response time of recent requests, where available.
- `totalTime`: Average total session time, where available.

Compare individual server metrics to identify whether errors are concentrated on a particular instance.

Note: HAProxy response-time metrics are rolling averages, not the duration of an individual request.

### HAProxy Access Logs

Inspect access logs to identify the backend that handled a failed request.

Relevant fields:
- `timestamp`: When the request was processed.
- `backend`: HAProxy backend name.
- `server`: Backend server that handled the request.
- `statusCode`: HTTP response status.
- `method`: HTTP request method.
- `path`: Requested endpoint.
- `responseTime`: Time taken to receive the backend response.
- `totalTime`: Total request processing time recorded by HAProxy.

Use these logs to correlate HTTP errors with specific backend instances and request paths.

### Application Logs

Inspect recent logs from the backend instance associated with the failed request.

Look for:
- Exceptions and stack traces.
- Error messages.
- Database or downstream service failures.
- Application startup or configuration errors.

Application logs may provide additional context about why a request failed.

## 5. Troubleshooting Approach

1. Identify whether HTTP 5xx responses are occurring using HAProxy request metrics.
2. Inspect HAProxy access logs to identify which backend instances are returning errors.
3. Determine whether failures are isolated to one backend or affect multiple instances.
4. Check HAProxy backend status to distinguish availability problems from application-level failures.
5. Retrieve recent application logs from the affected backend.
6. Correlate timestamps, request paths, HTTP status codes and application log messages.
7. Compare the affected backend's metrics with those of healthy instances.
8. Form possible explanations based on the collected evidence.

## 6. Interpreting Findings

### Scenario A: One Backend Returns HTTP 500

If access logs show HTTP 500 responses consistently originating from one backend while other instances return successful responses:

- The failure may be isolated to that backend.
- Inspect its application logs for exceptions or application-specific failures.
- Compare its behavior with healthy backend instances.

### Scenario B: Multiple Backends Return HTTP 500

If multiple backend instances return HTTP 500 responses:

- The problem may affect shared application logic or configuration.
- Investigate common dependencies such as databases and downstream services.
- Look for similar errors across application logs.

### Scenario C: Backend Is UP but Returns HTTP 500

If HAProxy reports a backend as UP while access logs show HTTP 500 responses:

- The backend is reachable according to HAProxy's health checks.
- The application may still be failing to process specific requests.
- Investigate application-level behavior rather than assuming the instance is unavailable.

## 7. Important Considerations

- An HTTP 500 response does not automatically indicate that a backend is down.
- HAProxy health checks only establish whether the configured health-check condition passes.
- An Actuator health endpoint reporting UP does not guarantee that every application endpoint works correctly.
- A single failed request may be transient; repeated failures provide stronger evidence of a persistent issue.
- Missing application error logs do not prove that the application encountered no internal error.
- Do not identify a root cause without supporting evidence.

## 8. Expected Investigation Outcome

The investigation should establish:

- Whether HTTP 5xx errors are occurring.
- Which backend instances are associated with the failures.
- Whether the issue appears isolated or widespread.
- Whether application logs provide evidence of an underlying failure.
- Which possible causes are supported by the collected evidence.
- What additional investigation would help confirm the root cause.
