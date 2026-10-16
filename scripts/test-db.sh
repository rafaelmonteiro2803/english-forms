#!/usr/bin/env bash
# Runs migrations, seed and SQL tests against a throwaway database.
# Usage: DATABASE_URL=postgres://user@localhost:5432/postgres npm run test:db
set -euo pipefail
cd "$(dirname "$0")/.."

ADMIN_URL="${DATABASE_URL:-postgres://postgres@localhost:5432/postgres}"
DB="ef_test_$$"
psql "$ADMIN_URL" -qc "create database $DB" >/dev/null
trap 'psql "$ADMIN_URL" -qc "drop database if exists $DB" >/dev/null' EXIT
URL="${ADMIN_URL%/*}/$DB"

run() { psql "$URL" -q -v ON_ERROR_STOP=1 -f "$1" >/dev/null; }
run supabase/tests/auth_stub.sql
for f in supabase/migrations/*.sql; do run "$f"; done
run supabase/seed.sql
for f in supabase/tests/*.test.sql; do
  echo "• $f"
  psql "$URL" -q -v ON_ERROR_STOP=1 -f "$f"
done
echo "All database tests passed."
