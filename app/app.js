const express = require("express");
const os = require("os");
const { Client } = require("pg");

const app = express();
const port = Number(process.env.PORT || 8084);

app.use(express.json({ limit: "1mb" }));

const version = process.env.APP_VERSION || process.env.GIT_SHA || "dev";
const inferenceUrl = process.env.INFERENCE_URL || "";

function dbConfig() {
  return {
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    port: Number(process.env.DB_PORT || 5432),
    connectionTimeoutMillis: 2000,
  };
}

async function checkDb() {
  const client = new Client(dbConfig());
  try {
    await client.connect();
    const result = await client.query("SELECT NOW() AS now");
    return { ok: true, now: result.rows[0].now };
  } finally {
    await client.end().catch(() => {});
  }
}

app.get("/", (req, res) => {
  res.json({
    service: "mlop-test-api",
    status: "ok",
    hostname: os.hostname(),
    version,
    time: new Date().toISOString(),
    inference_enabled: Boolean(inferenceUrl),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/healthz", (req, res) => {
  res.json({
    status: "ok",
    service: "mlop-test-api",
    hostname: os.hostname(),
    time: new Date().toISOString(),
  });
});

app.get("/readyz", async (req, res) => {
  const checks = {
    api: true,
    db: false,
    inference_configured: Boolean(inferenceUrl),
  };

  try {
    await checkDb();
    checks.db = true;
    res.json({ status: "ready", checks });
  } catch (err) {
    res.status(503).json({
      status: "not_ready",
      checks,
      error: err.message,
    });
  }
});

app.get("/db", async (req, res) => {
  try {
    const result = await checkDb();
    res.json({ db: "reachable", now: result.now });
  } catch (err) {
    res.status(500).json({ db: "unreachable", error: err.message });
  }
});

app.post("/predict", async (req, res) => {
  if (!inferenceUrl) {
    return res.status(503).json({
      error: "inference_not_configured",
      message: "Set INFERENCE_URL to enable prediction routing.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${inferenceUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Source": "mlop-test-api",
      },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: "inference_error",
        upstream_status: response.status,
        details: data,
      });
    }

    res.json({
      gateway: "mlop-test-api",
      inference: data,
    });
  } catch (err) {
    const status = err.name === "AbortError" ? 504 : 502;
    res.status(status).json({
      error: "inference_unavailable",
      message: err.message,
    });
  } finally {
    clearTimeout(timeout);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "not_found", path: req.path });
});

app.listen(port, () => {
  console.log(`mlop-test-api listening on ${port}`);
});