#!/usr/bin/env node

const target = process.argv[2];
const timeoutMs = Number(process.env.PROBE_TIMEOUT_MS || 5000);

if (!target) {
  console.error("Usage: endpoint-probe <url>");
  process.exit(2);
}

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);
const startedAt = performance.now();

try {
  const response = await fetch(target, { signal: controller.signal });
  const latencyMs = Math.round(performance.now() - startedAt);
  const result = { url: target, ok: response.ok, status: response.status, latencyMs };
  console.log(JSON.stringify(result));
  process.exitCode = response.ok ? 0 : 1;
} catch (error) {
  const latencyMs = Math.round(performance.now() - startedAt);
  console.error(JSON.stringify({ url: target, ok: false, latencyMs, error: error.name }));
  process.exitCode = 1;
} finally {
  clearTimeout(timer);
}
