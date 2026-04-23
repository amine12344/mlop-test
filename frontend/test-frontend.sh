#!/usr/bin/env bash
set -euo pipefail

test -f frontend/index.html
test -f frontend/app.js
test -f frontend/nginx.conf

grep -q 'DEMO' frontend/index.html
grep -q 'Frontend Version' frontend/index.html
grep -q 'API Version' frontend/index.html
grep -q 'window.__FRONTEND_VERSION__' frontend/app.js || true
grep -q 'apiVersion' frontend/app.js
grep -q 'try_files' frontend/nginx.conf
grep -q 'proxy_pass http://api:8080/' frontend/nginx.conf

echo "Frontend static checks passed"