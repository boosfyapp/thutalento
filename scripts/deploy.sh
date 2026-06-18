#!/bin/bash
set -e
CODE_DIR="/etc/easypanel/projects/thutalento/app/code"

echo "[deploy] Pulling from GitHub..."
cd "$CODE_DIR"
git pull

echo "[deploy] Building Docker image..."
docker build --no-cache -t thutalento:latest .

echo "[deploy] Updating service..."
docker service update --force --image thutalento:latest thutalento_app

echo "[deploy] Done."
