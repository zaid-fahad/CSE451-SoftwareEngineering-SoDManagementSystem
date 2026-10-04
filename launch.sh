#!/usr/bin/env bash

# ==============================================================================
# Departmental Student on Duty (SoD) Management System - Launch Script
# ==============================================================================
# Usage:
#   ./launch.sh          - Launch both backend and frontend concurrently
#   ./launch.sh backend  - Launch FastAPI backend only (port 8000)
#   ./launch.sh frontend - Launch Vite frontend only (port 3000)
#   ./launch.sh seed     - Seed / reset the database with demo data
#   ./launch.sh help     - Show this help message
# ==============================================================================

set -uo pipefail

# ANSI color codes
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine root repository directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

BACKEND_PID=""
FRONTEND_PID=""

# Cleanup handler for graceful shutdown
cleanup() {
    if [ -n "${BACKEND_PID}" ] || [ -n "${FRONTEND_PID}" ]; then
        echo ""
        echo -e "${YELLOW}==> Shutting down services...${NC}"
        if [ -n "${BACKEND_PID}" ] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
            echo -e "    Stopping backend (PID ${BACKEND_PID})..."
            kill -SIGTERM "${BACKEND_PID}" 2>/dev/null || true
        fi
        if [ -n "${FRONTEND_PID}" ] && kill -0 "${FRONTEND_PID}" 2>/dev/null; then
            echo -e "    Stopping frontend (PID ${FRONTEND_PID})..."
            kill -SIGTERM "${FRONTEND_PID}" 2>/dev/null || true
        fi
        wait 2>/dev/null || true
        echo -e "${GREEN}==> All services stopped cleanly.${NC}"
    fi
}
trap cleanup EXIT INT TERM

print_banner() {
    echo -e "${CYAN}${BOLD}"
    echo "======================================================================"
    echo "       Departmental Student on Duty (SoD) Management System           "
    echo "======================================================================"
    echo -e "${NC}"
}

print_help() {
    print_banner
    echo -e "Usage: ${BOLD}./launch.sh [command]${NC}"
    echo ""
    echo "Commands:"
    echo "  all (default)  Launch both FastAPI backend and Vite frontend"
    echo "  backend        Launch FastAPI backend only on port 8000"
    echo "  frontend       Launch Vite frontend only on port 3000"
    echo "  seed           Seed or reset database with demo accounts"
    echo "  docker         Run PostgreSQL & Backend via docker compose"
    echo "  help           Display this help information"
    echo ""
}

# Resolve Python Virtual Environment
resolve_python() {
    if [ -f "${BACKEND_DIR}/.venv/bin/python" ]; then
        PYTHON_BIN="${BACKEND_DIR}/.venv/bin/python"
        UVICORN_BIN="${BACKEND_DIR}/.venv/bin/uvicorn"
    elif [ -f "${BACKEND_DIR}/venv/bin/python" ]; then
        PYTHON_BIN="${BACKEND_DIR}/venv/bin/python"
        UVICORN_BIN="${BACKEND_DIR}/venv/bin/uvicorn"
    elif command -v python3 &>/dev/null; then
        echo -e "${YELLOW}Warning: No local .venv found in backend. Creating backend/.venv...${NC}"
        python3 -m venv "${BACKEND_DIR}/.venv"
        "${BACKEND_DIR}/.venv/bin/pip" install -r "${BACKEND_DIR}/requirements.txt"
        PYTHON_BIN="${BACKEND_DIR}/.venv/bin/python"
        UVICORN_BIN="${BACKEND_DIR}/.venv/bin/uvicorn"
    else
        echo -e "${RED}Error: Python 3 not found on system path.${NC}"
        exit 1
    fi
}

# Ensure Frontend Dependencies
resolve_frontend() {
    if [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
        echo -e "${YELLOW}Frontend dependencies not installed. Running 'npm install' in frontend/...${NC}"
        (cd "${FRONTEND_DIR}" && npm install)
    fi
}

# Check if a port is in use
check_port() {
    local port="$1"
    local name="$2"
    if command -v lsof &>/dev/null; then
        local pid
        pid=$(lsof -ti :"$port" 2>/dev/null || true)
        if [ -n "$pid" ]; then
            echo -e "${YELLOW}Warning: Port $port ($name) is currently in use by process PID $pid.${NC}"
            echo -e "         To free it up, run: ${BOLD}kill -9 $pid${NC}"
        fi
    fi
}

run_seed() {
    print_banner
    resolve_python
    echo -e "${BLUE}==> Seeding database using backend/seed.py...${NC}"
    (cd "${BACKEND_DIR}" && "${PYTHON_BIN}" seed.py)
    echo -e "${GREEN}==> Database successfully seeded!${NC}"
}

start_backend() {
    resolve_python
    check_port 8000 "Backend"
    echo -e "${GREEN}==> Starting Backend API on http://localhost:8000 ...${NC}"
    (cd "${BACKEND_DIR}" && "${UVICORN_BIN}" app.main:app --host 127.0.0.1 --port 8000 --reload) &
    BACKEND_PID=$!
}

start_frontend() {
    resolve_frontend
    check_port 3000 "Frontend"
    echo -e "${GREEN}==> Starting Frontend SPA on http://localhost:3000 ...${NC}"
    (cd "${FRONTEND_DIR}" && npm run dev) &
    FRONTEND_PID=$!
}

print_service_info() {
    sleep 2
    echo ""
    echo -e "${CYAN}----------------------------------------------------------------------${NC}"
    echo -e "${BOLD}Services Live:${NC}"
    echo -e "  • ${GREEN}Frontend Application:${NC} ${BOLD}http://localhost:3000${NC}"
    echo -e "  • ${GREEN}Backend REST API:${NC}     ${BOLD}http://localhost:8000${NC}"
    echo -e "  • ${GREEN}Interactive API Docs:${NC} ${BOLD}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${BOLD}Default Demo Credentials (Password: 'password'):${NC}"
    echo -e "  • Student Assistant: ${BLUE}alice@univ.edu${NC}"
    echo -e "  • Lab Manager:       ${BLUE}alan@univ.edu${NC}"
    echo -e "  • Department Admin:  ${BLUE}sarah@univ.edu${NC}"
    echo -e "  • Faculty Member:    ${BLUE}dr.smith@univ.edu${NC}"
    echo -e "${CYAN}----------------------------------------------------------------------${NC}"
    echo -e "${YELLOW}Press [Ctrl+C] at any time to gracefully stop all services.${NC}"
    echo ""
}

# Main Execution Routing
MODE="${1:-all}"

case "$MODE" in
    all|"")
        print_banner
        start_backend
        start_frontend
        print_service_info
        wait
        ;;
    backend)
        print_banner
        start_backend
        wait
        ;;
    frontend)
        print_banner
        start_frontend
        wait
        ;;
    seed)
        run_seed
        ;;
    docker)
        print_banner
        echo -e "${GREEN}==> Launching PostgreSQL and Backend via Docker Compose...${NC}"
        docker compose up --build
        ;;
    help|--help|-h)
        print_help
        ;;
    *)
        echo -e "${RED}Unknown command: ${MODE}${NC}"
        print_help
        exit 1
        ;;
esac
