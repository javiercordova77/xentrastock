#!/bin/bash

echo "🔍 Verificando estado de XentraStock..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar Backend (Puerto 3001)
echo "🔧 Backend API (Puerto 3001):"
if timeout 3 curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "   ✅ Backend API - FUNCIONANDO"
    echo "   🔗 URL: http://localhost:3001"
else
    echo "   ❌ Backend API - NO RESPONDE"
fi

echo ""

# Verificar Frontend (Puerto 3000)
echo "🖥️  Frontend React (Puerto 3000):"
if timeout 3 curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "   ✅ Frontend React - FUNCIONANDO"
    echo "   🔗 URL: http://localhost:3000"
else
    echo "   ❌ Frontend React - NO RESPONDE"
fi

echo ""
echo "📊 Procesos en ejecución:"
echo "   Backend (3001): $(lsof -ti:3001 2>/dev/null || echo 'No encontrado')"
echo "   Frontend (3000): $(lsof -ti:3000 2>/dev/null || echo 'No encontrado')"

echo ""
echo "🚀 Para iniciar los servicios:"
echo "   Backend:  cd backend-api && npm run dev"
echo "   Frontend: cd frontend-react && npm start"