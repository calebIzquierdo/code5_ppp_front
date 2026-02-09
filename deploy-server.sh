#!/bin/bash

# ===================================
# SCRIPT DE DESPLIEGUE EN SERVIDOR
# ===================================

echo "🚀 DESPLEGANDO EN SERVIDOR DE PRODUCCIÓN..."
echo "============================================"

# Verificar si estamos en un servidor
if [[ ! -f /etc/os-release ]]; then
    echo "[WARNING] No se detectó información del sistema"
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker no está instalado"
    echo "Instalar con: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Verificar puertos disponibles
if netstat -tuln | grep -q ":80 "; then
    echo "[WARNING] Puerto 80 está ocupado"
    echo "Considera cambiar el puerto en docker-compose.yml"
    read -p "¿Continuar de todas formas? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Crear directorio de logs
mkdir -p logs

# Construir y desplegar
echo "[INFO] Construyendo imagen..."
docker build -t code5_ppp_front-frontend .

echo "[INFO] Desplegando con docker compose..."
docker compose -f docker-compose.yml up -d

echo "[INFO] Verificando estado..."
sleep 5
docker ps | grep code5_frontend

# Obtener IP del servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "✅ DESPLIEGUE COMPLETADO"
echo "======================="
echo "🌐 Aplicación disponible en:"
echo "   → http://localhost"
echo "   → http://$SERVER_IP"
echo ""
echo "🔍 Comandos útiles:"
echo "   → Ver logs: docker compose logs -f frontend"
echo "   → Estado: docker ps"
echo "   → Detener: docker compose down"
echo ""

# Verificar conectividad
if command -v curl &> /dev/null; then
    echo "[INFO] Probando conectividad..."
    if curl -f -s http://localhost > /dev/null; then
        echo "✅ Aplicación responde correctamente"
    else
        echo "❌ La aplicación no responde en localhost"
    fi
fi

echo "🎉 ¡Despliegue finalizado!"