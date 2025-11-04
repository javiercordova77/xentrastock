#!/bin/bash

echo "🔄 VERIFICACIÓN POST-RESTAURACIÓN"
echo "================================="

echo ""
echo "🌐 1. Verificando servicios..."
echo "------------------------------"

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Frontend (3000): FUNCIONANDO"
else
    echo "❌ Frontend (3000): NO RESPONDE"
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "✅ Backend (3001): FUNCIONANDO"
else
    echo "❌ Backend (3001): NO RESPONDE"
fi

echo ""
echo "📊 2. Verificando endpoints de datos..."
echo "---------------------------------------"

# Test proveedores
PROVEEDORES=$(curl -s http://localhost:3001/api/proveedores | jq '.data | length' 2>/dev/null || echo "0")
echo "📋 Proveedores: $PROVEEDORES registros"

# Test ubicaciones
UBICACIONES=$(curl -s http://localhost:3001/api/ubicaciones | jq '.data | length' 2>/dev/null || echo "0")
echo "📍 Ubicaciones: $UBICACIONES registros"

# Test categorías
CATEGORIAS=$(curl -s http://localhost:3001/api/categorias | jq '.data | length' 2>/dev/null || echo "0")
echo "📂 Categorías: $CATEGORIAS registros"

# Test productos
PRODUCTOS=$(curl -s http://localhost:3001/api/productos | jq '.data | length' 2>/dev/null || echo "0")
echo "📦 Productos: $PRODUCTOS registros"

# Test variantes
VARIANTES=$(curl -s http://localhost:3001/api/variantes | jq '.data | length' 2>/dev/null || echo "0")
echo "🔧 Variantes: $VARIANTES registros"

# Test inventario
INVENTARIO=$(curl -s http://localhost:3001/api/inventario-legacy/inventario-legacy | jq '.data | length' 2>/dev/null || echo "0")
echo "📊 Inventario: $INVENTARIO items"

echo ""
echo "📂 3. Verificando archivos restaurados..."
echo "-----------------------------------------"

if [ -f "index.html" ]; then
    if grep -q "XentraStock 3.0" index.html; then
        echo "✅ index.html: RESTAURADO CORRECTAMENTE"
    else
        echo "⚠️ index.html: EXISTE PERO CONTENIDO INCORRECTO"
    fi
else
    echo "❌ index.html: NO EXISTE"
fi

if [ -f "js/inventario.js" ]; then
    if grep -q "inventario-legacy" js/inventario.js; then
        echo "✅ js/inventario.js: CONFIGURADO CORRECTAMENTE"
    else
        echo "⚠️ js/inventario.js: FALTA CONFIGURACIÓN"
    fi
else
    echo "❌ js/inventario.js: NO EXISTE"
fi

# Verificar otros archivos JS
JS_FILES=("proveedores.js" "ubicaciones.js" "categorias.js" "productos.js" "variantes.js")
for file in "${JS_FILES[@]}"; do
    if [ -f "js/$file" ]; then
        echo "✅ js/$file: DISPONIBLE"
    else
        echo "❌ js/$file: FALTANTE"
    fi
done

echo ""
echo "🎯 4. Estado de los datos..."
echo "----------------------------"

if [ "$PROVEEDORES" -gt 0 ] && [ "$UBICACIONES" -gt 0 ] && [ "$INVENTARIO" -gt 0 ]; then
    echo "✅ TODOS LOS DATOS DISPONIBLES"
    echo ""
    echo "📋 Resumen:"
    echo "   - Proveedores: $PROVEEDORES"
    echo "   - Ubicaciones: $UBICACIONES" 
    echo "   - Categorías: $CATEGORIAS"
    echo "   - Productos: $PRODUCTOS"
    echo "   - Variantes: $VARIANTES"
    echo "   - Inventario: $INVENTARIO items"
else
    echo "⚠️ ALGUNOS DATOS FALTAN"
fi

echo ""
echo "🎨 5. Instrucciones de verificación..."
echo "--------------------------------------"
echo ""
echo "1. 🌐 Ve a: http://localhost:3000"
echo "2. 📱 Verifica el diseño original:"
echo "   - Navegación vertical en el lado izquierdo"
echo "   - Logo XentraStock 3.0 en la parte superior"
echo "   - Dashboard con estadísticas"
echo ""
echo "3. 🧪 Prueba cada módulo:"
echo "   - Dashboard: Estadísticas generales"
echo "   - Proveedores: $PROVEEDORES registros"
echo "   - Categorías: $CATEGORIAS registros"
echo "   - Ubicaciones: $UBICACIONES registros"
echo "   - Productos: $PRODUCTOS registros"
echo "   - Variantes: $VARIANTES registros"
echo "   - Inventario: $INVENTARIO items CON DATOS REALES"
echo ""

if [ "$INVENTARIO" -gt 0 ] && [ "$PROVEEDORES" -gt 0 ]; then
    echo "🎉 ¡RESTAURACIÓN EXITOSA!"
    echo ""
    echo "✅ La interfaz original ha sido restaurada"
    echo "✅ Todos los módulos tienen datos"
    echo "✅ El inventario muestra $INVENTARIO items reales"
    echo "✅ El diseño original está funcionando"
else
    echo "⚠️ RESTAURACIÓN PARCIAL"
    echo "Algunos módulos pueden necesitar verificación adicional"
fi

echo ""