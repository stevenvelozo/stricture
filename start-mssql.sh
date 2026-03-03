#!/bin/bash
# Start the MSSQL test server in Docker
# Uses port 21433 to avoid conflicts with any local MSSQL instance
# Uses linux/amd64 platform (runs under Rosetta on Apple Silicon)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting MSSQL test server on port 21433..."
docker compose -f "${SCRIPT_DIR}/docker-compose-mssql.yml" up -d

echo "Waiting for MSSQL to be ready..."
RETRIES=30
until docker compose -f "${SCRIPT_DIR}/docker-compose-mssql.yml" exec -T mssql-test /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'Retold1234567890!' -C -Q "SELECT 1" >/dev/null 2>&1; do
	sleep 3
	RETRIES=$((RETRIES - 1))
	if [ $RETRIES -le 0 ]; then
		echo "ERROR: MSSQL did not become ready in time"
		exit 1
	fi
	echo "  ...still waiting (${RETRIES} retries left)"
done

echo "MSSQL test server is ready on port 21433"
echo "  Host: 127.0.0.1"
echo "  Port: 21433"
echo "  User: sa"
echo "  Password: Retold1234567890!"
