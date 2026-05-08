#!/bin/sh
set -e

echo "🚀 Starting Great Escape MN..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Run database seed if SEED_ON_START is set
if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

echo "✅ Starting server..."
exec node server.js
