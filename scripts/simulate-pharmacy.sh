#!/usr/bin/env bash
# Pretend to be the pharmacy: send a signed "prescription.shipped" webhook.
# Usage: ./scripts/simulate-pharmacy.sh <requestId> [baseUrl]
set -euo pipefail

ID="${1:?usage: $0 <requestId> [baseUrl]}"
BASE_URL="${2:-http://localhost:3000}"

# Use the env var if set, otherwise read it from .env.
SECRET="${PHARMACY_WEBHOOK_SECRET:-$(grep -E '^PHARMACY_WEBHOOK_SECRET=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' || true)}"
[ -n "$SECRET" ] || { echo "PHARMACY_WEBHOOK_SECRET is not set" >&2; exit 1; }

BODY="{\"event\":\"prescription.shipped\",\"requestId\":$ID}"
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $NF}')

curl -s -w '\nHTTP %{http_code}\n' -X POST "$BASE_URL/api/webhooks/pharmacy" \
  -H "Content-Type: application/json" \
  -H "x-pharmacy-signature: $SIG" \
  -d "$BODY"
