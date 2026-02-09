#!/bin/bash

# ===================================
# SCRIPT PARA DESARROLLO CON DOCKER
# ===================================

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_message() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

# Determinar comando docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"
fi

case "$1" in
    "start")
        print_message "Iniciando entorno de desarrollo..."
        $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml up -d
        print_success "Desarrollo iniciado en http://localhost:4200"
        ;;
    "stop")
        print_message "Deteniendo entorno de desarrollo..."
        $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml down
        print_success "Entorno detenido"
        ;;
    "restart")
        print_message "Reiniciando entorno..."
        $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml restart
        print_success "Entorno reiniciado"
        ;;
    "logs")
        $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml logs -f
        ;;
    "shell")
        docker exec -it code5_frontend_dev sh
        ;;
    "build")
        print_message "Reconstruyendo imagen de desarrollo..."
        $DOCKER_COMPOSE_CMD -f docker-compose.dev.yml build --no-cache
        print_success "Imagen reconstruida"
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|logs|shell|build}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start   - Iniciar entorno de desarrollo"
        echo "  stop    - Detener entorno"
        echo "  restart - Reiniciar entorno"
        echo "  logs    - Ver logs en tiempo real"
        echo "  shell   - Acceder al contenedor"
        echo "  build   - Reconstruir imagen"
        exit 1
        ;;
esac