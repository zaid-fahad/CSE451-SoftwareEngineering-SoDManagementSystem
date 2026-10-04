#!/usr/bin/env sh
set -e

echo "==> Checking database connection and running Alembic migrations..."
alembic upgrade head
echo "==> Database migrations completed successfully."

if [ "${RUN_DEMO_SEED:-false}" = "true" ]; then
    echo "==> RUN_DEMO_SEED is set to true. Populating demo dataset..."
    python seed.py
    echo "==> Demo dataset populated."
fi

echo "==> Starting Uvicorn on 0.0.0.0:8000 with ${WEB_CONCURRENCY:-2} worker(s)..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers "${WEB_CONCURRENCY:-2}" \
    --proxy-headers \
    --forwarded-allow-ips "*"
