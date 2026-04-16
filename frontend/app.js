function el(id) {
  return document.getElementById(id);
}

function setStatus(text, colorClass = "bg-slate-700") {
  const node = el("status");
  if (!node) return;
  node.textContent = text;
  node.className = `rounded-full px-3 py-1 text-sm font-semibold ${colorClass}`;
}

function setOutput(text) {
  const node = el("output");
  if (!node) return;
  node.textContent = text;
}

function setText(id, value) {
  const node = el(id);
  if (!node) return;
  node.textContent = value;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" }
  });
  const data = await res.json();
  return { res, data };
}

async function requestJson(url, successLabel) {
  setOutput("Loading...");
  try {
    const { res, data } = await fetchJson(url);
    setOutput(JSON.stringify(data, null, 2));
    if (res.ok) {
      setStatus(successLabel, "bg-emerald-600");
    } else {
      setStatus("Error", "bg-rose-600");
    }
  } catch (err) {
    setOutput(err.message);
    setStatus("Failed", "bg-rose-600");
  }
}

function callApi() {
  requestJson("/api/", "API OK");
}

function callDb() {
  requestJson("/api/db", "DB OK");
}

function clearOutput() {
  setOutput("Click a button...");
  setStatus("Unknown", "bg-slate-700");
}

async function loadStatus() {
  try {
    const [root, ready, db] = await Promise.all([
      fetchJson("/api/"),
      fetchJson("/api/readyz"),
      fetchJson("/api/db")
    ]);

    setText("frontendVersion", window.__FRONTEND_VERSION__ || "unknown");
    setText("apiVersion", root.data.version || "unknown");
    setText("apiReady", ready.res.ok ? "ready" : "not-ready");
    setText("dbStatus", db.res.ok ? "ok" : "error");
    setText("lastChecked", new Date().toLocaleString());

    setStatus(ready.res.ok ? "Ready" : "Starting", ready.res.ok ? "bg-emerald-600" : "bg-amber-500");
    setOutput(JSON.stringify({
      api: root.data,
      ready: ready.data,
      db: db.data
    }, null, 2));
  } catch (err) {
    setStatus("Unavailable", "bg-rose-600");
    setOutput(err.message);
    setText("lastChecked", new Date().toLocaleString());
  }
}

document.addEventListener("DOMContentLoaded", loadStatus);
