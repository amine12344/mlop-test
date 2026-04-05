const output = document.getElementById("output");
const statusBadge = document.getElementById("statusBadge");
const apiBtn = document.getElementById("apiBtn");
const dbBtn = document.getElementById("dbBtn");

function setLoading(button) {
  if (button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = "Loading...";
    button.classList.add("opacity-70", "cursor-not-allowed");
  }
}

function clearLoading(button) {
  if (button) {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
    button.classList.remove("opacity-70", "cursor-not-allowed");
  }
}

function updateStatus(type, label) {
  const styles = {
    neutral: "inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200",
    success: "inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
    error: "inline-flex items-center rounded-full bg-rose-500/20 px-3 py-1 text-sm font-medium text-rose-300 ring-1 ring-inset ring-rose-500/30",
    warning: "inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-300 ring-1 ring-inset ring-amber-500/30"
  };

  statusBadge.className = styles[type] || styles.neutral;
  statusBadge.textContent = label;
}

function renderJson(title, data) {
  output.textContent = `${title}\n\n${JSON.stringify(data, null, 2)}`;
}

function renderError(title, error) {
  output.textContent = `${title}\n\n${error}`;
}

async function requestJson(url, button, successLabel) {
  setLoading(button);
  output.textContent = "Loading...";

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    let data;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but received: ${text.slice(0, 200)}`);
    }

    renderJson(`GET ${url}`, data);

    if (!response.ok) {
      updateStatus("error", "Error");
      return;
    }

    updateStatus("success", successLabel);
  } catch (error) {
    updateStatus("error", "Request failed");
    renderError(`GET ${url}`, error.message);
  } finally {
    clearLoading(button);
  }
}

function callApi() {
  requestJson("/api/", apiBtn, "API OK");
}

function callDb() {
  requestJson("/api/db", dbBtn, "DB OK");
}

function clearOutput() {
  output.textContent = 'Click “Check API” or “Check Database” to begin.';
  updateStatus("neutral", "Unknown");
}

async function warmup() {
  try {
    const response = await fetch("/api/readyz", {
      headers: { Accept: "application/json" }
    });

    if (response.ok) {
      updateStatus("success", "Ready");
    } else {
      updateStatus("warning", "Starting");
    }
  } catch {
    updateStatus("warning", "Unavailable");
  }
}

document.addEventListener("DOMContentLoaded", warmup);