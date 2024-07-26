import express from "express";
import crypto from "node:crypto";
import { db } from "./db";
import { users } from "./db/schema";
import { count } from "drizzle-orm";

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  const serverHash = crypto.randomUUID().split("-").at(-1);

  let requestIndex = 0;

  app.get("/", (req, res) => {
    requestIndex += 1;
    console.log("Handled request ", requestIndex);
    res.send(`Hello World! from ${serverHash}`);
  });

  app.get("/db", async (req, res) => {
    const result = await db.select({ count: count() }).from(users);
    return res.status(200).json(result);
  });

  app.listen(port, () => {
    console.log(`Server ${serverHash} listening on port ${port}`);
  });
}

main();
