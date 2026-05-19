#!/bin/bash

# NO set -e - we handle errors ourselves

MARKER=/data/seeded.marker

/startup/docker-entrypoint.sh neo4j &
NEO4J_PID=$!

if [ ! -f "$MARKER" ]; then
  echo "[seed] Waiting for Neo4j to become available..."

  until cypher-shell -u neo4j -p password "RETURN 1" > /dev/null 2>&1; do
    sleep 2
  done

  echo "[seed] Running followers seed..."
  cypher-shell -u neo4j -p password --file /seed/seed.cypher

  touch "$MARKER"
  echo "[seed] Seed complete."
fi

# Keep container alive by waiting on Neo4j
wait $NEO4J_PID