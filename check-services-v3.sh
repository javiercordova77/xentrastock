#!/bin/bash

# 📊 Script para verificar el estado de los servicios de XentraStock v3.0
# Uso: ./check-services.sh

echo "📊 Verificando estado de servicios XentraStock v3.0..."
echo ""

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para probar conectividad HTTP
test_http() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "   ✅ $name: FUNCIONANDO"
        return 0
    else
        echo "   ❌ $name: NO RESPONDE"
        return 1
    fi
}

# Verificar Backend API (Puerto 3001)
echo "🔧 Backend API (Puerto 3001):"
if check_port 3001; then
    echo "   🟢 Puerto 3001: ACTIVO"
    test_http "http://localhost:3001/health" "Health Check"
    test_http "http://localhost:3001/api" "API Endpoints"
    
    # Mostrar PID del proceso
    PID=$(lsof -ti:3001)
    echo "   📍 PID: $PID"
else
    echo "   🔴 Puerto 3001: INACTIVO"
fi

echo ""

# Verificar Frontend (Puerto 8080)
echo "🎨 Frontend Moderno (Puerto 8080):"
if check_port 8080; then
    echo "   🟢 Puerto 8080: ACTIVO"
    test_http "http://localhost:8080" "Página Principal"
    test_http "http://localhost:8080/modern" "Interfaz Moderna"
    
    # Mostrar PID del proceso
    PID=$(lsof -ti:8080)
    echo "   📍 PID: $PID"
else
    echo "   🔴 Puerto 8080: INACTIVO"
fi

echo ""

# Resumen de URLs
echo "🌐 URLs de acceso:"
echo "   🚀 Interfaz Moderna: http://localhost:8080/modern"
echo "   🏠 Página Principal:  http://localhost:8080"
echo "   ⚙️  Backend API:      http://localhost:3001/api"
echo "   💚 Health Check:     http://localhost:3001/health"

echo ""

# Verificar logs
echo "📝 Archivos de log:"
if [ -f "backend.log" ]; then
    echo "   📄 Backend:  backend.log ($(wc -l < backend.log) líneas)"
else
    echo "   ❌ Backend:  backend.log (NO EXISTE)"
fi

if [ -f "frontend.log" ]; then
    echo "   📄 Frontend: frontend.log ($(wc -l < frontend.log) líneas)"
else
    echo "   ❌ Frontend: frontend.log (NO EXISTE)"
fi

echo ""

# Comandos útiles
echo "🔧 Comandos útiles:"
echo "   Iniciar servicios:    ./start-services.sh"
echo "   Detener servicios:    ./stop-services.sh"
echo "   Ver log backend:      tail -f backend.log"
echo "   Ver log frontend:     tail -f frontend.log"
echo "   Reiniciar todo:       ./stop-services.sh && ./start-services.sh"