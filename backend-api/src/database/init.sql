-- ------------------------------------------------------------
-- XentraStock v3.0 - Esquema ColchonesW
-- Estructura de base de datos para sistema de inventarios
-- especializado en productos con variantes (colchones/almohadas)
-- ------------------------------------------------------------

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  actividad TEXT,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Productos (referencia a proveedores y categorías)
CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_categoria INTEGER NOT NULL,
  id_proveedor INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  imagen TEXT,
  material TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id) ON DELETE RESTRICT,
  UNIQUE (id_categoria, id_proveedor, descripcion)
);

-- Variantes de producto (SIN cantidades: se mueven a stock_ubicaciones)
CREATE TABLE IF NOT EXISTS variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_producto INTEGER NOT NULL,
  codigo_variante TEXT UNIQUE NOT NULL,
  medida TEXT,
  precio_venta REAL DEFAULT 0,
  precio_compra REAL DEFAULT 0,
  fecha_ingreso TEXT NOT NULL DEFAULT (datetime('now')), -- alta de la variante (UTC)
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),    -- última modificación (UTC)
  activo INTEGER NOT NULL DEFAULT 1,                     -- 1=activa, 0=deshabilitada
  FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE
);

-- Catálogo de ubicaciones (bodegas/tiendas)
CREATE TABLE IF NOT EXISTS ubicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  tipo TEXT DEFAULT 'almacen', -- almacen, tienda, showroom
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stock por ubicación (relación variante-ubicación con cantidades)
CREATE TABLE IF NOT EXISTS stock_ubicaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  id_ubicacion INTEGER NOT NULL,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0,
  cantidad_minima INTEGER NOT NULL DEFAULT 0,
  fecha_ingreso TEXT DEFAULT (datetime('now')),               -- primera entrada a esa ubicación (UTC)
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),         -- última modificación (UTC)
  FOREIGN KEY (id_variante) REFERENCES variantes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id) ON DELETE RESTRICT,
  UNIQUE (id_variante, id_ubicacion)
);

-- Colores por variante (con código de color)
CREATE TABLE IF NOT EXISTS colores_variantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  color TEXT NOT NULL,
  codigo_color TEXT NOT NULL, -- código hexadecimal del color
  imagen_color TEXT,          -- imagen específica para este color
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (id_variante) REFERENCES variantes(id) ON DELETE CASCADE,
  UNIQUE (id_variante, color, codigo_color)
);

-- Movimientos de inventario (entradas, salidas, ajustes, transferencias)
CREATE TABLE IF NOT EXISTS movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  id_ubicacion INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- entrada, salida, ajuste_positivo, ajuste_negativo, transferencia_entrada, transferencia_salida
  subtipo TEXT,       -- venta, compra, inventario_inicial, devolucion, etc.
  cantidad INTEGER NOT NULL,
  precio_unitario REAL,
  motivo TEXT,
  referencia TEXT,    -- numero de factura, orden, etc.
  usuario TEXT,
  fecha TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (id_variante) REFERENCES variantes(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id) ON DELETE RESTRICT
);

-- Transferencias entre ubicaciones
CREATE TABLE IF NOT EXISTS transferencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_variante INTEGER NOT NULL,
  id_ubicacion_origen INTEGER NOT NULL,
  id_ubicacion_destino INTEGER NOT NULL,
  cantidad INTEGER NOT NULL,
  estado TEXT DEFAULT 'pendiente', -- pendiente, completada, cancelada
  motivo TEXT,
  usuario TEXT,
  fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
  fecha_completada TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (id_variante) REFERENCES variantes(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_ubicacion_origen) REFERENCES ubicaciones(id) ON DELETE RESTRICT,
  FOREIGN KEY (id_ubicacion_destino) REFERENCES ubicaciones(id) ON DELETE RESTRICT
);

-- Índices recomendados para optimización (se crean después de las tablas)
-- Los índices se manejan en database.js para evitar errores de orden

-- Vista agregada: stock total por variante (para no romper consultas existentes)
CREATE VIEW IF NOT EXISTS vw_variantes_stock_agg AS
SELECT
  v.id               AS id_variante,
  v.codigo_variante,
  v.medida,
  v.precio_venta,
  v.precio_compra,
  p.descripcion      AS producto_descripcion,
  c.nombre           AS categoria_nombre,
  pr.nombre          AS proveedor_nombre,
  COALESCE(SUM(su.cantidad_disponible), 0) AS cantidad_disponible,
  COALESCE(MIN(su.cantidad_minima), 0)     AS cantidad_minima
FROM variantes v
INNER JOIN productos p ON p.id = v.id_producto
INNER JOIN categorias c ON c.id = p.id_categoria
INNER JOIN proveedores pr ON pr.id = p.id_proveedor
LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
GROUP BY v.id, v.codigo_variante, v.medida, v.precio_venta, v.precio_compra, 
         p.descripcion, c.nombre, pr.nombre;

-- Vista adicional: sólo variantes activas con stock
CREATE VIEW IF NOT EXISTS vw_variantes_activas_stock_agg AS
SELECT
  v.id               AS id_variante,
  v.codigo_variante,
  v.medida,
  v.precio_venta,
  v.precio_compra,
  p.descripcion      AS producto_descripcion,
  c.nombre           AS categoria_nombre,
  pr.nombre          AS proveedor_nombre,
  COALESCE(SUM(su.cantidad_disponible), 0) AS cantidad_disponible,
  COALESCE(MIN(su.cantidad_minima), 0)     AS cantidad_minima,
  GROUP_CONCAT(cv.color, ', ') AS colores_disponibles
FROM variantes v
INNER JOIN productos p ON p.id = v.id_producto
INNER JOIN categorias c ON c.id = p.id_categoria
INNER JOIN proveedores pr ON pr.id = p.id_proveedor
LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
LEFT JOIN colores_variantes cv ON cv.id_variante = v.id AND cv.activo = 1
WHERE v.activo = 1 AND p.activo = 1
GROUP BY v.id, v.codigo_variante, v.medida, v.precio_venta, v.precio_compra, 
         p.descripcion, c.nombre, pr.nombre;

-- Vista para reporte de movimientos con detalles
CREATE VIEW IF NOT EXISTS vw_movimientos_detalle AS
SELECT
  m.id,
  m.tipo,
  m.subtipo,
  m.cantidad,
  m.precio_unitario,
  m.motivo,
  m.referencia,
  m.usuario,
  m.fecha,
  v.codigo_variante,
  v.medida,
  p.descripcion AS producto_descripcion,
  u.nombre AS ubicacion_nombre,
  c.nombre AS categoria_nombre,
  pr.nombre AS proveedor_nombre
FROM movimientos m
INNER JOIN variantes v ON v.id = m.id_variante
INNER JOIN productos p ON p.id = v.id_producto
INNER JOIN ubicaciones u ON u.id = m.id_ubicacion
INNER JOIN categorias c ON c.id = p.id_categoria
INNER JOIN proveedores pr ON pr.id = p.id_proveedor;

-- ------------------------------------------------------------
-- Datos de ejemplo para ColchonesW
-- ------------------------------------------------------------

-- Proveedores
INSERT OR IGNORE INTO proveedores (id, nombre, actividad, contacto, telefono, email) VALUES 
  (1, 'Chaide', 'Venta de Colchones, Almohadas e Implementos para el descanso', 'Representante Chaide', '555-0001', 'ventas@chaide.com'),
  (2, 'Lamitex', 'Venta de Colchones, Almohadas e Implementos para el descanso', 'Representante Lamitex', '555-0002', 'pedidos@lamitex.com'),
  (3, 'Sueño Dorado', 'Fabricación de colchones premium', 'Carlos Mendoza', '555-0003', 'info@sueñodorado.com');

-- Categorías
INSERT OR IGNORE INTO categorias (id, nombre, descripcion) VALUES 
  (1, 'Colchones', 'Colchones de diferentes tipos y medidas'),
  (2, 'Almohadas', 'Almohadas y cojines para el descanso'),
  (3, 'Bases', 'Bases para colchones y somieres'),
  (4, 'Accesorios', 'Protectores, sabanas y accesorios');

-- Productos
INSERT OR IGNORE INTO productos (id, id_categoria, id_proveedor, descripcion, imagen, material) VALUES
  (1, 1, 1, 'Colchón Imperial', 'productos/colchones/chaide-imperial.jpg', 'resortes'),
  (2, 1, 1, 'Colchón Comfort Plus', 'productos/colchones/chaide-comfort.jpg', 'espuma HR'),
  (3, 2, 1, 'Almohada Memory Foam', 'productos/almohadas/chaide-memory.jpg', 'espuma viscoelástica'),
  (4, 1, 2, 'Colchón Lamitex Supreme', 'productos/colchones/lamitex-supreme.jpg', 'híbrido'),
  (5, 2, 2, 'Almohada Cervical', 'productos/almohadas/lamitex-cervical.jpg', 'látex natural');

-- Ubicaciones
INSERT OR IGNORE INTO ubicaciones (id, nombre, descripcion, tipo) VALUES
  (1, 'Bodega Central', 'Almacén principal - Matriz', 'almacen'),
  (2, 'Sala de Ventas', 'Exhibición y ventas - Local principal', 'tienda'),
  (3, 'Showroom Norte', 'Sala de exhibición - Sucursal norte', 'showroom'),
  (4, 'Bodega Sucursal', 'Almacén sucursal - Respaldo', 'almacen');

-- Variantes (sin cantidades) - activo=1 por defecto
INSERT OR IGNORE INTO variantes (id, id_producto, codigo_variante, medida, precio_venta, precio_compra, fecha_ingreso, activo) VALUES
  -- Colchón Imperial (Producto 1)
  (1, 1, 'CH-IMP-105x190', '105x190', 380.00, 280.00, '2025-01-15', 1),
  (2, 1, 'CH-IMP-135x190', '135x190', 420.00, 320.00, '2025-01-15', 1),
  (3, 1, 'CH-IMP-150x190', '150x190', 450.00, 350.00, '2025-01-15', 1),
  (4, 1, 'CH-IMP-160x200', '160x200', 480.00, 380.00, '2025-01-15', 1),
  
  -- Colchón Comfort Plus (Producto 2)
  (5, 2, 'CH-COM-135x190', '135x190', 320.00, 240.00, '2025-01-20', 1),
  (6, 2, 'CH-COM-150x190', '150x190', 350.00, 270.00, '2025-01-20', 1),
  
  -- Almohada Memory Foam (Producto 3)
  (7, 3, 'CH-ALM-50x70', '50x70', 45.00, 30.00, '2025-01-25', 1),
  (8, 3, 'CH-ALM-60x80', '60x80', 55.00, 38.00, '2025-01-25', 1),
  
  -- Colchón Lamitex Supreme (Producto 4)
  (9, 4, 'LTX-SUP-140x190', '140x190', 520.00, 420.00, '2025-02-01', 1),
  (10, 4, 'LTX-SUP-160x200', '160x200', 580.00, 480.00, '2025-02-01', 1),
  
  -- Almohada Cervical (Producto 5)
  (11, 5, 'LTX-CER-50x70', '50x70', 65.00, 45.00, '2025-02-05', 1);

-- Stock por ubicación (inventario inicial)
INSERT OR IGNORE INTO stock_ubicaciones (id_variante, id_ubicacion, cantidad_disponible, cantidad_minima, fecha_ingreso) VALUES
  -- Bodega Central
  (1, 1, 15, 3, '2025-01-15'), -- CH-IMP-105x190
  (2, 1, 12, 3, '2025-01-15'), -- CH-IMP-135x190
  (3, 1, 8, 2, '2025-01-15'),  -- CH-IMP-150x190
  (4, 1, 6, 2, '2025-01-15'),  -- CH-IMP-160x200
  (5, 1, 10, 2, '2025-01-20'), -- CH-COM-135x190
  (6, 1, 8, 2, '2025-01-20'),  -- CH-COM-150x190
  (7, 1, 25, 8, '2025-01-25'), -- CH-ALM-50x70
  (8, 1, 20, 6, '2025-01-25'), -- CH-ALM-60x80
  (9, 1, 5, 2, '2025-02-01'),  -- LTX-SUP-140x190
  (10, 1, 4, 1, '2025-02-01'), -- LTX-SUP-160x200
  (11, 1, 15, 5, '2025-02-05'), -- LTX-CER-50x70
  
  -- Sala de Ventas (stock para exhibición y venta inmediata)
  (1, 2, 3, 1, '2025-01-16'),  -- CH-IMP-105x190
  (2, 2, 4, 1, '2025-01-16'),  -- CH-IMP-135x190
  (3, 2, 2, 1, '2025-01-16'),  -- CH-IMP-150x190
  (7, 2, 8, 3, '2025-01-26'),  -- CH-ALM-50x70
  (8, 2, 6, 2, '2025-01-26'),  -- CH-ALM-60x80
  
  -- Showroom Norte
  (2, 3, 2, 1, '2025-01-17'),  -- CH-IMP-135x190
  (4, 3, 1, 1, '2025-01-17'),  -- CH-IMP-160x200
  (9, 3, 2, 1, '2025-02-02');  -- LTX-SUP-140x190

-- Colores disponibles por variante
INSERT OR IGNORE INTO colores_variantes (id_variante, color, codigo_color, imagen_color) VALUES
  -- Colchón Imperial - disponible en blanco y azul
  (1, 'Blanco', '#FFFFFF', 'productos/colores/imperial-blanco.jpg'),
  (1, 'Azul', '#4A90E2', 'productos/colores/imperial-azul.jpg'),
  (2, 'Blanco', '#FFFFFF', 'productos/colores/imperial-blanco.jpg'),
  (2, 'Azul', '#4A90E2', 'productos/colores/imperial-azul.jpg'),
  (3, 'Blanco', '#FFFFFF', 'productos/colores/imperial-blanco.jpg'),
  (3, 'Azul', '#4A90E2', 'productos/colores/imperial-azul.jpg'),
  (4, 'Blanco', '#FFFFFF', 'productos/colores/imperial-blanco.jpg'),
  (4, 'Azul', '#4A90E2', 'productos/colores/imperial-azul.jpg'),
  
  -- Colchón Comfort Plus - disponible en beige y gris
  (5, 'Beige', '#F5F5DC', 'productos/colores/comfort-beige.jpg'),
  (5, 'Gris', '#808080', 'productos/colores/comfort-gris.jpg'),
  (6, 'Beige', '#F5F5DC', 'productos/colores/comfort-beige.jpg'),
  (6, 'Gris', '#808080', 'productos/colores/comfort-gris.jpg'),
  
  -- Almohadas - disponible en blanco y beige
  (7, 'Blanco', '#FFFFFF', 'productos/colores/almohada-blanco.jpg'),
  (7, 'Beige', '#F5F5DC', 'productos/colores/almohada-beige.jpg'),
  (8, 'Blanco', '#FFFFFF', 'productos/colores/almohada-blanco.jpg'),
  (8, 'Beige', '#F5F5DC', 'productos/colores/almohada-beige.jpg'),
  
  -- Lamitex Supreme - disponible en negro y marron
  (9, 'Negro', '#000000', 'productos/colores/lamitex-negro.jpg'),
  (9, 'Marrón', '#8B4513', 'productos/colores/lamitex-marron.jpg'),
  (10, 'Negro', '#000000', 'productos/colores/lamitex-negro.jpg'),
  (10, 'Marrón', '#8B4513', 'productos/colores/lamitex-marron.jpg'),
  
  -- Almohada Cervical - solo en blanco
  (11, 'Blanco', '#FFFFFF', 'productos/colores/cervical-blanco.jpg');

-- Movimientos iniciales (inventario inicial)
INSERT OR IGNORE INTO movimientos (id_variante, id_ubicacion, tipo, subtipo, cantidad, precio_unitario, motivo, referencia, usuario, fecha) VALUES
  -- Inventario inicial en Bodega Central
  (1, 1, 'entrada', 'inventario_inicial', 15, 280.00, 'Inventario inicial sistema', 'INV-2025-001', 'admin', '2025-01-15'),
  (2, 1, 'entrada', 'inventario_inicial', 12, 320.00, 'Inventario inicial sistema', 'INV-2025-001', 'admin', '2025-01-15'),
  (3, 1, 'entrada', 'inventario_inicial', 8, 350.00, 'Inventario inicial sistema', 'INV-2025-001', 'admin', '2025-01-15'),
  (4, 1, 'entrada', 'inventario_inicial', 6, 380.00, 'Inventario inicial sistema', 'INV-2025-001', 'admin', '2025-01-15'),
  (5, 1, 'entrada', 'inventario_inicial', 10, 240.00, 'Inventario inicial sistema', 'INV-2025-002', 'admin', '2025-01-20'),
  (6, 1, 'entrada', 'inventario_inicial', 8, 270.00, 'Inventario inicial sistema', 'INV-2025-002', 'admin', '2025-01-20'),
  (7, 1, 'entrada', 'inventario_inicial', 25, 30.00, 'Inventario inicial sistema', 'INV-2025-003', 'admin', '2025-01-25'),
  (8, 1, 'entrada', 'inventario_inicial', 20, 38.00, 'Inventario inicial sistema', 'INV-2025-003', 'admin', '2025-01-25'),
  (9, 1, 'entrada', 'inventario_inicial', 5, 420.00, 'Inventario inicial sistema', 'INV-2025-004', 'admin', '2025-02-01'),
  (10, 1, 'entrada', 'inventario_inicial', 4, 480.00, 'Inventario inicial sistema', 'INV-2025-004', 'admin', '2025-02-01'),
  (11, 1, 'entrada', 'inventario_inicial', 15, 45.00, 'Inventario inicial sistema', 'INV-2025-005', 'admin', '2025-02-05');