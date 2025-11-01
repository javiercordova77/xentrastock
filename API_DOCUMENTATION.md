# XentraStock v3.0 - Documentación de API

## Información General

**Base URL:** `http://localhost:3001/api`
**Versión:** 3.0.0
**Formato de respuesta:** JSON

Todas las respuestas siguen el formato estándar:
```json
{
  "success": true|false,
  "data": [...],
  "count": 0,
  "message": "Mensaje opcional"
}
```

## Endpoints Disponibles

### 🏥 Health Check
- **GET** `/health` - Verificar estado del servidor

### 👥 Proveedores
- **GET** `/api/proveedores` - Listar todos los proveedores
- **GET** `/api/proveedores/:id` - Obtener proveedor por ID
- **POST** `/api/proveedores` - Crear nuevo proveedor
- **PUT** `/api/proveedores/:id` - Actualizar proveedor
- **DELETE** `/api/proveedores/:id` - Eliminar proveedor

**Campos requeridos:** `nombre`
**Campos opcionales:** `contacto`, `telefono`, `email`, `direccion`, `activo`

### 🏷️ Categorías
- **GET** `/api/categorias` - Listar todas las categorías
  - Query params: `activo=true|false`, `search=texto`
- **GET** `/api/categorias/:id` - Obtener categoría por ID
- **POST** `/api/categorias` - Crear nueva categoría
- **PUT** `/api/categorias/:id` - Actualizar categoría
- **DELETE** `/api/categorias/:id` - Eliminar categoría

**Campos requeridos:** `nombre`
**Campos opcionales:** `descripcion`, `activo`

### 📍 Ubicaciones
- **GET** `/api/ubicaciones` - Listar todas las ubicaciones
  - Query params: `activo=true|false`, `tipo=almacen|tienda|showroom|deposito`, `search=texto`
- **GET** `/api/ubicaciones/:id` - Obtener ubicación por ID
- **POST** `/api/ubicaciones` - Crear nueva ubicación
- **PUT** `/api/ubicaciones/:id` - Actualizar ubicación
- **DELETE** `/api/ubicaciones/:id` - Eliminar ubicación

**Campos requeridos:** `nombre`
**Campos opcionales:** `descripcion`, `tipo`, `activo`

### 📦 Productos
- **GET** `/api/productos` - Listar todos los productos
  - Query params: `activo=true|false`, `categoria_id=ID`, `proveedor_id=ID`, `search=texto`, `con_stock=true`, `sin_stock=true`
- **GET** `/api/productos/:id` - Obtener producto por ID
- **GET** `/api/productos/:id/variantes` - Obtener variantes de un producto
- **POST** `/api/productos` - Crear nuevo producto
- **PUT** `/api/productos/:id` - Actualizar producto
- **DELETE** `/api/productos/:id` - Eliminar producto

**Campos requeridos:** `nombre`, `sku`, `categoria_id`, `proveedor_id`
**Campos opcionales:** `descripcion`, `precio`, `stock_minimo`, `stock_maximo`, `activo`

### 🔄 Variantes
- **GET** `/api/variantes` - Listar todas las variantes
  - Query params: `producto_id=ID`, `search=texto`
- **GET** `/api/variantes/:id` - Obtener variante por ID
- **POST** `/api/variantes` - Crear nueva variante
- **PUT** `/api/variantes/:id` - Actualizar variante
- **DELETE** `/api/variantes/:id` - Eliminar variante

**Campos requeridos:** `producto_id`, `codigo`, `nombre`
**Campos opcionales:** `color`, `talla`, `precio_compra`, `precio_venta`, `stock_minimo`, `activo`

### 📊 Inventario
- **GET** `/api/inventario` - Listar todo el stock
  - Query params: `variante_id=ID`, `ubicacion_id=ID`, `producto_id=ID`
- **GET** `/api/inventario/producto/:productoId` - Stock de un producto específico
- **GET** `/api/inventario/bajo-stock` - Productos con stock bajo
  - Query params: `limite=10`
- **GET** `/api/inventario/resumen-ubicacion` - Resumen por ubicación
- **PUT** `/api/inventario/stock` - Actualizar/setear stock (upsert)

**Body para PUT stock:**
```json
{
  "variante_id": 1,
  "ubicacion_id": 1,
  "cantidad": 50
}
```

### 📈 Movimientos
- **GET** `/api/movimientos` - Listar movimientos
  - Query params: `variante_id=ID`, `ubicacion_id=ID`, `tipo=entrada|salida|ajuste`, `desde=YYYY-MM-DD`, `hasta=YYYY-MM-DD`
- **POST** `/api/movimientos` - Crear movimiento (actualiza stock automáticamente)

**Body para POST:**
```json
{
  "variante_id": 1,
  "ubicacion_id": 1,
  "tipo": "entrada|salida|ajuste",
  "cantidad": 10,
  "precio_unitario": 100.00,
  "motivo": "Descripción opcional",
  "referencia": "REF-001",
  "usuario": "nombre_usuario"
}
```

### 🔄 Transferencias
- **GET** `/api/transferencias` - Listar transferencias
- **GET** `/api/transferencias/:id` - Obtener transferencia por ID
- **POST** `/api/transferencias` - Crear transferencia (estado: pendiente)
- **PATCH** `/api/transferencias/:id/confirmar` - Ejecutar transferencia (mueve stock)
- **PATCH** `/api/transferencias/:id/cancelar` - Cancelar transferencia

**Body para POST:**
```json
{
  "variante_id": 1,
  "ubicacion_origen_id": 1,
  "ubicacion_destino_id": 2,
  "cantidad": 5,
  "motivo": "Reposición de stock",
  "usuario": "nombre_usuario"
}
```

**Body para cancelar:**
```json
{
  "motivo": "Razón de cancelación"
}
```

### 📋 Reportes
- **GET** `/api/reportes` - Lista de endpoints disponibles
- **GET** `/api/reportes/resumen` - Conteos generales del sistema
- **GET** `/api/reportes/stock-bajo` - Productos con stock menor al mínimo
  - Query params: `limite=5`
- **GET** `/api/reportes/movimientos-periodo` - Movimientos por período
  - Query params: `fecha_inicio=YYYY-MM-DD`, `fecha_fin=YYYY-MM-DD`, `tipo=entrada|salida|ajuste` (opcional)
- **GET** `/api/reportes/productos-populares` - Productos más movidos
  - Query params: `limite=10`, `dias=30`
- **GET** `/api/reportes/inventario-ubicacion` - Resumen de stock por ubicación

## Códigos de Estado HTTP

- **200** - OK
- **201** - Creado exitosamente
- **400** - Error de validación o datos incorrectos
- **404** - Recurso no encontrado
- **409** - Conflicto (ej: SKU duplicado)
- **500** - Error interno del servidor

## Ejemplos de Uso

### Crear un producto completo
```bash
# 1. Crear producto
curl -X POST http://localhost:3001/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Dell",
    "sku": "DELL-LAP-001",
    "descripcion": "Laptop Dell Inspiron 15",
    "categoria_id": 1,
    "proveedor_id": 1,
    "precio": 899.99,
    "stock_minimo": 5,
    "stock_maximo": 50
  }'

# 2. Crear variante
curl -X POST http://localhost:3001/api/variantes \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "codigo": "DELL-LAP-001-8GB",
    "nombre": "Laptop Dell 8GB RAM",
    "color": "Negro",
    "precio_compra": 750.00,
    "precio_venta": 899.99,
    "stock_minimo": 5
  }'

# 3. Setear stock inicial
curl -X PUT http://localhost:3001/api/inventario/stock \
  -H "Content-Type: application/json" \
  -d '{
    "variante_id": 1,
    "ubicacion_id": 1,
    "cantidad": 20
  }'
```

### Registrar movimiento de entrada
```bash
curl -X POST http://localhost:3001/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "variante_id": 1,
    "ubicacion_id": 1,
    "tipo": "entrada",
    "cantidad": 10,
    "precio_unitario": 750.00,
    "motivo": "Compra a proveedor",
    "referencia": "COMP-001"
  }'
```

### Hacer una transferencia
```bash
# 1. Crear transferencia
curl -X POST http://localhost:3001/api/transferencias \
  -H "Content-Type: application/json" \
  -d '{
    "variante_id": 1,
    "ubicacion_origen_id": 1,
    "ubicacion_destino_id": 2,
    "cantidad": 3,
    "motivo": "Reposición tienda"
  }'

# 2. Confirmar transferencia (ejecuta el movimiento)
curl -X PATCH http://localhost:3001/api/transferencias/1/confirmar
```

### Obtener reportes
```bash
# Resumen general
curl http://localhost:3001/api/reportes/resumen

# Stock bajo
curl http://localhost:3001/api/reportes/stock-bajo?limite=10

# Movimientos del último mes
curl "http://localhost:3001/api/reportes/movimientos-periodo?fecha_inicio=2025-10-01&fecha_fin=2025-10-31"

# Productos más populares
curl http://localhost:3001/api/reportes/productos-populares?dias=7&limite=5
```

## Notas Importantes

1. **Operaciones Atómicas**: Los movimientos y transferencias confirmadas actualizan el stock automáticamente.

2. **Validaciones**: Todos los endpoints validan datos de entrada y relaciones entre entidades.

3. **Stock Negativo**: El sistema previene que el stock quede en negativo durante salidas y transferencias.

4. **Transferencias**: Solo se pueden confirmar transferencias en estado "pendiente" y con stock suficiente en origen.

5. **Búsquedas**: Muchos endpoints soportan búsqueda por texto en campos relevantes usando el parámetro `search`.

6. **Filtros**: Los endpoints de listado incluyen múltiples opciones de filtrado por estado, tipo, fechas, etc.

7. **Paginación**: Actualmente no implementada, pero se puede añadir usando `LIMIT` y `OFFSET` en consultas.

## Frontend Services

Los servicios del frontend (`/frontend-react/src/services/api.js`) están alineados con estos endpoints y proporcionan métodos JavaScript para cada operación.

**Ejemplos en JavaScript:**
```javascript
import { productosService, movimientosService, reportesService } from '../services/api';

// Crear producto
const producto = await productosService.create({
  nombre: 'Nuevo Producto',
  sku: 'PROD-001',
  // ... otros campos
});

// Registrar movimiento
const movimiento = await movimientosService.create({
  variante_id: 1,
  ubicacion_id: 1,
  tipo: 'entrada',
  cantidad: 10
});

// Obtener reportes
const resumen = await reportesService.resumen();
const stockBajo = await reportesService.stockBajo(10);
```