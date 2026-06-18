#!/bin/bash
set -e

PROJECT="thutalento"
REPO="https://github.com/boosfyapp/thutalento.git"
CODE_DIR="/etc/easypanel/projects/$PROJECT/app/code"
DB_CONTAINER="contractoros-db"
DB_NAME="thu_talento_humano"
DB_USER="thutalento"
DB_PASS="ThuTH2026!"
SERVICE_NAME="${PROJECT}_app"
IMAGE="${PROJECT}:latest"
PORT=3000
DOMAIN="thu.fracesolutions.com"

echo "[1/7] Creating project directories..."
mkdir -p "$CODE_DIR"

echo "[2/7] Cloning repo..."
if [ -d "$CODE_DIR/.git" ]; then
  cd "$CODE_DIR" && git pull
else
  git clone "$REPO" "$CODE_DIR"
fi

echo "[3/7] Creating DB and user..."
docker exec "$DB_CONTAINER" psql -U contractoros -c "
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
    END IF;
  END \$\$;
" 2>/dev/null || true

docker exec "$DB_CONTAINER" psql -U contractoros -c \
  "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "DB may already exist"

echo "[4/7] Running schema..."
docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$CODE_DIR/lib/schema.sql"

echo "[5/7] Building Docker image..."
cd "$CODE_DIR"
docker build -t "$IMAGE" .

echo "[6/7] Creating .env..."
cat > /etc/easypanel/projects/$PROJECT/.env << ENV
DB_HOST=$DB_CONTAINER
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_SSL=false
PORT=$PORT
ENV

echo "[7/7] Creating or updating Docker service..."
if docker service ls | grep -q "$SERVICE_NAME"; then
  docker service update --force \
    --image "$IMAGE" \
    "$SERVICE_NAME"
else
  docker service create \
    --name "$SERVICE_NAME" \
    --replicas 1 \
    --network easypanel \
    --env-file /etc/easypanel/projects/$PROJECT/.env \
    --label "traefik.enable=true" \
    --label "traefik.http.routers.${PROJECT}.rule=Host(\`$DOMAIN\`)" \
    --label "traefik.http.routers.${PROJECT}.tls=true" \
    --label "traefik.http.routers.${PROJECT}.tls.certresolver=letsencrypt" \
    --label "traefik.http.services.${PROJECT}.loadbalancer.server.port=$PORT" \
    "$IMAGE"
fi

echo ""
echo "====================================="
echo " Thu Talento Humano — DEPLOYED"
echo " URL: https://$DOMAIN"
echo "====================================="
