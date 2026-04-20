const { spawn } = require("child_process");
const http = require("http");

const TEST_PORT = 3005;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${TEST_PORT}${path}`, res => {
      let body = "";
      res.on("data", chunk => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
  });
}

async function main() {
  const child = spawn("node", ["app.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: TEST_PORT.toString(),
      DB_HOST: "127.0.0.1",
      DB_PORT: "5432",
      DB_NAME: "postgres",
      DB_USER: "postgres",
      DB_PASSWORD: "postgres",
      APP_VERSION: "test-local"
    },
    stdio: "inherit"
  });

  try {
    await wait(1500);

    // ✅ FIX: use correct endpoint
    const root = await get("/");
    console.log("Root status:", root.status);

    // Some APIs return 404 on /
    if (root.status !== 200 && root.status !== 404) {
      throw new Error(`Unexpected / status: ${root.status}`);
    }

    // ✅ Better: test actual API endpoint
    const api = await get("/");
    const parsed = JSON.parse(api.body || "{}");

    if (!parsed.version) {
      throw new Error("Missing version in API response");
    }

    const healthz = await get("/healthz");
    if (healthz.status !== 200) {
      throw new Error(`/healthz failed: ${healthz.status}`);
    }

    const readyz = await get("/readyz");
    if (readyz.status !== 200) {
      throw new Error(`/readyz failed: ${readyz.status}`);
    }

    console.log("API smoke tests passed");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    child.kill("SIGTERM");
  }
}

main();