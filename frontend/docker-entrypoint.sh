#!/bin/sh
set -eu

# Keep backward compatibility and ensure a normalized proxy URL.
raw_url="${API_PROXY_URL:-${VITE_BACKEND_URL:-}}"

if [ -n "${raw_url}" ]; then
    # Trim optional wrapping quotes, trailing slash and optional /api suffix.
    raw_url="${raw_url#\"}"
    raw_url="${raw_url%\"}"
    raw_url="${raw_url%/}"
    raw_url="${raw_url%/api}"
    export API_PROXY_URL="${raw_url}"
fi

exec /docker-entrypoint.sh "$@"