#!/bin/sh
set -e

# Wait for DATABASE_URL to be set
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set. If your app doesn't need a DB, ignore this."
else
  echo "Waiting for database to be ready..."
  # simple loop to wait for the DB to be reachable using node's tcp connection via nc if available
  START_TS=$(date +%s)
  # try prisma migrate resolve or a simple npx prisma ping (prisma v4+ supports 'prisma db execute')
  until npx prisma db pull >/dev/null 2>&1 || npx prisma migrate status >/dev/null 2>&1; do
    if [ $(( $(date +%s) - START_TS )) -gt 60 ]; then
      echo "Timed out waiting for database after 60s"
      break
    fi
    printf '.'
    sleep 2
  done
fi

# Ensure Prisma client is generated
echo "Generating Prisma client..."
npx prisma generate || true

exec "$@"
