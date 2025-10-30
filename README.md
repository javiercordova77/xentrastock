# Xentrastock - Sistema de Gestión de Inventarios

Sistema completo de gestión de inventarios con metodología CRUD (Create, Read, Update, Delete) para todos los módulos.

## Características

El sistema incluye los siguientes módulos con operaciones CRUD completas:

✅ **Proveedores** - Gestión completa de proveedores
✅ **Categorías** - Administración de categorías de productos
✅ **Ubicaciones** - Control de ubicaciones de almacenamiento
✅ **Productos** - Catálogo completo de productos
✅ **Variantes** - Gestión de variantes de productos
✅ **Inventario** - Visualización, filtros, estados de stock
✅ **Movimientos** - Ingresos, salidas, historial
✅ **Transferencias** - Crear, listar, procesar
✅ **Reportes** - Generar, imprimir, filtrar

## Tecnologías Utilizadas

- **Backend**: Python 3.x con Flask
- **Base de Datos**: SQLite (SQLAlchemy ORM)
- **Frontend**: HTML5, CSS3, Jinja2 Templates
- **Reportes**: ReportLab para generación de PDFs

## Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

## Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/javiercordova77/xentrastock.git
cd xentrastock
```

2. **Crear un entorno virtual** (recomendado)
```bash
python -m venv venv
```

3. **Activar el entorno virtual**

En Windows:
```bash
venv\Scripts\activate
```

En Linux/Mac:
```bash
source venv/bin/activate
```

4. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

5. **Configurar variables de entorno** (opcional)
```bash
cp .env.example .env
```

Editar `.env` si desea personalizar la configuración.

## Ejecución

1. **Iniciar la aplicación**
```bash
python app.py
```

2. **Acceder a la aplicación**

Abrir el navegador en: `http://localhost:5000`

## Estructura del Proyecto

```
xentrastock/
├── app.py                 # Aplicación principal Flask
├── models.py             # Modelos de base de datos
├── config.py             # Configuración
├── requirements.txt      # Dependencias
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore           # Archivos ignorados por Git
├── templates/           # Plantillas HTML
│   ├── base.html
│   ├── index.html
│   ├── proveedores/
│   ├── categorias/
│   ├── ubicaciones/
│   ├── productos/
│   ├── variantes/
│   ├── inventario/
│   ├── movimientos/
│   ├── transferencias/
│   └── reportes/
└── static/
    └── css/
        └── style.css    # Estilos CSS
```

## Uso del Sistema

### Proveedores
- Crear, editar, eliminar y listar proveedores
- Campos: nombre, RFC, teléfono, email, dirección, contacto

### Categorías
- Gestionar categorías de productos
- Campos: nombre, descripción

### Ubicaciones
- Administrar ubicaciones de almacenamiento
- Campos: código, nombre, descripción, capacidad

### Productos
- Catálogo completo de productos
- Campos: código, nombre, descripción, precios, stock mínimo/máximo, unidad de medida
- Relaciones: categoría, proveedor

### Variantes
- Crear variantes de productos (ej: color, talla)
- Campos: código, nombre, atributos personalizables, precio adicional

### Inventario
- Visualizar inventario en tiempo real
- Filtros por producto, ubicación, estado de stock
- Estados: Sin Stock, Stock Bajo, Stock Normal, Stock Alto

### Movimientos
- Registrar entradas, salidas y ajustes de inventario
- Filtros por tipo, producto, fechas
- Historial completo de movimientos

### Transferencias
- Crear transferencias entre ubicaciones
- Estados: Pendiente, En Proceso, Completada, Cancelada
- Procesamiento de transferencias con actualización automática de inventario

### Reportes
- Reporte de inventario con filtros
- Reporte de movimientos con filtros
- Generación de PDFs para impresión
- Estadísticas generales del sistema

## Base de Datos

La base de datos SQLite se crea automáticamente al iniciar la aplicación por primera vez. El archivo se guarda como `xentrastock.db`.

## Características Técnicas

- **CRUD Completo**: Todas las entidades tienen operaciones Create, Read, Update, Delete
- **Validaciones**: Validación de datos en backend
- **Relaciones**: Relaciones apropiadas entre entidades (Foreign Keys)
- **Filtros**: Capacidad de filtrado en listas e inventario
- **Estados**: Control de estados en inventario y transferencias
- **Reportes**: Generación de reportes en pantalla y PDF
- **Responsive**: Diseño adaptable a diferentes dispositivos

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Autor

Javier Cordova - [javiercordova77](https://github.com/javiercordova77)

## Soporte

Para reportar problemas o sugerencias, por favor abre un issue en GitHub.
