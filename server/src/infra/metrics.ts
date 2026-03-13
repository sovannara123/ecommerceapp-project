import { NextFunction, Request, Response } from "express";

type HttpLabels = {
  method: string;
  route: string;
  status_code: string;
};

const processStartedAtMs = Date.now();
const httpRequestCount = new Map<string, number>();
const httpRequestDurationSum = new Map<string, number>();
const httpRequestDurationCount = new Map<string, number>();

function routeLabel(req: Request) {
  if (req.route?.path) {
    const routePath = typeof req.route.path === "string" ? req.route.path : "dynamic";
    return `${req.baseUrl || ""}${routePath}`;
  }
  return "unmatched";
}

function labelsKey(labels: HttpLabels) {
  return `${labels.method}|${labels.route}|${labels.status_code}`;
}

function metricLabels(labels: HttpLabels) {
  return `{method="${labels.method}",route="${labels.route}",status_code="${labels.status_code}"}`;
}

function increment(map: Map<string, number>, key: string, by = 1) {
  map.set(key, (map.get(key) || 0) + by);
}

function escapeMetricValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/"/g, '\\"');
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const started = process.hrtime.bigint();

  res.on("finish", () => {
    const route = routeLabel(req);
    const labels: HttpLabels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    const durationSeconds = Number(process.hrtime.bigint() - started) / 1_000_000_000;
    const key = labelsKey(labels);

    increment(httpRequestCount, key, 1);
    increment(httpRequestDurationCount, key, 1);
    increment(httpRequestDurationSum, key, durationSeconds);
  });

  next();
}

export async function getMetrics() {
  const lines: string[] = [];

  lines.push("# HELP ecommerce_http_requests_total Total HTTP requests processed by the API");
  lines.push("# TYPE ecommerce_http_requests_total counter");
  for (const [key, value] of httpRequestCount.entries()) {
    const [method, route, statusCode] = key.split("|").map(escapeMetricValue);
    lines.push(`ecommerce_http_requests_total${metricLabels({ method, route, status_code: statusCode })} ${value}`);
  }

  lines.push("# HELP ecommerce_http_request_duration_seconds_sum Total duration of HTTP requests in seconds");
  lines.push("# TYPE ecommerce_http_request_duration_seconds_sum counter");
  for (const [key, value] of httpRequestDurationSum.entries()) {
    const [method, route, statusCode] = key.split("|").map(escapeMetricValue);
    lines.push(`ecommerce_http_request_duration_seconds_sum${metricLabels({ method, route, status_code: statusCode })} ${value}`);
  }

  lines.push("# HELP ecommerce_http_request_duration_seconds_count Count of timed HTTP requests");
  lines.push("# TYPE ecommerce_http_request_duration_seconds_count counter");
  for (const [key, value] of httpRequestDurationCount.entries()) {
    const [method, route, statusCode] = key.split("|").map(escapeMetricValue);
    lines.push(`ecommerce_http_request_duration_seconds_count${metricLabels({ method, route, status_code: statusCode })} ${value}`);
  }

  const uptimeSeconds = (Date.now() - processStartedAtMs) / 1000;
  lines.push("# HELP ecommerce_process_uptime_seconds Process uptime in seconds");
  lines.push("# TYPE ecommerce_process_uptime_seconds gauge");
  lines.push(`ecommerce_process_uptime_seconds ${uptimeSeconds}`);

  const memory = process.memoryUsage();
  lines.push("# HELP ecommerce_process_resident_memory_bytes Resident memory size in bytes");
  lines.push("# TYPE ecommerce_process_resident_memory_bytes gauge");
  lines.push(`ecommerce_process_resident_memory_bytes ${memory.rss}`);

  return `${lines.join("\n")}\n`;
}

export function getMetricsContentType() {
  return "text/plain; version=0.0.4; charset=utf-8";
}
