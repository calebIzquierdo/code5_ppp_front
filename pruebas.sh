#!/bin/bash

# Script súper simple para servidor de pruebas

echo "🧪 DESPLEGANDO PARA PRUEBAS..."
echo "=============================="

# Clonar o actualizar
if [ -d "code5_ppp_front" ]; then
    echo "[INFO] Actualizando proyecto..."
    cd code5_ppp_front
    git pull origin CalebDev
else
    echo "[INFO] Clonando proyecto..."
    git clone https://github.com/arlysanchez/code5_ppp_front.git
    cd code5_ppp_front
fi

# Desplegar
echo "[INFO] Desplegando..."
chmod +x dockerize.sh
./dockerize.sh

# Obtener IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "🎉 ¡LISTO PARA PRUEBAS!"
echo "======================"
echo "🌐 Accede desde cualquier navegador:"
echo "   → http://$SERVER_IP"
echo ""
echo "👥 Comparte esta URL con tu equipo"
echo "🔄 Para actualizar: ./pruebas.sh"
echo ""