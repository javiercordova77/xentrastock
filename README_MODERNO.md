# XentraStock - Sistema de Inventario Moderno v3.0

## 🚀 Nueva Interfaz Moderna

Este proyecto ha sido completamente rediseñado desde cero con una arquitectura moderna y profesional que cumple con los más altos estándares de UX/UI.

### ✨ Características Principales

- **🎨 Diseño Moderno**: Interfaz completamente nueva con Tailwind CSS
- **📱 Responsive**: Optimizado para móvil, tablet y desktop
- **🖥️ Sidebar Horizontal**: Navegación horizontal en PC, menú móvil optimizado
- **⚡ Performance**: Carga rápida y navegación fluida
- **🎯 Componentes Modulares**: Arquitectura escalable y mantenible
- **📊 Dashboard Interactivo**: Gráficos en tiempo real con Chart.js
- **🔍 Búsqueda Avanzada**: Filtros inteligentes y búsqueda en tiempo real
- **📈 Métricas en Tiempo Real**: Estadísticas actualizadas automáticamente

### 🏗️ Arquitectura del Sistema

```
📁 xentrastock/
├── 🎨 Frontend Moderno
│   ├── index_modern.html          # Interfaz principal moderna
│   ├── js/
│   │   ├── app.js                 # Controlador principal
│   │   └── modules/               # Módulos especializados
│   │       ├── dashboard.js       # ✅ Dashboard con métricas
│   │       ├── inventario.js      # ✅ Gestión de inventario
│   │       ├── proveedores.js     # ✅ Gestión de proveedores
│   │       ├── categorias.js      # 🚧 En desarrollo
│   │       ├── productos.js       # 🚧 En desarrollo
│   │       ├── variantes.js       # 🚧 En desarrollo
│   │       ├── ubicaciones.js     # 🚧 En desarrollo
│   │       ├── movimientos.js     # 🚧 En desarrollo
│   │       ├── transferencias.js  # 🚧 En desarrollo
│   │       ├── reportes.js        # 🚧 En desarrollo
│   │       └── configuracion.js   # 🚧 En desarrollo
│   └── frontend-server.js         # Servidor de desarrollo
├── 🔧 Backend API
│   └── backend-api/               # API REST completa
└── 📊 Base de Datos
    └── SQLite con estructura completa
```

### 🎯 Módulos Implementados

#### ✅ Dashboard
- **Métricas principales**: Productos, variantes, stock total, stock bajo
- **Gráficos interactivos**: Stock por ubicación, movimientos mensuales, categorías
- **Alertas en tiempo real**: Stock bajo, transferencias pendientes
- **Movimientos recientes**: Historial de últimas transacciones
- **Auto-refresh**: Actualización automática cada 30 segundos

#### ✅ Inventario
- **Vista completa**: Listado detallado con paginación
- **Filtros avanzados**: Por categoría, ubicación, proveedor, stock bajo
- **Búsqueda inteligente**: Tiempo real con debounce
- **Acciones masivas**: Exportación, ajustes, transferencias
- **Sorting**: Ordenamiento por cualquier columna
- **Exportación**: CSV con productos seleccionados

#### ✅ Proveedores
- **CRUD completo**: Crear, leer, actualizar, eliminar
- **Modal moderno**: Formulario intuitivo y validado
- **Búsqueda rápida**: Filtrado instantáneo
- **Información detallada**: Contacto, email, teléfono, dirección

#### 🚧 Módulos en Desarrollo
Los siguientes módulos tienen la estructura base y serán implementados próximamente:
- Categorías
- Productos
- Variantes
- Ubicaciones
- Movimientos
- Transferencias
- Reportes
- Configuración

### 🚀 Instalación y Configuración

#### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd xentrastock
```

#### 2. Configurar Backend
```bash
cd backend-api
npm install
node src/server.js
```
El backend estará disponible en: `http://localhost:3001`

#### 3. Configurar Frontend
```bash
# En la raíz del proyecto
node frontend-server.js
```
El frontend estará disponible en: `http://localhost:8080`

#### 4. Acceder a la Aplicación
- **Interfaz Moderna**: http://localhost:8080/modern
- **API Documentation**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

### 🌐 APIs Disponibles

El backend proporciona una API REST completa:

```javascript
// Endpoints principales
GET  /api/proveedores           # Listar proveedores
POST /api/proveedores           # Crear proveedor
PUT  /api/proveedores/:id       # Actualizar proveedor
DELETE /api/proveedores/:id     # Eliminar proveedor

GET  /api/categorias            # Listar categorías
GET  /api/ubicaciones           # Listar ubicaciones
GET  /api/productos             # Listar productos
GET  /api/variantes             # Listar variantes
GET  /api/inventario            # Inventario completo
GET  /api/movimientos           # Historial de movimientos
GET  /api/transferencias        # Transferencias
GET  /api/reportes              # Reportes del sistema
```

### 📊 Base de Datos

La base de datos SQLite incluye las siguientes tablas:

```sql
-- Estructura principal
proveedores              # Información de proveedores
categorias              # Categorías de productos
productos               # Catálogo de productos
variantes               # Variantes de productos (colores, tallas, etc.)
ubicaciones             # Almacenes y ubicaciones
stock_ubicaciones       # Stock por ubicación y variante
colores_variantes       # Colores disponibles para variantes
movimientos             # Historial de entradas y salidas
transferencias          # Transferencias entre ubicaciones

-- Vistas especializadas
vw_inventario_completo  # Vista consolidada del inventario
```

### 🎨 Tecnologías Utilizadas

#### Frontend
- **HTML5** + **CSS3**: Base semántica y moderna
- **Tailwind CSS**: Framework de utilidades CSS
- **Alpine.js**: Framework JavaScript reactivo y ligero
- **Chart.js**: Gráficos interactivos y responsivos
- **Font Awesome**: Iconografía profesional
- **Inter Font**: Tipografía moderna de Google Fonts

#### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web minimalista
- **SQLite3**: Base de datos embebida
- **CORS**: Configuración de cross-origin
- **Helmet**: Seguridad HTTP
- **Morgan**: Logging de peticiones
- **Compression**: Compresión gzip

### 🔧 Funcionalidades Avanzadas

#### Sistema de Filtros
- **Búsqueda en tiempo real** con debounce (300ms)
- **Filtros combinables** por categoría, ubicación y proveedor
- **Filtro de stock bajo** con alertas visuales
- **Persistencia de filtros** en localStorage

#### Paginación Inteligente
- **Paginación configurable** (25, 50, 100 elementos por página)
- **Navegación rápida** con botones anterior/siguiente
- **Información de contexto** (mostrando X de Y resultados)
- **Estado persistente** de página actual

#### Interfaz Responsiva
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints adaptativos**: sm, md, lg, xl
- **Menú hamburguesa** en dispositivos móviles
- **Sidebar colapsable** en desktop
- **Touch gestures** optimizados

#### Notificaciones Toast
- **Sistema de alertas** no intrusivo
- **4 tipos**: success, error, warning, info
- **Auto-dismiss** configurable
- **Animaciones suaves** de entrada y salida

### 📈 Métricas y Analytics

El dashboard incluye las siguientes métricas:

#### Estadísticas Principales
- Total de productos en el sistema
- Total de variantes disponibles
- Stock total en todas las ubicaciones
- Productos con stock bajo (<10 unidades)
- Ubicaciones activas
- Proveedores registrados
- Transferencias pendientes
- Valor total del inventario

#### Gráficos Interactivos
1. **Stock por Ubicación**: Distribución del inventario
2. **Movimientos Mensuales**: Tendencia de entradas/salidas
3. **Productos por Categoría**: Composición del catálogo

### 🛡️ Seguridad y Rendimiento

#### Seguridad
- **CORS configurado** para permitir solo orígenes autorizados
- **Helmet.js** para headers de seguridad HTTP
- **Validación de entrada** en todos los endpoints
- **Sanitización de datos** para prevenir XSS

#### Rendimiento
- **Compresión gzip** en todas las respuestas
- **Lazy loading** de módulos
- **Debounce** en búsquedas para reducir peticiones
- **Cache de datos** en memoria para consultas frecuentes
- **Minificación** de assets estáticos

### 🔄 Flujo de Desarrollo

#### Estado Actual (v3.0)
✅ **Completado**:
- Arquitectura base moderna
- Dashboard funcional con métricas
- Módulo de inventario completo
- Módulo de proveedores CRUD
- Sistema de navegación responsivo
- API REST documentada

🚧 **En Desarrollo**:
- Módulos restantes (categorías, productos, etc.)
- Autenticación y autorización
- Reportes avanzados
- Sistema de notifications push
- Exportación a Excel/PDF

🚀 **Roadmap v3.1**:
- Módulo de transferencias avanzado
- Sistema de usuarios y permisos
- Dashboard ejecutivo
- Mobile app companion
- Integración con APIs externas

### 📝 Notas Técnicas

#### Alpine.js vs React/Vue
Se eligió Alpine.js por:
- **Simplicidad**: Curva de aprendizaje mínima
- **Performance**: Muy liviano (~21KB)
- **Compatibilidad**: Funciona con HTML existente
- **Productividad**: Desarrollo rápido sin build steps

#### Tailwind CSS vs Bootstrap
Se prefirió Tailwind por:
- **Utility-first**: Mayor control granular
- **Customización**: Completamente configurable
- **Performance**: Solo incluye clases usadas
- **Consistencia**: Design system unificado

#### SQLite vs PostgreSQL/MySQL
SQLite es ideal para este proyecto porque:
- **Simplicidad**: Sin configuración de servidor
- **Portabilidad**: Archivo único autocontenido
- **Performance**: Excelente para aplicaciones medianas
- **Backup**: Fácil respaldo y restauración

### 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### 📞 Soporte

Para soporte técnico o reportar bugs:
- Crear un issue en GitHub
- Documentar pasos para reproducir
- Incluir información del entorno (OS, browser, versión)

---

**🎯 Objetivo**: Proporcionar un sistema de inventario moderno, escalable y fácil de usar que cumpla con las necesidades de businesses medianos y grandes.

**💡 Filosofía**: Simplicidad sin sacrificar funcionalidad. Interfaz intuitiva respaldada por una arquitectura sólida.