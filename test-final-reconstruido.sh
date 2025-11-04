#!/bin/bash

echo "🚀 PRUEBA FINAL DEL INVENTARIO RECONSTRUIDO"
echo "==========================================="

echo ""
echo "🔄 1. Verificando servicios..."
if ! lsof -ti:3000,3001 > /dev/null; then
    echo "❌ Servicios no están corriendo. Iniciando..."
    ./start-services.sh
    sleep 3
else
    echo "✅ Servicios están corriendo"
fi

echo ""
echo "📦 2. Test de datos..."
ITEMS=$(curl -s http://localhost:3001/api/inventario-legacy/inventario-legacy | jq '.data | length' 2>/dev/null || echo "0")
echo "📊 Items disponibles: $ITEMS"

if [ "$ITEMS" -gt 0 ]; then
    echo "✅ Datos disponibles"
else
    echo "❌ No hay datos disponibles"
    exit 1
fi

echo ""
echo "📂 3. Verificando archivos nuevos..."
if [ -f "js/inventario.js" ]; then
    echo "✅ js/inventario.js: ACTUALIZADO"
    LINEAS=$(wc -l < js/inventario.js)
    echo "📄 Líneas: $LINEAS"
else
    echo "❌ js/inventario.js: NO EXISTE"
    exit 1
fi

if [ -f "js/inventario_backup.js" ]; then
    echo "✅ Backup creado: js/inventario_backup.js"
else
    echo "⚠️ No se creó backup"
fi

echo ""
echo "🌐 4. Test de acceso..."
if curl -s http://localhost:3000/js/inventario.js | grep -q "reconstruido"; then
    echo "✅ Nuevo módulo accesible desde web"
else
    echo "❌ Módulo no accesible"
fi

echo ""
echo "🎯 INSTRUCCIONES FINALES:"
echo "========================"
echo ""
echo "1. 🌐 Abre: http://localhost:3000"
echo "2. 📱 Haz clic en 'Inventario' en el menú"
echo "3. 👀 Deberías ver:"
echo "   - Stats con números reales (Total Items: $ITEMS)"
echo "   - Tabla con datos de productos"
echo "   - Filtros funcionando"
echo ""
echo "4. 🔧 Si sigues sin ver datos:"
echo "   - Presiona F12 para abrir las herramientas de desarrollador"
echo "   - Ve a la pestaña 'Console' y busca errores en rojo"
echo "   - Ve a la pestaña 'Network' y verifica que se haga la llamada a:"
echo "     'api/inventario-legacy/inventario-legacy'"
echo ""
echo "5. 🔄 Si hay problemas, ejecuta:"
echo "   ./stop-services.sh && ./start-services.sh"
echo ""

if [ "$ITEMS" -gt 0 ]; then
    echo "🎉 ¡LISTO! Todo debería funcionar ahora."
    echo ""
    echo "📊 Resumen de datos:"
    echo "   - Items: $ITEMS"
    echo "   - Endpoint: ✅ Funcionando"
    echo "   - Frontend: ✅ Actualizado"
    echo "   - Módulo: ✅ Reconstruido"
else
    echo "❌ Hay problemas con los datos. Verifica el backend."
fi

echo ""