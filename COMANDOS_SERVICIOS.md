# 🚀 Guía de Comandos - XentraStock

## 📋 Estado Actual de los Servicios

✅ **AMBOS SERVICIOS ESTÁN FUNCIONANDO AHORA**
- 🎨 **Frontend:** http://localhost:3000
- ⚙️ **Backend:** http://localhost:3001

## 🔧 Comandos Manuales

### 🎯 Backend (Puerto 3001)
```bash
# Navegar al directorio del backend
cd /Users/javiercordova/Documents/GitHub/xentrastock/backend-api

# Iniciar backend
node src/server.js

# O en background
nohup node src/server.js > ../backend.log 2>&1 &

# Verificar que funciona
curl http://localhost:3001/health
```

### 🎨 Frontend (Puerto 3000)
```bash
# Navegar al directorio del frontend
cd /Users/javiercordova/Documents/GitHub/xentrastock/frontend-react

# Iniciar frontend
npm start

# O en background
nohup npm start > ../frontend.log 2>&1 &

# Verificar que funciona
curl -I http://localhost:3000
```

## ⚡ Scripts Automáticos (RECOMENDADO)

### 🚀 Iniciar todos los servicios
```bash
cd /Users/javiercordova/Documents/GitHub/xentrastock
./start-services.sh
```

### 🛑 Detener todos los servicios
```bash
cd /Users/javiercordova/Documents/GitHub/xentrastock
./stop-services.sh
```

## 🔍 Comandos de Verificación

### ✅ Verificar estado de los servicios
```bash
# Verificar backend
curl http://localhost:3001/health

# Verificar frontend
curl -I http://localhost:3000

# Ver procesos activos
ps aux | grep -E "(node|npm)" | grep -v grep
```

### 🔍 Ver puertos en uso
```bash
# Ver qué está usando el puerto 3001 (backend)
lsof -ti:3001

# Ver qué está usando el puerto 3000 (frontend)
lsof -ti:3000
```

### 📋 Ver logs en tiempo real
```bash
# Logs del backend
tail -f /Users/javiercordova/Documents/GitHub/xentrastock/backend.log

# Logs del frontend
tail -f /Users/javiercordova/Documents/GitHub/xentrastock/frontend.log
```

## 🛠️ Solución de Problemas

### 🔄 Reiniciar servicios
```bash
# Método 1: Con scripts
./stop-services.sh
./start-services.sh

# Método 2: Manual
# Matar procesos
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Reiniciar manualmente
cd backend-api && node src/server.js &
cd ../frontend-react && npm start &
```

### 🧹 Limpiar procesos residuales
```bash
# Matar todos los procesos de node relacionados
pkill -f "xentrastock.*node"
pkill -f "react-scripts.*start"
pkill -f "npm.*start"
```

## 📊 API Endpoints (Backend)

Una vez que el backend esté funcionando, puedes probar:

```bash
# Health check
curl http://localhost:3001/health

# Listar proveedores
curl http://localhost:3001/api/proveedores

# Listar categorías
curl http://localhost:3001/api/categorias

# Resumen del sistema
curl http://localhost:3001/api/reportes/resumen

# Lista de todos los endpoints
curl http://localhost:3001/api/reportes
```

## 🌐 URLs Principales

- **Frontend Principal:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/health
- **Documentación API:** Ver `API_DOCUMENTATION.md`

## 💡 Notas Importantes

1. **Orden de inicio:** Siempre inicia el backend primero, luego el frontend
2. **Tiempo de compilación:** El frontend puede tardar 30-60 segundos en compilar
3. **Logs:** Los logs se guardan en `backend.log` y `frontend.log`
4. **Puerto ocupado:** Si hay errores de puerto ocupado, usa `./stop-services.sh` primero
5. **Desarrollo:** Para desarrollo activo, usa los comandos manuales para ver los logs en tiempo real