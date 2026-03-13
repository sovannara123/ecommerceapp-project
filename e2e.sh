#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:8080"
DEVICE="device_e2e_001"
EMAIL="e2e_$(date +%s)@example.com"
PASS="Test12345!"

echo "EMAIL=$EMAIL"

echo "== Register =="
curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"E2E\",\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | jq

echo "== Login =="
LOGIN=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-device-id: $DEVICE" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")

echo "$LOGIN" | jq

ACCESS=$(echo "$LOGIN" | jq -r '.data.accessToken')
REFRESH=$(echo "$LOGIN" | jq -r '.data.refreshToken')

if [[ "$ACCESS" == "null" || -z "$ACCESS" ]]; then
  echo "Login failed; access token missing"
  exit 1
fi

echo "ACCESS=${ACCESS:0:24}..."
echo "REFRESH=${REFRESH:0:24}..."

echo "== Products =="
PRODUCTS=$(curl -s "$BASE/api/catalog/products")
COUNT=$(echo "$PRODUCTS" | jq -r '.data.items | length')
echo "Products count: $COUNT"
echo "$PRODUCTS" | jq

if [[ "$COUNT" == "0" ]]; then
  echo "No products found. Run: docker compose exec server npm run seed"
  exit 1
fi

PRODUCT_ID=$(echo "$PRODUCTS" | jq -r '.data.items[0]._id')
echo "PRODUCT_ID=$PRODUCT_ID"

echo "== Add to cart =="
CODE=$(curl -s -o /tmp/addcart.txt -w "%{http_code}" -X POST "$BASE/api/cart/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS" \
  -H "x-device-id: $DEVICE" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"qty\":1}")

echo "POST /api/cart/add -> $CODE"
cat /tmp/addcart.txt | jq || cat /tmp/addcart.txt
if [[ "$CODE" -lt 200 || "$CODE" -ge 300 ]]; then
  echo "Add to cart failed"
  exit 1
fi

echo "== View cart =="
CODE=$(curl -s -o /tmp/getcart.txt -w "%{http_code}" "$BASE/api/cart" \
  -H "Authorization: Bearer $ACCESS" \
  -H "x-device-id: $DEVICE")
echo "GET /api/cart -> $CODE"
cat /tmp/getcart.txt | jq || cat /tmp/getcart.txt
if [[ "$CODE" -lt 200 || "$CODE" -ge 300 ]]; then
  echo "View cart failed"
  exit 1
fi

echo "== Create order =="
CODE=$(curl -s -o /tmp/createorder.txt -w "%{http_code}" -X POST "$BASE/api/orders" \
  -H "Authorization: Bearer $ACCESS" \
  -H "Content-Type: application/json" \
  -H "x-device-id: $DEVICE" \
  -d '{"address":{"fullName":"E2E User","phone":"012345678","line1":"Street 1","city":"Phnom Penh","province":"Phnom Penh","postalCode":"12000"}}')
echo "POST /api/orders -> $CODE"
cat /tmp/createorder.txt | jq || cat /tmp/createorder.txt
if [[ "$CODE" -lt 200 || "$CODE" -ge 300 ]]; then
  echo "Create order failed"
  exit 1
fi

echo "== Refresh token =="
CODE=$(curl -s -o /tmp/refresh.txt -w "%{http_code}" -X POST "$BASE/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "x-device-id: $DEVICE" \
  -d "{\"refreshToken\":\"$REFRESH\"}")
echo "POST /api/auth/refresh -> $CODE"
cat /tmp/refresh.txt | jq || cat /tmp/refresh.txt
if [[ "$CODE" -lt 200 || "$CODE" -ge 300 ]]; then
  echo "Refresh failed"
  exit 1
fi

echo "✅ E2E finished"
