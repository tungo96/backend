#!/bin/sh
set -e

# Chạy migration nếu có
if npm run | grep -q migration:run; then
  echo "==> Running migrations..."
  npm run migration:run
fi

# Chạy seed
if npm run | grep -q seed:run; then
  echo "==> Running seed..."
  npm run seed:run
fi

# Khởi động app
npm run start:dev 