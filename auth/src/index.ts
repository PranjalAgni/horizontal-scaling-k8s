import express from "express";
import crypto from "node:crypto";

const app = express();
const port = process.env.PORT || 3000;

const serverHash = crypto.randomUUID().split("-").at(-1);

let requestIndex = 0;

app.get("/", (req, res) => {
  requestIndex += 1;
  console.log("Handled request ", requestIndex);
  res.send(`Hello World! from ${serverHash}`);
});

app.listen(port, () => {
  console.log(`Server ${serverHash} listening on port ${port}`);
});
