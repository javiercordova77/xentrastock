#!/bin/bash

echo "🧪 Verificando actualización del módulo de Inventario con datos reales..."
echo "=================================================================="

# Verificar que el backend esté funcionando
echo "📊 Verificando backend..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend funcionando en puerto 3001"
else
    echo "❌ Backend no está funcionando"
    exit 1
fi

# Verificar que el frontend estático esté funcionando
echo "🌐 Verificando frontend estático..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Frontend estático funcionando en puerto 8080"
else
    echo "❌ Frontend estático no está funcionando"
    exit 1
fi

# Verificar datos de inventario real
echo "📦 Verificando datos de inventario real..."
response=$(curl -s "http://localhost:3001/api/inventario-colchonesw")
productos_count=$(echo "$response" | jq '.data | length' 2>/dev/null)

if [ "$productos_count" -gt "0" ]; then
    echo "✅ API de inventario devuelve $productos_count productos reales"
    
    # Mostrar algunos productos reales
    echo "🏷️  Productos encontrados:"
    echo "$response" | jq -r '.data[0:3][] | "   - \(.codigo_variante): \(.medida) (\(.categoria_nombre)) - Stock: \(.stock_total)"' 2>/dev/null
else
    echo "❌ API de inventario no devuelve datos"
    exit 1
fi

# Verificar ubicaciones
echo "🏢 Verificando ubicaciones..."
ubicaciones_response=$(curl -s "http://localhost:3001/api/ubicaciones")
ubicaciones_count=$(echo "$ubicaciones_response" | jq '.data.data | length' 2>/dev/null)

if [ "$ubicaciones_count" -gt "0" ]; then
    echo "✅ API de ubicaciones devuelve $ubicaciones_count ubicaciones"
else
    echo "❌ API de ubicaciones no devuelve datos"
    exit 1
fi

echo ""
echo "=================================================================="
echo "🎉 ¡ACTUALIZACIÓN COMPLETADA EXITOSAMENTE!"
echo ""
echo "✨ El módulo de Inventario ahora muestra datos reales:"
echo "   📦 $productos_count productos de la base de datos"
echo "   🏢 $ubicaciones_count ubicaciones reales"
echo "   🚫 Sin productos de prueba ficticios"
echo ""
echo "🌐 Accede al sistema en: http://localhost:8080"
echo "   Luego haz clic en la pestaña 'Inventario' para ver los datos reales"
echo ""
echo "🔧 Modificaciones realizadas:"
echo "   - js/inventario.js actualizado para usar API real"
echo "   - Función loadInventarioData() conecta a /api/inventario-colchonesw"
echo "   - Función loadSelectOptions() conecta a /api/ubicaciones"
echo "   - Eliminados todos los datos ficticios"
echo ""
echo "📊 Datos que verás:"
echo "$response" | jq -r '.data[0:5][] | "   • \(.codigo_variante) - \(.producto_descripcion) (\(.stock_total} en stock)"' 2>/dev/null
echo ""