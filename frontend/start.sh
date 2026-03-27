#!/bin/sh
set -e

# Fallback entrypoint for platforms that call start.sh explicitly.
exec nginx -g "daemon off;"
