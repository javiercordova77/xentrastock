# 🚀 XentraStock v2.0 - Guía de Instalación y Ejecución

## 📋 Requisitos del Sistema

- **Node.js**: v16.0.0 o superior
- **NPM**: v7.0.0 o superior (incluido con Node.js)
- **Sistema Operativo**: macOS (ya configurado), Windows, o Linux
- **Navegador**: Chrome, Firefox, Safari, Edge (versiones recientes)

## 🛠️ Instalación Paso a Paso

### 1. Verificar Node.js y NPM

```bash
# Verificar versiones instaladas
node --version
npm --version
```

Si no tienes Node.js instalado:
- **macOS**: `brew install node` (si tienes Homebrew)
- **Descargar desde**: https://nodejs.org/

### 2. Navegar al Directorio del Proyecto

```bash
cd /Users/javiercordova/Documents/GitHub/xentrastock
```

### 3. Navegar al Backend e Instalar Dependencias

```bash
# Ir al directorio backend
cd backend

# Instalar todas las dependencias
npm install
```

**Dependencias que se instalarán:**
- `express`: Framework web para Node.js
- `sqlite3` y `better-sqlite3`: Drivers SQLite
- `cors`: Middleware para CORS
- `helmet`: Seguridad HTTP
- `express-rate-limit`: Limitación de velocidad
- `express-validator`: Validación de datos

### 4. Verificar Estructura de Archivos

Asegúrate de que tengas esta estructura:

```
xentrastock/
├── README.md
├── stock.html
├── _sdk/
│   └── data_sdk.js
└── backend/
    ├── package.json
    ├── server.js
    ├── database/
    │   └── init.js
    ├── services/
    │   ├── dataServices.js
    │   └── inventarioServices.js
    └── routes/
        ├── dataRoutes.js
        └── inventarioRoutes.js
```

## 🔄 Ejecución del Sistema

### 1. Iniciar el Servidor Backend

```bash
# Desde el directorio backend/
npm start
```

**Salida esperada:**
```
🚀 Data SDK v2.0 cargado - Ahora con SQLite!
📋 Funcionalidades: SQLite Backend, Persistent Data, RESTful API...
🔧 Base de datos SQLite inicializada correctamente
📊 10 tablas creadas con éxito
📝 Datos de ejemplo insertados
🚀 Servidor iniciado en puerto 3001
💻 Interface disponible en: http://localhost:3001
🔗 API endpoints en: http://localhost:3001/api
```

### 2. Verificar que el Servidor Funciona

En otra terminal (mantén el servidor corriendo):

```bash
# Verificar salud del servidor
curl http://localhost:3001/api/health

# Verificar datos legacy (compatibilidad)
curl http://localhost:3001/api/legacy/data
```

### 3. Abrir la Aplicación Frontend

**Opción A: Servido por el backend**
- Abre tu navegador
- Ve a: `http://localhost:3001`
- El servidor sirve automáticamente `stock.html`

**Opción B: Archivo directo (para desarrollo)**
- Abre `stock.html` directamente en el navegador
- **Nota**: Puede haber problemas de CORS, usa la Opción A

## 🧪 Verificación de Funcionamiento

### 1. Pruebas Básicas en el Frontend

1. **Cargar Datos**: Al abrir la aplicación, deberías ver datos de ejemplo
2. **Crear Proveedor**: Ve a "Proveedores" → "Agregar Nuevo"
3. **Verificar Persistencia**: Recarga la página, los datos deben mantenerse
4. **Movimientos de Inventario**: Registra ingresos/salidas
5. **Transferencias**: Crea transferencias entre ubicaciones

### 2. Pruebas de API (Terminal)

```bash
# Obtener todos los proveedores
curl http://localhost:3001/api/data/proveedores

# Crear un nuevo proveedor
curl -X POST http://localhost:3001/api/data/proveedores \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Proveedor Test","contacto":"Juan Pérez","telefono":"123456789"}'

# Obtener inventario
curl http://localhost:3001/api/inventario/stock
```

## 📊 Verificación de Base de Datos

### 1. Comprobar Archivos de Base de Datos

```bash
# Desde el directorio backend/
ls -la *.db

# Deberías ver:
# xentrastock.db (base de datos principal)
```

### 2. Inspeccionar Base de Datos (Opcional)

Si tienes SQLite CLI instalado:

```bash
# Instalar SQLite CLI (macOS)
brew install sqlite

# Abrir base de datos
sqlite3 xentrastock.db

# Dentro de SQLite:
.tables                    # Ver todas las tablas
.schema proveedores       # Ver estructura de tabla
SELECT COUNT(*) FROM stock_view;  # Contar registros de stock
.quit                     # Salir
```

## 🔧 Solución de Problemas Comunes

### Error: "Puerto 3001 en uso"

```bash
# Encontrar proceso usando el puerto
lsof -i :3001

# Matar proceso (reemplazar PID)
kill -9 <PID>

# O usar puerto diferente
PORT=3002 npm start
```

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "CORS" en el navegador

- Usa `http://localhost:3001` en lugar de abrir `stock.html` directamente
- El servidor incluye configuración CORS correcta

### Base de datos corrupta

```bash
# Eliminar y recrear base de datos
rm xentrastock.db
npm start  # Se recreará automáticamente
```

## 🌟 Funcionalidades Nuevas vs Original

### ✅ Mantenido del Sistema Original
- **Interface**: Exactamente igual
- **Funcionalidad**: Mismas características
- **Datos**: Formato compatible
- **Navegación**: Sin cambios

### 🆕 Nuevas Capacidades
- **✅ Persistencia**: Los datos se guardan permanentemente
- **✅ Performance**: Base de datos optimizada con índices
- **✅ Concurrencia**: Múltiples usuarios simultáneos
- **✅ Transacciones**: Operaciones atómicas
- **✅ Validación**: Datos consistentes
- **✅ API REST**: Endpoints modernos
- **✅ Seguridad**: Protección contra ataques comunes

## 📈 Monitoreo y Logs

### Ver Logs del Servidor

El servidor muestra logs en tiempo real:
- ✅ **Operaciones exitosas** (verde)
- ❌ **Errores** (rojo)
- 📊 **Estadísticas** (azul)
- 🔍 **Consultas SQL** (gris)

### Estadísticas del Sistema

Obtener estadísticas via API:

```bash
curl http://localhost:3001/api/inventario/estadisticas
```

## 🛑 Detener el Sistema

### Detener Servidor

En la terminal donde corre el servidor:
- Presiona `Ctrl + C`
- El servidor se detendrá gracefulmente

### Backup de Datos

```bash
# Crear backup de la base de datos
cp xentrastock.db xentrastock_backup_$(date +%Y%m%d_%H%M%S).db
```

## 🚀 Próximos Pasos Recomendados

1. **Producción**: Configurar variables de entorno
2. **Deployment**: Subir a servicios cloud (Heroku, DigitalOcean)
3. **Backup**: Automatizar respaldos de base de datos
4. **Monitoring**: Agregar herramientas de monitoreo
5. **Testing**: Implementar tests automatizados

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** del servidor para errores específicos
2. **Verifica las URLs** - usa `localhost:3001` no file://
3. **Comprueba Node.js** - versión 16+ requerida
4. **Reinstala dependencias** si hay errores de módulos

¡Tu sistema XentraStock v2.0 con SQLite está listo para funcionar! 🎉