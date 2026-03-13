#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8081}"
API_BASE="${BASE_URL%/}/api"
DEVICE_ID="${DEVICE_ID:-staging_smoke_$(date +%s)}"
EMAIL="${EMAIL:-staging_smoke_$(date +%s)@example.com}"
PASSWORD="${PASSWORD:-Staging1234!}"
STRICT_PAYMENT_INTENT="${STRICT_PAYMENT_INTENT:-true}"
COOKIE_JAR="$(mktemp)"

cleanup() {
  rm -f "$COOKIE_JAR"
}
trap cleanup EXIT

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

require_cmd curl
require_cmd jq

request() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local auth="${4:-}"
  local out_file
  out_file="$(mktemp)"

  local -a cmd=(curl -sS -X "$method" "$url" -H "x-device-id: $DEVICE_ID" -H "Content-Type: application/json" -b "$COOKIE_JAR" -c "$COOKIE_JAR")
  if [[ -n "$auth" ]]; then
    cmd+=(-H "Authorization: Bearer $auth")
  fi
  if [[ -n "$data" ]]; then
    cmd+=(-d "$data")
  fi
  cmd+=(-o "$out_file" -w "%{http_code}")

  local status
  status="$("${cmd[@]}")"
  echo "$status:$out_file"
}

assert_2xx() {
  local status="$1"
  local label="$2"
  local file="$3"
  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    echo "❌ $label failed (HTTP $status)"
    cat "$file"
    echo
    exit 1
  fi
}

echo "== Staging smoke =="
echo "BASE_URL=$BASE_URL"
echo "EMAIL=$EMAIL"
echo "DEVICE_ID=$DEVICE_ID"

echo "== Register =="
reg_resp="$(request POST "$API_BASE/auth/register" "{\"name\":\"Staging Smoke\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")"
reg_status="${reg_resp%%:*}"
reg_file="${reg_resp#*:}"
assert_2xx "$reg_status" "Register" "$reg_file"
jq . "$reg_file"

echo "== Login =="
login_resp="$(request POST "$API_BASE/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")"
login_status="${login_resp%%:*}"
login_file="${login_resp#*:}"
assert_2xx "$login_status" "Login" "$login_file"
jq . "$login_file"
ACCESS_TOKEN="$(jq -r '.data.accessToken // empty' "$login_file")"
if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "❌ Login response missing access token"
  exit 1
fi

echo "== Products =="
products_resp="$(request GET "$API_BASE/catalog/products" "" "$ACCESS_TOKEN")"
products_status="${products_resp%%:*}"
products_file="${products_resp#*:}"
assert_2xx "$products_status" "List products" "$products_file"
PRODUCT_ID="$(jq -r '.data.items[0]._id // empty' "$products_file")"
if [[ -z "$PRODUCT_ID" ]]; then
  echo "❌ No products returned. Seed staging data first:"
  echo "docker compose -f docker-compose.staging.yml exec server-staging npm run seed"
  exit 1
fi
echo "PRODUCT_ID=$PRODUCT_ID"

echo "== Cart add =="
cart_add_resp="$(request POST "$API_BASE/cart/add" "{\"productId\":\"$PRODUCT_ID\",\"qty\":1}" "$ACCESS_TOKEN")"
cart_add_status="${cart_add_resp%%:*}"
cart_add_file="${cart_add_resp#*:}"
assert_2xx "$cart_add_status" "Cart add" "$cart_add_file"
jq . "$cart_add_file"

echo "== Cart get =="
cart_get_resp="$(request GET "$API_BASE/cart" "" "$ACCESS_TOKEN")"
cart_get_status="${cart_get_resp%%:*}"
cart_get_file="${cart_get_resp#*:}"
assert_2xx "$cart_get_status" "Cart get" "$cart_get_file"
jq . "$cart_get_file"

echo "== Create order =="
ORDER_BODY='{"address":{"fullName":"Staging Smoke","phone":"012345678","line1":"Staging Street 1","city":"Phnom Penh","province":"Phnom Penh","postalCode":"12000"},"paymentProvider":"stripe"}'
order_resp="$(request POST "$API_BASE/orders" "$ORDER_BODY" "$ACCESS_TOKEN")"
order_status="${order_resp%%:*}"
order_file="${order_resp#*:}"
assert_2xx "$order_status" "Create order" "$order_file"
jq . "$order_file"
ORDER_ID="$(jq -r '.data._id // empty' "$order_file")"
if [[ -z "$ORDER_ID" ]]; then
  echo "❌ Create order response missing order id"
  exit 1
fi

echo "== Stripe payment intent =="
intent_resp="$(request POST "$API_BASE/payments/stripe/create-intent" "{\"orderId\":\"$ORDER_ID\"}" "$ACCESS_TOKEN")"
intent_status="${intent_resp%%:*}"
intent_file="${intent_resp#*:}"
if [[ "$intent_status" -lt 200 || "$intent_status" -ge 300 ]]; then
  if [[ "$STRICT_PAYMENT_INTENT" == "true" ]]; then
    echo "❌ Create Stripe intent failed (HTTP $intent_status)"
    cat "$intent_file"
    echo
    exit 1
  fi
  echo "⚠️  Stripe intent failed but STRICT_PAYMENT_INTENT=false, continuing"
  cat "$intent_file"
  echo
else
  jq . "$intent_file"
  CLIENT_SECRET="$(jq -r '.data.clientSecret // empty' "$intent_file")"
  if [[ -z "$CLIENT_SECRET" ]]; then
    echo "❌ Stripe intent response missing clientSecret"
    exit 1
  fi
fi

echo "== Refresh token (cookie-based) =="
refresh_resp="$(request POST "$API_BASE/auth/refresh" "{}")"
refresh_status="${refresh_resp%%:*}"
refresh_file="${refresh_resp#*:}"
assert_2xx "$refresh_status" "Refresh token" "$refresh_file"
jq . "$refresh_file"

echo "== Logout =="
logout_resp="$(request POST "$API_BASE/auth/logout" "{}" "$ACCESS_TOKEN")"
logout_status="${logout_resp%%:*}"
logout_file="${logout_resp#*:}"
assert_2xx "$logout_status" "Logout" "$logout_file"
jq . "$logout_file"

echo "✅ Staging smoke test passed"
