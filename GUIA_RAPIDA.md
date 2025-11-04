# 🚀 XentraStock v3.0 - Guía Rápida de Uso

## ✅ ¡Sistema Completamente Funcional!

### 🎯 Enlaces Directos
- **🚀 Interfaz Moderna**: http://localhost:8080/modern
- **🏠 Página Principal**: http://localhost:8080
- **⚙️ Backend API**: http://localhost:3001/api
- **💚 Health Check**: http://localhost:3001/health

### 🔧 Scripts de Control

#### Iniciar Todos los Servicios
```bash
./start-services.sh
```

#### Detener Todos los Servicios
```bash
./stop-services.sh
```

#### Verificar Estado de Servicios
```bash
./check-services-v3.sh
```

### 📊 Lo Que Está Funcionando

#### ✅ Dashboard Completo
- Métricas en tiempo real
- Gráficos interactivos (Chart.js)
- Alertas de stock bajo
- Movimientos recientes
- Auto-refresh cada 30 segundos

#### ✅ Inventario Avanzado
- Listado completo con paginación
- Filtros por categoría, ubicación, proveedor
- Búsqueda en tiempo real
- Exportación a CSV
- Acciones masivas
- Ordenamiento por columnas

#### ✅ Proveedores
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Modal moderno para edición
- Búsqueda instantánea
- Validación de formularios

#### 🚧 Módulos en Desarrollo
- Categorías (estructura lista)
- Productos (estructura lista)
- Variantes (estructura lista)
- Ubicaciones (estructura lista)
- Movimientos (estructura lista)
- Transferencias (estructura lista)
- Reportes (estructura lista)
- Configuración (estructura lista)

### 🎨 Características de la Nueva Interfaz

#### 📱 Responsive Design
- **Desktop**: Sidebar horizontal elegante
- **Mobile**: Menú hamburguesa optimizado
- **Tablet**: Adaptación automática

#### 🎯 UX/UI Moderno
- **Colores**: Paleta profesional azul/gris
- **Tipografía**: Inter (Google Fonts)
- **Iconos**: Font Awesome 6.5
- **Animaciones**: Transiciones suaves
- **Loading**: Estados de carga intuitivos

#### ⚡ Performance
- **Lazy Loading**: Módulos cargan bajo demanda
- **Debounce**: Búsquedas optimizadas (300ms)
- **Paginación**: Carga eficiente de datos
- **Cache**: Datos persistentes en localStorage

### 🛠️ Arquitectura Técnica

#### Frontend
- **HTML5** + **Tailwind CSS** + **Alpine.js**
- **Chart.js** para gráficos
- **Fetch API** para comunicación con backend
- Arquitectura modular y escalable

#### Backend
- **Node.js** + **Express.js**
- **SQLite** con esquema completo
- **CORS** + **Helmet** para seguridad
- API REST documentada

### 🔍 Debugging y Logs

#### Ver Logs en Tiempo Real
```bash
# Backend
tail -f backend.log

# Frontend
tail -f frontend.log

# Ambos en terminales separadas
tail -f backend.log &
tail -f frontend.log &
```

#### Reiniciar Servicios
```bash
# Reinicio completo
./stop-services.sh && ./start-services.sh

# Solo backend
kill $(lsof -ti:3001) && cd backend-api && node src/server.js &

# Solo frontend
kill $(lsof -ti:8080) && node frontend-server.js &
```

### 🎮 Uso del Sistema

#### 1. Dashboard
- Abre http://localhost:8080/modern
- Observa las métricas principales
- Revisa alertas de stock bajo
- Analiza gráficos interactivos

#### 2. Inventario
- Ve a módulo "Inventario"
- Usa filtros para encontrar productos
- Selecciona múltiples items
- Exporta datos a CSV

#### 3. Proveedores
- Ve a módulo "Proveedores"
- Crea nuevo proveedor con "Nuevo Proveedor"
- Edita proveedores existentes
- Busca por nombre, email o teléfono

### 🚨 Solución de Problemas

#### Problema: "No se puede acceder al sitio"
```bash
# Verificar estado
./check-services-v3.sh

# Si no responde, reiniciar
./stop-services.sh
./start-services.sh
```

#### Problema: Backend no responde
```bash
# Ver logs
tail -f backend.log

# Reiniciar solo backend
kill $(lsof -ti:3001)
cd backend-api && node src/server.js &
```

#### Problema: Frontend no carga
```bash
# Ver logs
tail -f frontend.log

# Reiniciar solo frontend
kill $(lsof -ti:8080)
node frontend-server.js &
```

### 📈 Próximos Pasos

#### v3.1 (Próxima Versión)
- Completar módulos restantes
- Sistema de autenticación
- Reportes avanzados con PDF
- Notificaciones push
- Mobile app companion

#### v3.2 (Futuro)
- Dashboard ejecutivo
- Integración con APIs externas
- Sistema de auditoría
- Backup automático
- Multi-tenant

### 🎯 URLs Importantes

- **Interfaz Principal**: http://localhost:8080/modern
- **API Documentación**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **Inventario API**: http://localhost:3001/api/inventario
- **Proveedores API**: http://localhost:3001/api/proveedores

---

## 🎉 ¡Disfruta del nuevo XentraStock v3.0!

**Diferencias principales con la versión anterior:**
- ✅ Interfaz completamente moderna y profesional
- ✅ Responsive design para todos los dispositivos
- ✅ Performance optimizado y carga rápida
- ✅ Arquitectura modular y escalable
- ✅ UX/UI siguiendo mejores prácticas actuales
- ✅ Preserva toda la funcionalidad del backend existente