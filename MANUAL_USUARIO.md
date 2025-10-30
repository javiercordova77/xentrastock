# Manual de Usuario - Xentrastock

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Inicio Rápido](#inicio-rápido)
3. [Módulos del Sistema](#módulos-del-sistema)
4. [Operaciones CRUD](#operaciones-crud)
5. [Casos de Uso](#casos-de-uso)

## Introducción

Xentrastock es un sistema completo de gestión de inventarios que implementa la metodología CRUD (Create, Read, Update, Delete) para todos sus módulos.

### Características Principales

- ✅ Gestión completa de proveedores
- ✅ Administración de categorías de productos
- ✅ Control de ubicaciones de almacenamiento
- ✅ Catálogo de productos con precios y stocks
- ✅ Variantes de productos (colores, tallas, etc.)
- ✅ Inventario en tiempo real con estados de stock
- ✅ Movimientos de entrada, salida y ajustes
- ✅ Transferencias entre ubicaciones
- ✅ Reportes personalizables con generación de PDF

## Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone https://github.com/javiercordova77/xentrastock.git
cd xentrastock

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Poblar con Datos de Prueba (Opcional)

```bash
python populate_sample_data.py
```

### 3. Iniciar la Aplicación

```bash
python app.py
```

Luego abrir en el navegador: `http://localhost:5000`

## Módulos del Sistema

### 1. Proveedores

**Ubicación en menú:** Proveedores

**Funcionalidad:** Gestión de proveedores que suministran productos.

**Campos:**
- Nombre (requerido)
- RFC
- Teléfono
- Email
- Dirección
- Persona de Contacto
- Estado (Activo/Inactivo)

**Operaciones:**
- **Crear:** Clic en "+ Nuevo Proveedor"
- **Leer:** Lista de todos los proveedores en la página principal
- **Actualizar:** Clic en "Editar" en la fila del proveedor
- **Eliminar:** Clic en "Eliminar" (requiere confirmación)

### 2. Categorías

**Ubicación en menú:** Categorías

**Funcionalidad:** Clasificación de productos por categorías.

**Campos:**
- Nombre (requerido)
- Descripción
- Estado (Activo/Inactivo)

**Operaciones:** CRUD completo similar a Proveedores

### 3. Ubicaciones

**Ubicación en menú:** Ubicaciones

**Funcionalidad:** Control de lugares físicos de almacenamiento.

**Campos:**
- Código (requerido, único)
- Nombre (requerido)
- Descripción
- Capacidad (en unidades)
- Estado (Activo/Inactivo)

**Operaciones:** CRUD completo

### 4. Productos

**Ubicación en menú:** Productos

**Funcionalidad:** Catálogo maestro de productos.

**Campos:**
- Código (requerido, único)
- Nombre (requerido)
- Descripción
- Precio de Compra
- Precio de Venta
- Stock Mínimo
- Stock Máximo
- Unidad de Medida
- Categoría (relación)
- Proveedor (relación)
- Estado (Activo/Inactivo)

**Operaciones:** CRUD completo

### 5. Variantes

**Ubicación en menú:** Variantes

**Funcionalidad:** Gestión de variantes de productos (ej: colores, tallas).

**Campos:**
- Producto (requerido)
- Código (requerido, único)
- Nombre (requerido)
- Atributo 1 y Valor 1 (ej: Color - Rojo)
- Atributo 2 y Valor 2 (ej: Talla - M)
- Precio Adicional
- Estado (Activo/Inactivo)

**Operaciones:** CRUD completo

### 6. Inventario

**Ubicación en menú:** Inventario

**Funcionalidad:** Visualización del inventario actual con filtros.

**Características:**
- Vista en tiempo real del inventario
- Filtros por producto, ubicación y estado de stock
- Estados de stock:
  - **Sin Stock:** Cantidad = 0
  - **Stock Bajo:** Cantidad ≤ Stock Mínimo
  - **Stock Normal:** Entre Stock Mínimo y Máximo
  - **Stock Alto:** Cantidad ≥ Stock Máximo

**Campos:**
- Producto (requerido)
- Variante (opcional)
- Ubicación (requerida)
- Cantidad
- Lote
- Fecha de Vencimiento

**Operaciones:** CRUD completo

### 7. Movimientos

**Ubicación en menú:** Movimientos

**Funcionalidad:** Registro de entradas, salidas y ajustes de inventario.

**Tipos de Movimientos:**
- **ENTRADA:** Ingreso de productos al inventario
- **SALIDA:** Egreso de productos del inventario
- **AJUSTE:** Corrección de cantidades

**Campos:**
- Tipo (requerido)
- Producto (requerido)
- Variante (opcional)
- Ubicación (requerida)
- Cantidad (requerida)
- Motivo
- Referencia
- Usuario
- Notas

**Operaciones:**
- Crear nuevos movimientos (actualiza automáticamente el inventario)
- Ver historial completo
- Filtrar por tipo, producto y fechas

### 8. Transferencias

**Ubicación en menú:** Transferencias

**Funcionalidad:** Transferencia de productos entre ubicaciones.

**Estados:**
- **PENDIENTE:** Transferencia solicitada, no procesada
- **EN_PROCESO:** En proceso de transferencia
- **COMPLETADA:** Transferencia finalizada
- **CANCELADA:** Transferencia cancelada

**Campos:**
- Producto (requerido)
- Variante (opcional)
- Ubicación Origen (requerida)
- Ubicación Destino (requerida)
- Cantidad (requerida)
- Usuario que Solicita
- Notas

**Operaciones:**
- Crear transferencias
- Listar transferencias con filtro por estado
- Procesar transferencias pendientes (actualiza inventario automáticamente)
- Cancelar transferencias pendientes

### 9. Reportes

**Ubicación en menú:** Reportes

**Funcionalidad:** Generación y visualización de reportes.

**Tipos de Reportes:**

1. **Reporte de Inventario:**
   - Filtros: Estado de stock, Categoría
   - Formato: Vista web y PDF

2. **Reporte de Movimientos:**
   - Filtros: Tipo, Rango de fechas
   - Formato: Vista web y PDF

3. **Estadísticas Generales:**
   - Total de productos
   - Total de categorías
   - Total de proveedores
   - Total de ubicaciones

## Operaciones CRUD

Todos los módulos implementan las operaciones CRUD estándar:

### Create (Crear)
1. Hacer clic en el botón "+ Nuevo [Entidad]"
2. Llenar el formulario con los datos requeridos
3. Hacer clic en "Guardar"
4. El sistema mostrará un mensaje de confirmación

### Read (Leer)
- Las listas muestran todos los registros
- Se pueden aplicar filtros según el módulo
- Los datos se actualizan en tiempo real

### Update (Actualizar)
1. Hacer clic en "Editar" en la fila del registro
2. Modificar los campos necesarios
3. Hacer clic en "Guardar"
4. El sistema mostrará un mensaje de confirmación

### Delete (Eliminar)
1. Hacer clic en "Eliminar" en la fila del registro
2. Confirmar la eliminación en el diálogo
3. El registro será eliminado permanentemente

## Casos de Uso

### Caso 1: Registrar Nueva Compra

1. Ir a **Movimientos** → "+ Nuevo Movimiento"
2. Seleccionar Tipo: **ENTRADA**
3. Seleccionar el Producto
4. Seleccionar la Ubicación donde se almacenará
5. Ingresar la Cantidad
6. Agregar Motivo: "Compra"
7. Agregar Referencia: Número de orden de compra
8. Guardar
9. El inventario se actualizará automáticamente

### Caso 2: Registrar Venta

1. Ir a **Movimientos** → "+ Nuevo Movimiento"
2. Seleccionar Tipo: **SALIDA**
3. Seleccionar el Producto
4. Seleccionar la Ubicación de origen
5. Ingresar la Cantidad
6. Agregar Motivo: "Venta"
7. Agregar Referencia: Número de ticket/factura
8. Guardar
9. El inventario se reducirá automáticamente

### Caso 3: Transferir entre Almacenes

1. Ir a **Transferencias** → "+ Nueva Transferencia"
2. Seleccionar el Producto
3. Seleccionar Ubicación Origen
4. Seleccionar Ubicación Destino
5. Ingresar la Cantidad
6. Guardar (estado: PENDIENTE)
7. Para procesar: Ir a la lista de Transferencias
8. Hacer clic en "Procesar"
9. El inventario se actualizará en ambas ubicaciones

### Caso 4: Verificar Stock Bajo

1. Ir a **Inventario**
2. En filtros, seleccionar Estado: "Stock Bajo"
3. Hacer clic en "Filtrar"
4. Ver productos con stock inferior al mínimo
5. Generar orden de compra para reabastecer

### Caso 5: Generar Reporte de Movimientos

1. Ir a **Reportes** → "Reporte de Movimientos"
2. Seleccionar filtros:
   - Tipo: ENTRADA, SALIDA o todos
   - Fecha Desde y Fecha Hasta
3. Hacer clic en "Filtrar"
4. Ver reporte en pantalla
5. Hacer clic en "Descargar PDF" para imprimir

## Consejos de Uso

1. **Mantener el stock actualizado:** Registre todos los movimientos inmediatamente
2. **Usar lotes y fechas de vencimiento:** Para productos perecederos
3. **Revisar reportes regularmente:** Para tomar decisiones informadas
4. **Configurar stocks mínimos:** Para recibir alertas automáticas
5. **Usar transferencias:** En lugar de salidas/entradas manuales entre ubicaciones

## Soporte

Para problemas o sugerencias, abrir un issue en GitHub:
https://github.com/javiercordova77/xentrastock/issues
