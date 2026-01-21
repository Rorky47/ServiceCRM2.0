// Validate environment variables on startup
const requiredEnvVars: string[] = [];
const optionalEnvVars: { name: string; description: string }[] = [
  { name: "DATABASE_URL", description: "PostgreSQL connection string (optional - falls back to JSON files)" },
  { name: "CLOUDINARY_CLOUD_NAME", description: "Cloudinary cloud name for image uploads (optional)" },
  { name: "CLOUDINARY_API_KEY", description: "Cloudinary API key (optional)" },
  { name: "CLOUDINARY_API_SECRET", description: "Cloudinary API secret (optional)" },
  { name: "SKIP_JSON_MIGRATION", description: "Skip JSON file migration (set to 'true' after first deploy)" },
];

function validateEnv() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate DATABASE_URL format if set
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (!url.protocol.startsWith("postgres")) {
        warnings.push("DATABASE_URL should use postgres:// or postgresql:// protocol");
      }
    } catch (e) {
      warnings.push("DATABASE_URL format appears invalid");
    }
  }

  // Log optional variables status
  console.log("📋 Environment Variables Status:");
  for (const { name, description } of optionalEnvVars) {
    const isSet = !!process.env[name];
    console.log(`  ${isSet ? "✅" : "⚪"} ${name}: ${isSet ? "Set" : "Not set"} - ${description}`);
  }

  // Log errors and warnings
  if (errors.length > 0) {
    console.error("❌ Environment Validation Errors:");
    errors.forEach((error) => console.error(`  - ${error}`));
    return false;
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Environment Validation Warnings:");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  return true;
}

// Run validation if called directly
if (require.main === module) {
  const isValid = validateEnv();
  process.exit(isValid ? 0 : 1);
}

export default validateEnv;
