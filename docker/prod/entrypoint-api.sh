#!/usr/bin/env sh
set -e

echo "[vision-api] Running migrations (prod)…"
# Run migrations using compiled data source + migrations in dist
npm --workspace @vision/api run migration:run:prod

echo "[vision-api] Starting API…"
exec node apps/api/dist/main
