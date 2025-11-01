#!/bin/bash

# 🚀 Script para levantar los servicios de XentraStock
# Uso: ./start-services.sh

echo "🚀 Iniciando servicios de XentraStock..."

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

# Verificar puertos
if check_port 3001; then
    echo "⚠️  Puerto 3001 (Backend) está en uso"
    kill_port 3001
fi

if check_port 3000; then
    echo "⚠️  Puerto 3000 (Frontend) está en uso"
    kill_port 3000
fi

echo ""
echo "🎯 Iniciando Backend (Puerto 3001)..."

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
for i in {1..10}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "   ✅ Backend respondiendo en http://localhost:3001"
        break
    fi
    sleep 2
    if [ $i -eq 10 ]; then
        echo "   ❌ Backend no responde después de 20 segundos"
        exit 1
    fi
done

echo ""
echo "🎨 Iniciando Frontend (Puerto 3000)..."

# Cambiar al directorio del frontend
cd "$PROJECT_DIR/frontend-react" || {
    echo "❌ Error: No se puede acceder al directorio frontend-react"
    exit 1
}

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json en frontend-react"
    exit 1
fi

# Iniciar frontend en background
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   ✅ Frontend iniciado (PID: $FRONTEND_PID)"

# Esperar a que el frontend esté listo (toma más tiempo por la compilación)
echo "   ⏳ Esperando a que el frontend compile y esté listo..."
for i in {1..30}; do
    if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
        echo "   ✅ Frontend respondiendo en http://localhost:3000"
        break
    fi
    sleep 3
    if [ $i -eq 30 ]; then
        echo "   ⚠️  Frontend puede estar tardando en compilar (revisar frontend.log)"
    fi
done

echo ""
echo "🎉 ¡Servicios iniciados exitosamente!"
echo ""
echo "📱 URLs disponibles:"
echo "   🌐 Frontend:     http://localhost:3000"
echo "   ⚙️  Backend API:  http://localhost:3001"
echo "   💚 Health Check: http://localhost:3001/health"
echo ""
echo "📊 PIDs de los procesos:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  $PROJECT_DIR/backend.log"
echo "   Frontend: $PROJECT_DIR/frontend.log"
echo ""
echo "🛑 Para detener los servicios:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   o ejecuta: ./stop-services.sh"
echo ""
echo "🔍 Monitorear logs en tiempo real:"
echo "   Backend:  tail -f $PROJECT_DIR/backend.log"
echo "   Frontend: tail -f $PROJECT_DIR/frontend.log"