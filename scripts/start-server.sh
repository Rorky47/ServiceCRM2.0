#!/bin/sh
# Start script for Railway - handles database setup and server startup

echo "🚀 Starting application..."

# Validate environment (non-blocking)
if command -v tsx >/dev/null 2>&1; then
  tsx scripts/validate-env.ts || echo "⚠️  Environment validation failed, continuing anyway..."
fi

# Run database setup (non-blocking)
if command -v tsx >/dev/null 2>&1; then
  echo "🔧 Running database setup..."
  SKIP_JSON_MIGRATION=true tsx scripts/setup-db.ts || echo "⚠️  Database setup failed, continuing anyway..."
else
  echo "⚠️  tsx not found, skipping database setup"
fi

# Start Next.js server
echo "🌐 Starting Next.js server..."
echo "📡 PORT: ${PORT:-3000}"

# Start the server
exec npm start
