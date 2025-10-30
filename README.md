# Xentra Stock - Sistema de Gestión de Inventarios

Sistema completo de gestión de inventarios para PC y dispositivos móviles con diseño responsivo.

## 📋 Características

El sistema incluye los siguientes módulos principales:

### 🏢 Proveedores (Suppliers)
- Gestión completa de proveedores
- Registro de datos de contacto (email, teléfono, dirección)
- Notas adicionales
- CRUD completo (Crear, Leer, Actualizar, Eliminar)

### 🏷️ Categorías (Categories)
- Organización de productos por categorías
- Descripción detallada de cada categoría
- Sistema de clasificación flexible

### 📍 Ubicaciones (Locations)
- Gestión de almacenes y ubicaciones
- Control de capacidad
- Direcciones detalladas

### 📦 Productos (Products)
- Catálogo completo de productos
- SKU único por producto
- Control de stock con alertas de stock mínimo
- Vinculación con categorías, proveedores y ubicaciones
- Gestión de precios

### 🔄 Variantes de Productos (Product Variants)
- Variantes por producto (tallas, colores, modelos, etc.)
- SKU independiente por variante
- Control de stock y precios por variante
- Atributos personalizables

## 🚀 Tecnologías Utilizadas

- **Frontend**: React + Vite
- **Estilos**: Tailwind CSS (diseño responsivo)
- **Almacenamiento**: LocalStorage (persistencia de datos)
- **Estado**: React Hooks personalizados

## 📱 Diseño Responsivo

El sistema está completamente optimizado para:
- 💻 PC (escritorio)
- 📱 Tablets
- 📱 Smartphones

## 🛠️ Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Pasos de instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/javiercordova77/xentrastock.git
cd xentrastock
```

2. Instalar dependencias del cliente:
```bash
npm run install-client
```

## 🎮 Uso

### Modo Desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Compilar para Producción

Para construir la aplicación para producción:
```bash
npm run build
```

Los archivos compilados estarán en `client/dist`

### Vista Previa de Producción

Para previsualizar la build de producción:
```bash
npm run preview
```

## 📖 Guía de Uso

### Panel Principal
Al iniciar la aplicación, verás el panel principal con tarjetas para cada módulo:
- Cada tarjeta muestra el número de elementos registrados
- Haz clic en cualquier tarjeta para acceder al módulo

### Gestión de Datos
Cada módulo incluye:
- **Listar**: Visualiza todos los elementos en tarjetas
- **Crear**: Botón "+" para agregar nuevos elementos
- **Editar**: Icono de lápiz (✏️) en cada tarjeta
- **Eliminar**: Icono de papelera (🗑️) con confirmación

### Productos
El módulo de productos permite:
- Vincular productos con categorías, proveedores y ubicaciones
- Definir stock mínimo para alertas
- Control de precios
- SKU único

### Variantes
Las variantes permiten:
- Crear diferentes versiones de un producto
- Gestionar stock independiente por variante
- Precios diferenciados
- Atributos personalizados

## 💾 Almacenamiento de Datos

Los datos se almacenan en el navegador usando LocalStorage:
- Los datos persisten entre sesiones
- Cada módulo tiene su propia clave de almacenamiento
- Los datos incluyen marca de tiempo de creación y actualización

## 🎨 Personalización

### Colores
El sistema usa Tailwind CSS. Los colores principales pueden modificarse en:
- `client/tailwind.config.js`

### Componentes
Los componentes están en:
- `client/src/components/` - Componentes de UI
- `client/src/hooks/` - Hooks personalizados
- `client/src/services/` - Servicios de datos

## 🔒 Seguridad

- Validación de formularios en el cliente
- Confirmación antes de eliminar elementos
- Datos almacenados localmente (sin exposición a servidores externos)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👨‍💻 Autor

Javier Córdova

## 📞 Soporte

Para soporte y consultas, por favor abre un issue en el repositorio de GitHub.
