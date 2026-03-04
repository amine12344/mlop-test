const express = require("express");
const { ClientRequest } = require("http");
const{ Client } = require("pg")
const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({
    lab: 3,
    status: "ok",
    hostname: require("os").hostname(),
    time: new Date().toISOString()
  });
});
app.get("/db", async (req, res) => {
  const client = new Client({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "postgres",
    port: 5432,
  });

  try {
    await client.connect();
    const r = await client.query("SELECT NOW() AS now");
    await client.end();
    res.json({ db: "reachable", now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ db: "unreachable", error: e.message });
  }
});

app.listen(port, () => console.log(`Listening on ${port}`));

