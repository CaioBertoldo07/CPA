#!/bin/sh
set -eu

# Keep backward compatibility: if API_PROXY_URL is not provided,
# reuse VITE_BACKEND_URL so /api proxy works in separated deployments.
if [ -z "${API_PROXY_URL:-}" ] && [ -n "${VITE_BACKEND_URL:-}" ]; then
    export API_PROXY_URL="${VITE_BACKEND_URL}"
fi

exec /docker-entrypoint.sh "$@"