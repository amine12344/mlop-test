const express = require("express");
const { Client } = require("pg");
const os = require("os");

const app = express();
const port = process.env.PORT || 8080;

function createDbClient() {
  return new Client({
    host: process.env.DB_HOST || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    port: Number(process.env.DB_PORT || 5432),
  });
}

app.get("/", (req, res) => {
  res.json({
    app: "mlop-test",
    status: "ok",
    hostname: os.hostname(),
    time: new Date().toISOString(),
    version: process.env.APP_VERSION || "v1.0.0",
  });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.get("/readyz", async (req, res) => {
  const client = createDbClient();
  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    res.status(200).json({ status: "ready" });
  } catch (err) {
    try { await client.end(); } catch (_) {}
    res.status(500).json({ status: "not-ready", error: err.message });
  }
});

app.get("/db", async (req, res) => {
  const client = createDbClient();
  try {
    await client.connect();
    const result = await client.query("SELECT NOW() AS now");
    await client.end();
    res.status(200).json({
      db: "ok",
      now: result.rows[0].now,
      host: process.env.DB_HOST || "postgres",
    });
  } catch (err) {
    try { await client.end(); } catch (_) {}
    res.status(500).json({
      db: "error",
      error: err.message,
      host: process.env.DB_HOST || "postgres",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API running on port ${port}`);
});
