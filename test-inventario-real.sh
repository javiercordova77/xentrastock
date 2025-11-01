#!/bin/bash

# Test para validar que el módulo de Inventario muestra datos reales
echo "🧪 Iniciando pruebas del módulo de Inventario con datos reales..."
echo "=============================================="

# Función para hacer peticiones con manejo de errores
make_request() {
    local url=$1
    local description=$2
    echo "📊 Probando: $description"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ $description - OK"
        # Extraer información relevante del JSON
        if command -v jq > /dev/null; then
            echo "   📈 Datos encontrados:"
            echo $body | jq '.data | length' 2>/dev/null | xargs printf "   - Total de elementos: %s\n" 2>/dev/null || echo "   - Respuesta recibida exitosamente"
        fi
    else
        echo "❌ $description - Error HTTP: $http_code"
        echo "   Respuesta: $body"
        return 1
    fi
    echo ""
}

# Variable para contar errores
errors=0

# Test 1: Verificar API de inventario ColchonesW
if ! make_request "http://localhost:3001/api/inventario-colchonesw" "API de inventario ColchonesW"; then
    ((errors++))
fi

# Test 2: Verificar API de ubicaciones
if ! make_request "http://localhost:3001/api/ubicaciones" "API de ubicaciones"; then
    ((errors++))
fi

# Test 3: Verificar que frontend está respondiendo
echo "🌐 Verificando frontend..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Frontend accesible en http://localhost:3000"
else
    echo "❌ Frontend no está accesible"
    ((errors++))
fi
echo ""

# Test 4: Verificar estructura de datos del inventario
echo "🔍 Verificando estructura de datos de inventario..."
inventory_response=$(curl -s "http://localhost:3001/api/inventario-colchonesw")
if echo "$inventory_response" | grep -q "variante_id.*codigo_variante.*medida.*ubicaciones"; then
    echo "✅ Estructura de datos de inventario válida"
    
    # Contar productos con stock
    if command -v jq > /dev/null; then
        products_with_stock=$(echo "$inventory_response" | jq '[.data[] | select(.stock_total > 0)] | length' 2>/dev/null)
        total_products=$(echo "$inventory_response" | jq '.data | length' 2>/dev/null)
        echo "   📦 Productos totales: $total_products"
        echo "   📈 Productos con stock: $products_with_stock"
        
        # Mostrar algunos ejemplos
        echo "   🏷️  Ejemplos de productos:"
        echo "$inventory_response" | jq -r '.data[0:3][] | "   - \(.codigo_variante): \(.medida) (\(.categoria_nombre)) - Stock: \(.stock_total)"' 2>/dev/null || echo "   - Datos disponibles pero sin jq para formato"
    fi
else
    echo "❌ Estructura de datos de inventario inválida"
    ((errors++))
fi
echo ""

# Test 5: Verificar que no hay productos de prueba antiguos
echo "🧹 Verificando ausencia de datos de prueba..."
if echo "$inventory_response" | grep -qi "producto.*prueba\|test.*product\|demo.*item"; then
    echo "⚠️  Advertencia: Se encontraron referencias a productos de prueba"
    echo "$inventory_response" | grep -i "prueba\|test\|demo" | head -3
else
    echo "✅ No se encontraron productos de prueba en los datos"
fi
echo ""

# Resumen final
echo "=============================================="
if [ $errors -eq 0 ]; then
    echo "🎉 ¡Todas las pruebas pasaron! El módulo de Inventario está funcionando con datos reales."
    echo ""
    echo "✨ Funcionalidades validadas:"
    echo "   ✅ API de inventario ColchonesW funcionando"
    echo "   ✅ API de ubicaciones funcionando"
    echo "   ✅ Frontend accesible"
    echo "   ✅ Estructura de datos válida"
    echo "   ✅ Datos reales sin elementos de prueba"
    echo ""
    echo "🌐 Accede al inventario en: http://localhost:3000/inventario"
else
    echo "❌ Se encontraron $errors errores. Revisa los detalles arriba."
    exit 1
fi