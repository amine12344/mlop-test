const API_BASE = "/api";

function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = el(id);
  if (node) node.textContent = value;
}

function setHTML(id, value) {
  const node = el(id);
  if (node) node.innerHTML = value;
}

function shortVersion(version) {
  if (!version) return "unknown";
  if (version.startsWith("sha-") && version.length > 18) {
    return `${version.slice(0, 16)}…`;
  }
  return version;
}

function setVersionCard(id, value) {
  const displayNode = el(id);
  const fullNode = el(`${id}Full`);
  const fullValue = value || "unknown";

  if (displayNode) {
    displayNode.textContent = shortVersion(fullValue);
    displayNode.title = fullValue;
    displayNode.dataset.full = fullValue;
  }

  if (fullNode) {
    fullNode.textContent = fullValue;
    fullNode.title = fullValue;
  }
}

async function copyVersion(id) {
  const node = el(id);
  if (!node) return;

  const full = node.dataset.full || node.textContent || "";
  try {
    await navigator.clipboard.writeText(full);
    const button = event?.target;
    if (button) {
      const original = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    }
  } catch (err) {
    console.error("Copy failed", err);
  }
}

function setStatusPill(value, isOk = true) {
  const node = el("status");
  if (!node) return;
  node.textContent = value;
  node.classList.remove("ready", "error");
  node.classList.add(isOk ? "ready" : "error");
}

function writeOutput(data) {
  setText("output", JSON.stringify(data, null, 2));
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function callApi() {
  try {
    const data = await fetchJson(`${API_BASE}/`);
    writeOutput(data);
  } catch (err) {
    writeOutput({ error: err.message });
  }
}

async function callDb() {
  try {
    const data = await fetchJson(`${API_BASE}/db`);
    writeOutput(data);
  } catch (err) {
    writeOutput({ error: err.message });
  }
}

function clearOutput() {
  setText("output", "Cleared.");
}

async function loadStatus() {
  try {
    const [root, ready, db] = await Promise.all([
      fetchJson(`${API_BASE}/`),
      fetchJson(`${API_BASE}/readyz`),
      fetchJson(`${API_BASE}/db`)
    ]);

    writeOutput({
      api: root.data,
      ready,
      db
    });

    setStatusPill("Ready", true);
    setVersionCard("frontendVersion", window.__FRONTEND_VERSION__ || "unknown");
    setVersionCard("apiVersion", root?.version || root?.data?.version || "unknown");
    setText("apiReady", ready?.status || "unknown");
    setText("dbStatus", db?.db || "unknown");
    setText("lastChecked", formatDateTime(new Date()));
  } catch (err) {
    setStatusPill("Error", false);
    setText("output", JSON.stringify({ error: err.message }, null, 2));
    setVersionCard("frontendVersion", window.__FRONTEND_VERSION__ || "unknown");
    setVersionCard("apiVersion", "unavailable");
    setText("apiReady", "unavailable");
    setText("dbStatus", "unavailable");
    setText("lastChecked", formatDateTime(new Date()));
  }
}

async function callPredict() {
  try {
    const valueInput = el("predictValue");
    const value = Number(valueInput?.value || 3.5);

    const res = await fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        value,
        entity_id: "frontend-demo-user",
        metadata: {
          source: "frontend"
        }
      })
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }

    if (!res.ok) {
      throw new Error(JSON.stringify(data));
    }

    writeOutput(data);
  } catch (err) {
    writeOutput({ error: err.message });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadStatus();
});

window.callApi = callApi;
window.callDb = callDb;
window.clearOutput = clearOutput;
window.loadStatus = loadStatus;
window.copyVersion = copyVersion;
window.callPredict = callPredict;