#!/bin/bash

# 🚀 Script para levantar los servicios de XentraStock v3.0 Moderno
# Uso: ./start-services.sh

echo "🚀 Iniciando servicios de XentraStock v3.0..."

# Directorio base del proyecto
PROJECT_DIR="/Users/javiercordova/Documents/GitHub/xentrastock"

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para matar procesos en un puerto
kill_port() {
    local port=$1
    echo "🔄 Liberando puerto $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || echo "   ✅ Puerto $port ya estaba libre"
}

echo ""
echo "📋 Verificando estado actual..."

# Verificar puertos (Backend: 3001, Frontend: 8080)
if check_port 3001; then
    echo "⚠️  Puerto 3001 (Backend API) está en uso"
    kill_port 3001
fi

if check_port 8080; then
    echo "⚠️  Puerto 8080 (Frontend) está en uso"
    kill_port 8080
fi

echo ""
echo "🎯 Iniciando Backend API (Puerto 3001)..."

# Iniciar backend
cd "$PROJECT_DIR/backend-api" || {
    echo "❌ Error: No se puede acceder al directorio backend-api"
    exit 1
}

# Verificar que existe el archivo server.js
if [ ! -f "src/server.js" ]; then
    echo "❌ Error: No se encuentra src/server.js"
    exit 1
fi

# Iniciar backend en background
nohup node src/server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   ✅ Backend iniciado (PID: $BACKEND_PID)"

# Esperar a que el backend esté listo
echo "   ⏳ Esperando a que el backend esté listo..."
for i in {1..15}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "   ✅ Backend API respondiendo en http://localhost:3001"
        break
    fi
    sleep 1
    if [ $i -eq 15 ]; then
        echo "   ❌ Backend no responde después de 15 segundos"
        echo "   📋 Revisar log: tail -f backend.log"
        exit 1
    fi
done

echo ""
echo "🎨 Iniciando Frontend Moderno (Puerto 8080)..."

# Cambiar al directorio raíz del proyecto
cd "$PROJECT_DIR" || {
    echo "❌ Error: No se puede acceder al directorio del proyecto"
    exit 1
}

# Verificar que existe el frontend server
if [ ! -f "frontend-server.js" ]; then
    echo "❌ Error: No se encuentra frontend-server.js"
    exit 1
fi

# Verificar que existe la interfaz moderna
if [ ! -f "index_modern.html" ]; then
    echo "❌ Error: No se encuentra index_modern.html"
    exit 1
fi

# Iniciar servidor frontend en background
nohup node frontend-server.js > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   ✅ Frontend iniciado (PID: $FRONTEND_PID)"

# Esperar a que el frontend esté listo
echo "   ⏳ Esperando a que el frontend esté listo..."
for i in {1..10}; do
    if curl -s -I http://localhost:8080 > /dev/null 2>&1; then
        echo "   ✅ Frontend moderno respondiendo en http://localhost:8080"
        break
    fi
    sleep 1
    if [ $i -eq 10 ]; then
        echo "   ⚠️  Frontend puede estar tardando en iniciar (revisar frontend.log)"
    fi
done

echo ""
echo "🎉 ¡Servicios XentraStock v3.0 iniciados exitosamente!"
echo ""
echo "🌐 URLs disponibles:"
echo "   🚀 Interfaz Moderna: http://localhost:8080/modern"
echo "   🏠 Página Principal:  http://localhost:8080"
echo "   ⚙️  Backend API:      http://localhost:3001/api"
echo "   💚 Health Check:     http://localhost:3001/health"
echo ""
echo "📊 PIDs de los procesos:"
echo "   Backend API:      $BACKEND_PID"
echo "   Frontend Moderno: $FRONTEND_PID"
echo ""
echo "📝 Logs en tiempo real:"
echo "   Backend:  tail -f $PROJECT_DIR/backend.log"
echo "   Frontend: tail -f $PROJECT_DIR/frontend.log"
echo ""
echo "📱 Recomendación: Abre http://localhost:8080/modern para la nueva interfaz"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "   ./stop-services.sh"
echo "   o manualmente: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "� Comandos útiles:"
echo "   Reiniciar Backend:  kill $BACKEND_PID && cd backend-api && node src/server.js &"
echo "   Reiniciar Frontend: kill $FRONTEND_PID && node frontend-server.js &"
echo "   Ver APIs:          curl http://localhost:3001/api"