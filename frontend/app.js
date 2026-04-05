async function show(url) {
  const out = document.getElementById("out");
  out.textContent = "Loading...";
  try {
    const r = await fetch(url);
    const data = await r.json();
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = e.message;
  }
}

function callApi() {
  show("/api/");
}

function callDb() {
  show("/api/db");
}