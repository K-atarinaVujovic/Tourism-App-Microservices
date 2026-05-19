#!/bin/bash
set -e

MARKER=/data/seeded.marker

# Start Neo4j in the background using the original entrypoint
/startup/docker-entrypoint.sh neo4j &
NEO4J_PID=$!

if [ ! -f "$MARKER" ]; then
  echo "[seed] Waiting for Neo4j to be ready..."
  until cypher-shell -u neo4j -p password "RETURN 1" > /dev/null 2>&1; do
    sleep 2
  done

  echo "[seed] Running followers seed..."
  cypher-shell -u neo4j -p password --file /seed/seed.cypher

  touch "$MARKER"
  echo "[seed] Seed complete."
fi

wait $NEO4J_PID
