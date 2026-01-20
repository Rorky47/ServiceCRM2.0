// This script runs database setup then starts the Next.js server
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function start() {
  try {
    // Run database setup
    console.log("🚀 Starting application...");
    const { default: setupDatabase } = await import("./setup-db");
    await setupDatabase();
    
    // Start Next.js server
    console.log("🌐 Starting Next.js server...");
    const { spawn } = require("child_process");
    const next = spawn("npm", ["start"], {
      stdio: "inherit",
      shell: true,
    });
    
    next.on("error", (error: Error) => {
      console.error("Failed to start Next.js:", error);
      process.exit(1);
    });
    
    process.on("SIGTERM", () => {
      next.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start:", error);
    process.exit(1);
  }
}

start();

