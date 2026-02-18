const express = require("express");
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

app.listen(port, () => console.log(`Listening on ${port}`));

