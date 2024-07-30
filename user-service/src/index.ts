require("dotenv").config();
import { createServer } from "./app";
import { initDB } from "./db";

const start = async () => {
  // initalize DB connection
  await initDB();
  await createServer();

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    process.exit(1);
  });
};

// Handle unhandled rejections
start();
