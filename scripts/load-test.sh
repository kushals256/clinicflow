#!/usr/bin/env bash
set -euo pipefail
URL="${URL:-http://clinicflow.local/api/appointments}"
COUNT="${COUNT:-200}"

echo "Sending ${COUNT} requests to ${URL}"
for i in $(seq 1 "${COUNT}"); do
  curl -sf "${URL}" >/dev/null || true
done
echo "Done."
