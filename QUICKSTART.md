# Guía de Inicio Rápido - Xentrastock

## Instalación en 5 Pasos

### 1. Clonar el repositorio
```bash
git clone https://github.com/javiercordova77/xentrastock.git
cd xentrastock
```

### 2. Crear y activar entorno virtual
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. (Opcional) Poblar con datos de prueba
```bash
python populate_sample_data.py
```

### 5. Iniciar la aplicación
```bash
python app.py
```

Abrir navegador en: **http://localhost:5000**

## Primeros Pasos

### 1. Configurar Datos Básicos

#### a) Crear Proveedores
- Ir a **Proveedores** → **+ Nuevo Proveedor**
- Llenar: Nombre, RFC, Teléfono, Email
- Guardar

#### b) Crear Categorías
- Ir a **Categorías** → **+ Nueva Categoría**
- Llenar: Nombre, Descripción
- Guardar

#### c) Crear Ubicaciones
- Ir a **Ubicaciones** → **+ Nueva Ubicación**
- Llenar: Código (ej: ALM-001), Nombre (ej: Almacén Principal)
- Guardar

### 2. Registrar Productos

- Ir a **Productos** → **+ Nuevo Producto**
- Llenar:
  - Código único (ej: PROD-001)
  - Nombre
  - Categoría (seleccionar de la lista)
  - Proveedor (seleccionar de la lista)
  - Precios de compra y venta
  - Stock mínimo y máximo
- Guardar

### 3. Registrar Entrada de Productos

- Ir a **Movimientos** → **+ Nuevo Movimiento**
- Seleccionar:
  - Tipo: **ENTRADA**
  - Producto
  - Ubicación
  - Cantidad
  - Motivo: "Compra inicial"
- Guardar

El inventario se actualizará automáticamente.

### 4. Verificar Inventario

- Ir a **Inventario**
- Ver el stock actual de todos los productos
- Usar filtros para buscar productos específicos
- Ver estados de stock (Normal, Bajo, Alto)

### 5. Generar Reportes

- Ir a **Reportes**
- Seleccionar tipo de reporte
- Aplicar filtros
- Ver en pantalla o descargar PDF

## Módulos Disponibles

| Módulo | Función | CRUD |
|--------|---------|------|
| Proveedores | Gestión de proveedores | ✅ |
| Categorías | Clasificación de productos | ✅ |
| Ubicaciones | Lugares de almacenamiento | ✅ |
| Productos | Catálogo de productos | ✅ |
| Variantes | Variantes de productos | ✅ |
| Inventario | Control de stock | ✅ |
| Movimientos | Entradas/Salidas | ✅ |
| Transferencias | Entre ubicaciones | ✅ |
| Reportes | Generación de reportes | ✅ |

## Operaciones Comunes

### Registrar una Compra
1. Movimientos → + Nuevo Movimiento
2. Tipo: ENTRADA
3. Seleccionar producto, ubicación y cantidad
4. Motivo: "Compra"
5. Guardar

### Registrar una Venta
1. Movimientos → + Nuevo Movimiento
2. Tipo: SALIDA
3. Seleccionar producto, ubicación y cantidad
4. Motivo: "Venta"
5. Guardar

### Transferir entre Almacenes
1. Transferencias → + Nueva Transferencia
2. Seleccionar producto, origen, destino y cantidad
3. Guardar
4. Procesar la transferencia desde la lista

### Ver Productos con Stock Bajo
1. Inventario
2. Filtro Estado: "Stock Bajo"
3. Filtrar
4. Ver productos que necesitan reabastecimiento

## Estructura de Archivos

```
xentrastock/
├── app.py                      # Aplicación principal
├── models.py                   # Modelos de base de datos
├── config.py                   # Configuración
├── requirements.txt            # Dependencias Python
├── populate_sample_data.py     # Script de datos de prueba
├── templates/                  # Plantillas HTML
├── static/css/                 # Estilos CSS
└── instance/                   # Base de datos SQLite
```

## Tecnologías

- **Backend:** Python 3.x + Flask
- **Base de Datos:** SQLite + SQLAlchemy ORM
- **Frontend:** HTML5 + CSS3 + Jinja2
- **Reportes:** ReportLab

## Soporte

- GitHub Issues: https://github.com/javiercordova77/xentrastock/issues
- Manual Completo: Ver `MANUAL_USUARIO.md`
- README: Ver `README.md`

## Licencia

MIT License - Ver archivo LICENSE
