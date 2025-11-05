# 📦 XentraStock v3.0 - Sistema de Inventario Profesional

## 🚀 **Diseño Moderno 2025 - Completamente Renovado**

Sistema de inventario empresarial con diseño modernizado siguiendo las tendencias de UI/UX 2025, arquitectura limpia y paleta de colores corporativa estándar.

## ✨ **Características Principales**

- 🎨 **Diseño Moderno 2025**: Sidebar renovado con colores slate y efectos visuales contemporáneos
- 📱 **Responsive Design**: Optimizado para desktop, tablet y móvil
- ⚡ **Alto Rendimiento**: Arquitectura optimizada con Alpine.js y Tailwind CSS
- 🎯 **UX Intuitiva**: Navegación fluida con microinteracciones y estados visuales claros
- 🔒 **Backend Robusto**: API REST con Node.js, Express y SQLite
- 📊 **Dashboard Completo**: Módulos integrados para gestión integral

## 🏗️ **Arquitectura Técnica**

### **Frontend**
- **Framework**: Alpine.js 3.x para reactividad ligera
- **Estilos**: Tailwind CSS 3.4.3 con paleta personalizada
- **Servidor**: Node.js personalizado (puerto 8080)
- **Diseño**: Modular con componentes reutilizables

### **Backend**
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18.2
- **Base de Datos**: SQLite3 con migraciones automáticas
- **API**: RESTful con documentación integrada
- **Puerto**: 3001

## 🚀 **Inicio Rápido**

### **Requisitos**
- Node.js 16+ 
- npm 8+
- Git

### **Instalación**
```bash
# Clonar repositorio
git clone https://github.com/javiercordova77/xentrastock.git
cd xentrastock

# Instalar dependencias del backend
cd backend-api
npm install
cd ..

# Instalar dependencias del frontend React (opcional)
cd frontend-react
npm install
cd ..

# Iniciar todos los servicios
./start-services.sh
```

### **URLs de Acceso**
- 🎯 **Aplicación Principal**: http://localhost:8080/modern
- 🔧 **API Backend**: http://localhost:3001/api
- 💚 **Health Check**: http://localhost:3001/health

## 📂 **Estructura del Proyecto**

```
xentrastock/
├── 🏢 backend-api/          # API del servidor
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/         # Endpoints API
│   │   ├── database/       # Esquemas y migraciones
│   │   └── middleware/     # Middlewares personalizados
│   └── package.json
├── 🎨 css/                 # Estilos y paleta corporativa
├── 🎯 js/                  # Módulos JavaScript
│   └── modules/           # Módulos específicos
├── 📱 frontend-react/      # Proyecto React (futuro)
├── 🌟 index_modern.html    # Aplicación principal
├── 🚀 start-services.sh    # Script de inicio
├── 🛑 stop-services.sh     # Script de parada
└── 📋 README.md           # Este archivo
```

## 🎨 **Paleta de Colores 2025**

### **Colores Principales**
- **Primary**: `#3B82F6` (Azul corporativo moderno)
- **Slate**: `#0F172A` - `#F8FAFC` (Gama de grises contemporáneos)
- **Success**: `#10B981` (Verde éxito)
- **Error**: `#EF4444` (Rojo error)
- **Warning**: `#F59E0B` (Naranja advertencia)

## 🛠️ **Comandos Útiles**

```bash
# Gestión de servicios
./start-services.sh          # Iniciar todos los servicios
./stop-services.sh           # Detener todos los servicios
./check-services.sh          # Verificar estado de servicios

# Desarrollo
cd backend-api && npm run dev    # Desarrollo backend
cd frontend-react && npm start  # Desarrollo React

# Logs en tiempo real
tail -f backend.log          # Logs del backend
tail -f frontend.log         # Logs del frontend
```

## 🔧 **Scripts de Gestión**

- **start-services.sh**: Inicia backend (3001) y frontend (8080) automáticamente
- **stop-services.sh**: Detiene todos los procesos de forma segura
- **check-services.sh**: Verifica que los servicios estén funcionando

## 🌟 **Características del Diseño Moderno**

### **Sidebar 2025**
- Fondo `slate-900` profesional
- Texto con alto contraste para accesibilidad
- Efectos hover y active states
- Indicadores visuales de navegación activa
- Microinteracciones fluidas

### **Componentes UI**
- Bordes redondeados modernos (`rounded-xl`)
- Sombras sutiles para profundidad
- Transiciones suaves (200ms)
- Gradientes mínimos y elegantes
- Estados visuales claros

## 📊 **Módulos del Sistema**

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| 🏠 Dashboard | Panel principal con métricas | ✅ Activo |
| 📦 Inventario | Gestión de stock y productos | ✅ Activo |
| 🏢 Proveedores | Administración de proveedores | ✅ Activo |
| 📊 Reportes | Análisis y reportes | ✅ Activo |
| 🔄 Transferencias | Movimientos de inventario | ✅ Activo |
| 📍 Ubicaciones | Gestión de almacenes | ✅ Activo |

## 🔐 **Seguridad y Performance**

- ✅ Rate limiting implementado
- ✅ Validación de datos
- ✅ Manejo de errores robusto
- ✅ Logs de auditoría
- ✅ Optimización de consultas DB

## 📈 **Versioning**

- **v3.0**: Diseño moderno 2025 con sidebar renovado
- **v2.x**: Versión con diseño vertical
- **v1.x**: Versión inicial del sistema

## 🤝 **Contribución**

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 **Licencia**

Este proyecto es privado y pertenece a la organización.

## 📞 **Soporte**

Para soporte técnico o consultas:
- 📧 Email: [correo de soporte]
- 📱 Issues: GitHub Issues
- 📖 Docs: Documentación interna

---

**🚀 Desarrollado con tecnologías modernas para un futuro digital eficiente**
Sistema de Inventarios Xentra Stocks
