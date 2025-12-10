# 📁 Assets - Recursos Gráficos XentraStock

## 📂 Estructura de Carpetas

```
assets/
├── 🖼️  images/                 # Imágenes principales
│   ├── 🏢 logos/              # Logos de la aplicación
│   │   ├── logo-main.svg      # Logo principal (vectorial)
│   │   ├── logo-main.png      # Logo principal (raster)
│   │   ├── logo-white.svg     # Logo blanco para fondos oscuros
│   │   ├── logo-horizontal.svg # Logo horizontal
│   │   ├── favicon.ico        # Favicon del navegador
│   │   └── favicon.png        # Favicon PNG
│   │
│   ├── 🎯 icons/              # Iconos personalizados
│   │   ├── dashboard/         # Iconos específicos del dashboard
│   │   ├── products/          # Iconos de productos
│   │   ├── inventory/         # Iconos de inventario
│   │   └── ui/                # Iconos de interfaz
│   │
│   ├── 🌅 backgrounds/        # Fondos e imágenes de fondo
│   │   ├── login-bg.jpg       # Fondo de login
│   │   ├── dashboard-bg.jpg   # Fondo del dashboard
│   │   └── patterns/          # Patrones de fondo
│   │
│   ├── 📦 products/           # Imágenes de productos
│   │   ├── colchones/         # Imágenes de colchones
│   │   ├── almohadas/         # Imágenes de almohadas
│   │   ├── bases/             # Imágenes de bases
│   │   └── thumbnails/        # Miniaturas
│   │
│   └── 🎨 ui/                 # Elementos de interfaz
│       ├── placeholders/      # Imágenes placeholder
│       ├── avatars/           # Avatares de usuario
│       └── decorative/       # Elementos decorativos
│
├── 🔤 fonts/                  # Fuentes tipográficas
│   ├── Inter/                 # Fuente principal
│   └── custom/                # Fuentes personalizadas
│
└── 📄 documents/              # Documentos y manuales
    ├── brand-guidelines.pdf   # Guía de marca
    ├── color-palette.pdf      # Paleta de colores
    └── style-guide.pdf        # Guía de estilo
```

## 🎨 Especificaciones Recomendadas

### **Logos:**
- **Formato:** SVG (preferido) + PNG de respaldo
- **Resoluciones PNG:** 256x256, 512x512, 1024x1024
- **Colores:** Versión principal, blanca, negra
- **Formatos:** Horizontal, vertical, isotipo

### **Iconos:**
- **Formato:** SVG (vectorial)
- **Tamaños:** 16x16, 24x24, 32x32, 48x48
- **Estilo:** Línea, relleno, outline

### **Imágenes de productos:**
- **Formato:** WebP (moderno) + JPG (respaldo)
- **Resoluciones:** 
  - Miniatura: 150x150
  - Mediana: 400x400
  - Grande: 800x800
- **Optimización:** Compresión 80-90%

### **Fondos:**
- **Formato:** WebP + JPG
- **Resoluciones:** 1920x1080, 2560x1440
- **Peso:** < 500KB optimizado

## 🔗 Uso en el Código

### **HTML:**
```html
<!-- Logo principal -->
<img src="/assets/images/logos/logo-main.svg" alt="XentraStock" />

<!-- Ícono personalizado -->
<img src="/assets/images/icons/dashboard/inventory.svg" alt="Inventario" />

<!-- Imagen de producto -->
<img src="/assets/images/products/colchones/imperial-135x190.webp" alt="Colchón Imperial" />
```

### **CSS:**
```css
/* Fondo de login */
.login-page {
    background-image: url('/assets/images/backgrounds/login-bg.jpg');
}

/* Favicon */
<link rel="icon" href="/assets/images/logos/favicon.ico">
```

### **JavaScript:**
```javascript
// Cargar imagen dinámicamente
const logoUrl = '/assets/images/logos/logo-main.svg';
document.getElementById('logo').src = logoUrl;
```

## 📝 Convenciones de Nomenclatura

### **Archivos de imagen:**
- `logo-main.svg` - Logo principal
- `icon-dashboard-active.svg` - Ícono dashboard activo
- `product-colchon-imperial-thumb.webp` - Miniatura producto
- `bg-login-blur.jpg` - Fondo login con blur

### **Carpetas:**
- `snake_case` para nombres de carpetas
- Descriptivos y específicos
- Máximo 2 niveles de profundidad

## 🚀 Optimización

1. **Imágenes:**
   - Usar WebP cuando sea posible
   - Compresión optimizada
   - Lazy loading para productos

2. **SVG:**
   - Optimizar con SVGO
   - Usar viewBox apropiado
   - Inline para iconos pequeños

3. **Caching:**
   - Cache headers apropiados
   - Versionado de assets
   - CDN para imágenes grandes

## 📱 Responsive

- **Mobile first**: Optimizar para móviles
- **Diferentes densidades**: @1x, @2x, @3x
- **Art direction**: Diferentes crops para diferentes tamaños

---

💡 **Tip:** Mantén todas las imágenes optimizadas y en múltiples formatos para mejor compatibilidad y rendimiento.