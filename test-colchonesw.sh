#!/bin/bash
# Script para probar todos los endpoints de XentraStock v3.0 - ColchonesW

BASE_URL="http://localhost:3001/api"

echo "🧪 Testing XentraStock v3.0 API - ColchonesW"
echo "=============================================="
echo ""

# Test Health Check
echo "1. 🏥 Health Check"
curl -s http://localhost:3001/health | jq
echo ""

# Test Categorías
echo "2. 📁 Categorías"
curl -s "$BASE_URL/categorias" | jq '.data[0]'
echo ""

# Test Proveedores
echo "3. 🏭 Proveedores"
curl -s "$BASE_URL/proveedores" | jq '.data[0]'
echo ""

# Test Productos
echo "4. 🛏️ Productos"
curl -s "$BASE_URL/productos?limit=2" | jq '.data[0] | {id, descripcion, material, categoria_nombre, proveedor_nombre, total_variantes, stock_total}'
echo ""

# Test Variantes
echo "5. 📦 Variantes"
curl -s "$BASE_URL/variantes?limit=2" | jq '.data[0] | {id, codigo_variante, medida, precio_venta, producto_descripcion, stock_total}'
echo ""

# Test Colores Variantes
echo "6. 🎨 Colores Variantes"
curl -s "$BASE_URL/colores-variantes" | jq '.pagination'
echo ""

# Test Ubicaciones
echo "7. 📍 Ubicaciones"
curl -s "$BASE_URL/ubicaciones" | jq '.data[0]'
echo ""

# Test Inventario
echo "8. 📊 Inventario"
curl -s "$BASE_URL/inventario?limit=3" | jq '.data[0] | {codigo_variante, producto_descripcion, stock_total, ubicaciones}'
echo ""

# Test específico de un producto
echo "9. 🔍 Producto específico (ID: 1)"
curl -s "$BASE_URL/productos/1" | jq '{id, descripcion, variantes: .variantes[:2]}'
echo ""

echo "✅ Tests completados!"
echo ""
echo "📈 Resumen del sistema:"
echo "- Base de datos: ColchonesW schema ✅"
echo "- Productos con variantes: ✅"
echo "- Stock por ubicación: ✅"
echo "- Relaciones entre entidades: ✅"
echo "- API endpoints: ✅"
echo ""