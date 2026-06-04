#!/bin/bash
set -Eeuo pipefail


PORT=5000
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-${PORT}}"


cd "${COZE_WORKSPACE_PATH}"

is_port_in_use() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        lsof -iTCP:"${port}" -sTCP:LISTEN -t >/dev/null 2>&1
        return
    fi
    ss -H -lntp 2>/dev/null | awk -v port="${port}" '$4 ~ ":"port"$"' | grep -q .
}

kill_port_if_listening() {
    local pids
    if command -v lsof >/dev/null 2>&1; then
        pids=$(lsof -iTCP:"${DEPLOY_RUN_PORT}" -sTCP:LISTEN -t 2>/dev/null | paste -sd' ' - || true)
    else
        pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    fi
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi
    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
    if is_port_in_use "${DEPLOY_RUN_PORT}"; then
      echo "Port ${DEPLOY_RUN_PORT} still busy; trying next available port."
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

pick_available_port() {
    local port="${DEPLOY_RUN_PORT}"
    while is_port_in_use "${port}"; do
        echo "Port ${port} is in use, trying $((port + 1))..."
        port=$((port + 1))
    done
    DEPLOY_RUN_PORT="${port}"
}

echo "Clearing port ${DEPLOY_RUN_PORT} before start."
kill_port_if_listening
pick_available_port
echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for dev..."

PORT=${DEPLOY_RUN_PORT} pnpm tsx watch src/server.ts
