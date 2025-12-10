-- Datos de ejemplo para el módulo de Movimientos
-- Usando las variantes disponibles en el sistema

-- Ejemplo de INGRESO:
-- 20 unidades de Colchón Imperial 105x190
-- Código: CH-IMP-105x190
-- Ubicación: Bodega Central
-- Motivo: Inventario Inicial
-- Responsable: Juan
-- Fecha: 2/11/2025

INSERT INTO movimientos (
    id_variante, 
    id_ubicacion, 
    tipo, 
    subtipo, 
    cantidad, 
    precio_unitario, 
    motivo, 
    referencia, 
    usuario,
    fecha
) VALUES (
    -- Buscar id de variante CH-IMP-105x190
    (SELECT v.id FROM variantes v WHERE v.codigo_variante = 'CH-IMP-105x190' LIMIT 1),
    -- Buscar id de Bodega Central
    (SELECT id FROM ubicaciones WHERE nombre = 'Bodega Central' LIMIT 1),
    'entrada',
    'Inventario Inicial',
    20,
    125.50,
    'Inventario Inicial',
    'INV-INICIAL-001',
    'Juan',
    '2025-11-02 09:00:00'
);

-- Ejemplo de SALIDA:
-- 10 unidades de Almohada Memory Foam 50x70
-- Código: CH-ALM-50x70  
-- Ubicación: Bodega Central
-- Motivo: Transferencia
-- Responsable: Juan
-- Fecha: 2/11/2025

INSERT INTO movimientos (
    id_variante, 
    id_ubicacion, 
    tipo, 
    subtipo, 
    cantidad, 
    precio_unitario, 
    motivo, 
    referencia, 
    usuario,
    fecha
) VALUES (
    -- Buscar id de variante CH-ALM-50x70
    (SELECT v.id FROM variantes v WHERE v.codigo_variante = 'CH-ALM-50x70' LIMIT 1),
    -- Buscar id de Bodega Central
    (SELECT id FROM ubicaciones WHERE nombre = 'Bodega Central' LIMIT 1),
    'salida',
    'Transferencia',
    10,
    NULL,
    'Transferencia',
    'TRANS-1762206397465',
    'Juan',
    '2025-11-02 14:30:00'
);

-- Ejemplo adicional de COMPRA:
-- 15 unidades de Colchón Lamitex Supreme 2 140x190
-- Responsable: Juan
-- Fecha: 20/11/2025

INSERT INTO movimientos (
    id_variante, 
    id_ubicacion, 
    tipo, 
    subtipo, 
    cantidad, 
    precio_unitario, 
    motivo, 
    referencia, 
    usuario,
    fecha
) VALUES (
    (SELECT v.id FROM variantes v WHERE v.codigo_variante = 'LTX-SUP-140x190' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE nombre = 'Bodega Central' LIMIT 1),
    'entrada',
    'Compra',
    15,
    180.00,
    'Compra',
    'FACT-2025-0123',
    'Juan',
    '2025-11-20 10:15:00'
);

-- Ejemplo de VENTA:
-- 5 unidades de Colchón Comfort Plus 135x190
-- Responsable: Juan
-- Fecha: 20/11/2025

INSERT INTO movimientos (
    id_variante, 
    id_ubicacion, 
    tipo, 
    subtipo, 
    cantidad, 
    precio_unitario, 
    motivo, 
    referencia, 
    usuario,
    fecha
) VALUES (
    (SELECT v.id FROM variantes v WHERE v.codigo_variante = 'CH-COM-135x190' LIMIT 1),
    (SELECT id FROM ubicaciones WHERE nombre = 'Bodega Central' LIMIT 1),
    'salida',
    'Venta',
    5,
    95.75,
    'Venta',
    'VEN-2025-0089',
    'Juan',
    '2025-11-20 16:45:00'
);

-- Verificar los movimientos creados
SELECT 
    m.id,
    m.tipo,
    m.cantidad,
    p.descripcion as producto,
    v.codigo_variante,
    v.medida,
    u.nombre as ubicacion,
    m.motivo,
    m.referencia,
    m.usuario as responsable,
    m.fecha
FROM movimientos m
LEFT JOIN variantes v ON m.id_variante = v.id
LEFT JOIN productos p ON v.id_producto = p.id
LEFT JOIN ubicaciones u ON m.id_ubicacion = u.id
ORDER BY m.fecha DESC;