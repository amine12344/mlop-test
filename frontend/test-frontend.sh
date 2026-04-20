#!/usr/bin/env bash
set -euo pipefail

test -f frontend/index.html
test -f frontend/app.js
test -f frontend/nginx.conf

grep -q '<title>' frontend/index.html
grep -q 'window.__FRONTEND_VERSION__' frontend/index.html
grep -q 'app.js' frontend/index.html
grep -q 'apiVersion' frontend/app.js
grep -q 'try_files' frontend/nginx.conf

echo "Frontend static checks passed"