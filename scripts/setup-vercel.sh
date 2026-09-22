#!/usr/bin/env bash
# Pushes the generated auth env vars to Vercel production and redeploys.
# Requires: `vercel login` already done.
set -euo pipefail

CRED="vercel-credentials.local.txt"
URL="https://team-tracker-eight.vercel.app"
VC="node /c/Users/LENOVO/AppData/Roaming/npm/node_modules/vercel/dist/vc.js"

[ -f "$CRED" ] || { echo "Missing $CRED - run: npm run gen-auth > $CRED"; exit 1; }

SECRET=$(grep '^NEXTAUTH_SECRET=' "$CRED" | cut -d= -f2-)
USERS=$(grep '^APP_USERS=' "$CRED" | cut -d= -f2-)

[ -n "$SECRET" ] && [ -n "$USERS" ] || { echo "Could not read values from $CRED"; exit 1; }

echo "==> Linking project"
$VC link --yes

for pair in "NEXTAUTH_SECRET:$SECRET" "APP_USERS:$USERS" "NEXTAUTH_URL:$URL"; do
  name="${pair%%:*}"
  value="${pair#*:}"
  echo "==> $name"
  $VC env rm "$name" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | $VC env add "$name" production
done

echo "==> Deploying to production"
$VC --prod
