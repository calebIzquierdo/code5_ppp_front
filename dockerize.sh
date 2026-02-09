#!/bin/bash

# ===================================
# SCRIPT DE DOCKERIZACIÓN AUTOMÁTICA
# PROYECTO: Code5 PPP Frontend
# ===================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Función para verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_warning "docker-compose no está instalado. Intentando usar 'docker compose'..."
        if ! docker compose version &> /dev/null; then
            print_error "Ni docker-compose ni 'docker compose' están disponibles."
            exit 1
        fi
        DOCKER_COMPOSE_CMD="docker compose"
    else
        DOCKER_COMPOSE_CMD="docker-compose"
    fi
}

# Función para crear backup del proyecto
create_backup() {
    print_message "Creando backup del proyecto..."
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "../$BACKUP_DIR"
    cp -r . "../$BACKUP_DIR/" 2>/dev/null || true
    print_success "Backup creado en ../$BACKUP_DIR"
}

# Función para verificar la estructura del proyecto
verify_project() {
    print_message "Verificando estructura del proyecto..."
    
    if [ ! -f "package.json" ]; then
        print_error "No se encontró package.json. ¿Estás en el directorio correcto?"
        exit 1
    fi
    
    if [ ! -f "angular.json" ]; then
        print_error "No se encontró angular.json. Este no parece ser un proyecto Angular."
        exit 1
    fi
    
    print_success "Estructura del proyecto verificada"
}

# Función para limpiar contenedores y imágenes anteriores
cleanup_docker() {
    print_message "Limpiando contenedores y imágenes anteriores..."
    
    # Detener contenedores si están corriendo
    docker stop code5_frontend 2>/dev/null || true
    
    # Remover contenedores
    docker rm code5_frontend 2>/dev/null || true
    
    # Remover imágenes anteriores (opcional)
    docker rmi code5_ppp_front_frontend 2>/dev/null || true
    
    print_success "Limpieza completada"
}

# Función para construir la imagen Docker
build_image() {
    print_message "Construyendo imagen Docker..."
    docker build -t code5_ppp_front_frontend . || {
        print_error "Error al construir la imagen Docker"
        exit 1
    }
    print_success "Imagen Docker construida exitosamente"
}

# Función para ejecutar con docker-compose
run_with_compose() {
    print_message "Iniciando aplicación con $DOCKER_COMPOSE_CMD..."
    $DOCKER_COMPOSE_CMD up -d || {
        print_error "Error al iniciar con $DOCKER_COMPOSE_CMD"
        exit 1
    }
    print_success "Aplicación iniciada exitosamente"
}

# Función para mostrar información de la aplicación
show_info() {
    echo ""
    echo "============================================"
    print_success "¡DOCKERIZACIÓN COMPLETADA!"
    echo "============================================"
    echo ""
    echo "📱 Aplicación Frontend: http://localhost"
    echo "🐳 Contenedor: code5_frontend"
    echo ""
    echo "Comandos útiles:"
    echo "  Ver logs:           $DOCKER_COMPOSE_CMD logs -f"
    echo "  Detener:           $DOCKER_COMPOSE_CMD down"
    echo "  Reiniciar:         $DOCKER_COMPOSE_CMD restart"
    echo "  Ver estado:        docker ps"
    echo ""
    echo "Para acceder al contenedor:"
    echo "  docker exec -it code5_frontend sh"
    echo ""
}

# Función principal
main() {
    echo "============================================"
    echo "🐳 DOCKERIZACIÓN AUTOMÁTICA - CODE5 PPP"
    echo "============================================"
    echo ""
    
    # Verificaciones preliminares
    check_docker
    verify_project
    
    # Preguntar si crear backup
    read -p "¿Deseas crear un backup del proyecto? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_backup
    fi
    
    # Preguntar si limpiar contenedores anteriores
    read -p "¿Deseas limpiar contenedores Docker anteriores? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup_docker
    fi
    
    # Proceso de construcción
    print_message "Iniciando proceso de dockerización..."
    
    # Construir imagen
    build_image
    
    # Ejecutar con docker-compose
    run_with_compose
    
    # Esperar un momento para que los contenedores se inicien
    print_message "Esperando a que la aplicación se inicie..."
    sleep 5
    
    # Verificar que el contenedor esté corriendo
    if docker ps | grep -q "code5_frontend"; then
        show_info
    else
        print_error "El contenedor no parece estar corriendo correctamente"
        print_message "Ejecuta '$DOCKER_COMPOSE_CMD logs' para ver los logs"
        exit 1
    fi
}

# Manejo de señales para limpieza
trap 'print_error "Script interrumpido por el usuario"; exit 1' INT TERM

# Ejecutar función principal
main "$@"