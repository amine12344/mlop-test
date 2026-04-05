async function show(url) {
  const output = document.getElementById("output");
  output.textContent = "⏳ Loading...";

  try {
    const res = await fetch(url);
    const data = await res.json();

    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "❌ Error: " + err.message;
  }
}

function callApi() {
  show("/api/");
}

function callDb() {
  show("/api/db");
}

function updateStatus(ok) {
  const badge = document.getElementById("statusBadge");
  badge.textContent = ok ? "Healthy" : "Error";
  badge.className = ok
    ? "ml-2 text-xs px-2 py-1 rounded bg-green-500 text-white"
    : "ml-2 text-xs px-2 py-1 rounded bg-red-500 text-white";
}