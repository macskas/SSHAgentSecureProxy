#!/bin/bash

USE_NPM=1

SCRIPT_BIN=$(readlink -f "$0")
SCRIPT_DIR=$(dirname "$SCRIPT_BIN")

AGENT_LOGS="$HOME/.config/SSHAuthorizationAgent/logs"
mkdir -p "$AGENT_LOGS"

if [ $USE_NPM -eq 1 ]; then
    nohup npm start --prefix "$SCRIPT_DIR" --disable-namespace-sandbox --disable-setuid-sandbox > $AGENT_LOGS/agent-startup.log 2>&1 &
fi
