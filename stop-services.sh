#!/bin/bash

# 🛑 Script para detener los servicios de XentraStock v3.0
# Uso: ./stop-services.sh

echo "🛑 Deteniendo servicios de XentraStock v3.0..."

# Función para matar procesos en un puerto
kill_port() {
    local port=$1
    local service_name=$2
    echo "🔄 Deteniendo $service_name (puerto $port)..."
    
    if lsof -ti:$port > /dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null
        echo "   ✅ $service_name detenido"
    else
        echo "   ✅ $service_name ya estaba detenido"
    fi
}

# Detener backend API (puerto 3001)
kill_port 3001 "Backend API"

# Detener frontend moderno (puerto 8080)
kill_port 8080 "Frontend Moderno"

# Matar procesos específicos por nombre relacionados con xentrastock
echo ""
echo "🧹 Limpiando procesos residuales de XentraStock..."

# Matar procesos específicos del proyecto
pkill -f "xentrastock.*node" 2>/dev/null || true
pkill -f "frontend-server.js" 2>/dev/null || true
pkill -f "backend-api.*server.js" 2>/dev/null || true

echo "   ✅ Procesos residuales limpiados"

echo ""
echo "✅ Todos los servicios de XentraStock v3.0 han sido detenidos"
echo ""
echo "📝 Los archivos de log siguen disponibles:"
echo "   Backend API:      backend.log"
echo "   Frontend Moderno: frontend.log"
echo ""
echo "🚀 Para reiniciar todos los servicios:"
echo "   ./start-services.sh"