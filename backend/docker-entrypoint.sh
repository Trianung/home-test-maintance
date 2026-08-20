#!/bin/sh
set -e
echo "Waiting for database..."
npm run db:migrate
echo "Running seed..."
npm run db:seed
echo "Starting backend..."
exec "$@"