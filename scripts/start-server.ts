// Start script for Railway - handles database setup and server startup
import { spawn } from "child_process";

async function start() {
  try {
    console.log("🚀 Starting application...");
    
    // Run database setup (non-blocking, won't fail if it errors)
    try {
      const { default: setupDatabase } = await import("./setup-db");
      await setupDatabase();
      console.log("✅ Database setup completed");
    } catch (dbError) {
      console.warn("⚠️  Database setup failed, continuing anyway:", dbError instanceof Error ? dbError.message : String(dbError));
      // Continue even if database setup fails
    }
    
    // Start Next.js server
    console.log("🌐 Starting Next.js server...");
    console.log(`📡 PORT: ${process.env.PORT || "3000"}`);
    
    // Start Next.js server
    const nextProcess = spawn("npm", ["start"], {
      env: {
        ...process.env,
        PORT: process.env.PORT || "3000",
      },
      stdio: "inherit",
      shell: true,
    });
    
    // Handle process termination
    const shutdown = () => {
      console.log("🛑 Shutting down gracefully...");
      nextProcess.kill("SIGTERM");
      process.exit(0);
    };
    
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
    
    // Handle process exit
    nextProcess.on("exit", (code) => {
      console.log(`📴 Next.js process exited with code ${code}`);
      process.exit(code || 0);
    });
    
    nextProcess.on("error", (error) => {
      console.error("❌ Failed to start Next.js:", error);
      process.exit(1);
    });
    
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
}

start();
