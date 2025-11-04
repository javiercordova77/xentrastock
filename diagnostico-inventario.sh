#!/bin/bash

echo "🔧 DIAGNÓSTICO COMPLETO DEL INVENTARIO"
echo "======================================"

echo ""
echo "📡 1. Verificando servicios..."
echo "------------------------------"

# Verificar puertos
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Frontend (puerto 3000): FUNCIONANDO"
else
    echo "❌ Frontend (puerto 3000): NO RESPONDE"
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "✅ Backend (puerto 3001): FUNCIONANDO"
else
    echo "❌ Backend (puerto 3001): NO RESPONDE"
fi

echo ""
echo "🔌 2. Probando endpoints..."
echo "----------------------------"

# Test endpoint health
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Health endpoint: OK"
else
    echo "❌ Health endpoint: FALLA"
fi

# Test inventario endpoint
if curl -s http://localhost:3001/api/inventario-legacy/inventario-legacy > /dev/null; then
    echo "✅ Inventario endpoint: OK"
    ITEMS=$(curl -s http://localhost:3001/api/inventario-legacy/inventario-legacy | jq '.data | length' 2>/dev/null || echo "0")
    echo "📦 Items disponibles: $ITEMS"
else
    echo "❌ Inventario endpoint: FALLA"
fi

echo ""
echo "📂 3. Verificando archivos..."
echo "------------------------------"

if [ -f "js/inventario.js" ]; then
    echo "✅ js/inventario.js: EXISTE"
    LINEAS=$(wc -l < js/inventario.js)
    echo "📄 Líneas de código: $LINEAS"
else
    echo "❌ js/inventario.js: NO EXISTE"
fi

if [ -f "index.html" ]; then
    echo "✅ index.html: EXISTE"
    if grep -q "js/inventario.js" index.html; then
        echo "✅ Script incluido en HTML: SÍ"
    else
        echo "❌ Script incluido en HTML: NO"
    fi
else
    echo "❌ index.html: NO EXISTE"
fi

echo ""
echo "🧪 4. Test de datos..."
echo "----------------------"

# Obtener datos de prueba
DATA=$(curl -s http://localhost:3001/api/inventario-legacy/inventario-legacy 2>/dev/null)
if [ $? -eq 0 ]; then
    ITEMS=$(echo "$DATA" | jq '.data | length' 2>/dev/null || echo "0")
    STOCK_TOTAL=$(echo "$DATA" | jq '.totales.stock_total' 2>/dev/null || echo "0")
    VALOR_TOTAL=$(echo "$DATA" | jq '.totales.valor_total' 2>/dev/null || echo "0")
    
    echo "📊 Total de items: $ITEMS"
    echo "📦 Stock total: $STOCK_TOTAL unidades"
    echo "💰 Valor total: \$$VALOR_TOTAL"
    
    if [ "$ITEMS" -gt 0 ]; then
        echo "✅ Datos: DISPONIBLES"
    else
        echo "⚠️ Datos: VACÍOS"
    fi
else
    echo "❌ Datos: NO ACCESIBLES"
fi

echo ""
echo "🌐 5. Test de frontend..."
echo "-------------------------"

if curl -s http://localhost:3000 | grep -q "XentraStock"; then
    echo "✅ Frontend: CARGA CORRECTAMENTE"
else
    echo "❌ Frontend: NO CARGA"
fi

if curl -s http://localhost:3000/js/inventario.js | grep -q "loadInventarioData"; then
    echo "✅ JavaScript: ACCESIBLE"
else
    echo "❌ JavaScript: NO ACCESIBLE"
fi

echo ""
echo "🎯 6. Simulación de carga de inventario..."
echo "-------------------------------------------"

# Crear un test simulando la función JavaScript
node -e "
const fetch = require('node-fetch');

async function testInventarioLoad() {
    try {
        console.log('🔄 Simulando loadInventarioData()...');
        
        const response = await fetch('http://localhost:3001/api/inventario-legacy/inventario-legacy');
        
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const apiData = await response.json();
        
        if (!apiData.isOk || !apiData.data) {
            throw new Error('API no devuelve datos válidos');
        }
        
        const inventarioData = apiData.data;
        
        console.log(\`✅ Inventario simulado cargado: \${inventarioData.length} items\`);
        console.log(\`📊 Stock total: \${apiData.totales.stock_total} unidades\`);
        console.log(\`💰 Valor total: \$\${apiData.totales.valor_total}\`);
        
        // Mostrar algunos items de ejemplo
        console.log('📋 Primeros 3 items:');
        inventarioData.slice(0, 3).forEach(item => {
            console.log(\`  - \${item.varianteSku}: \${item.cantidad} unidades en \${item.ubicacionNombre}\`);
        });
        
        console.log('✅ SIMULACIÓN EXITOSA');
        
    } catch (error) {
        console.error('❌ Error en simulación:', error.message);
    }
}

testInventarioLoad();
" 2>/dev/null || echo "❌ No se pudo ejecutar la simulación (node-fetch no disponible)"

echo ""
echo "📋 RESUMEN DEL DIAGNÓSTICO"
echo "=========================="

if curl -s http://localhost:3001/api/inventario-legacy/inventario-legacy > /dev/null && [ -f "js/inventario.js" ] && [ -f "index.html" ]; then
    echo "🎉 DIAGNÓSTICO: TODOS LOS COMPONENTES ESTÁN FUNCIONANDO"
    echo ""
    echo "💡 Si el inventario sigue sin cargar datos en el navegador:"
    echo "   1. Abre las herramientas de desarrollador (F12)"
    echo "   2. Ve a la pestaña 'Console'"
    echo "   3. Busca errores en JavaScript"
    echo "   4. Ve a la pestaña 'Network' y verifica las llamadas AJAX"
    echo ""
    echo "🔗 URLs para probar:"
    echo "   Frontend: http://localhost:3000"
    echo "   API Test: http://localhost:3001/api/inventario-legacy/inventario-legacy"
    echo "   Test Console: http://localhost:3000/test-inventario-consola.html"
else
    echo "⚠️ DIAGNÓSTICO: ALGUNOS COMPONENTES FALLAN"
    echo "   Revisa los errores marcados arriba"
fi

echo ""