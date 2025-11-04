-- Actualización de la estructura para transferencias mejoradas
-- Se agrega una tabla de cabecera de transferencias y detalles

-- Tabla de cabecera de transferencias (nueva estructura)
CREATE TABLE IF NOT EXISTS transferencias_cabecera (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_transferencia TEXT UNIQUE NOT NULL,
    id_ubicacion_origen INTEGER NOT NULL,
    id_ubicacion_destino INTEGER NOT NULL,
    fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
    fecha_procesada TEXT,
    estado TEXT DEFAULT 'pendiente', -- pendiente, en_proceso, completada, cancelada
    prioridad TEXT DEFAULT 'normal', -- baja, normal, alta, urgente
    responsable TEXT,
    motivo TEXT,
    observaciones TEXT,
    total_productos INTEGER DEFAULT 0,
    valor_total REAL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (id_ubicacion_origen) REFERENCES ubicaciones(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_ubicacion_destino) REFERENCES ubicaciones(id) ON DELETE RESTRICT
);

-- Tabla de detalles de transferencias (productos/variantes en cada transferencia)
CREATE TABLE IF NOT EXISTS transferencias_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_transferencia_cabecera INTEGER NOT NULL,
    id_variante INTEGER NOT NULL,
    cantidad_solicitada INTEGER NOT NULL,
    cantidad_procesada INTEGER DEFAULT 0,
    precio_unitario REAL,
    subtotal REAL,
    estado_detalle TEXT DEFAULT 'pendiente', -- pendiente, parcial, completado
    observaciones TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (id_transferencia_cabecera) REFERENCES transferencias_cabecera(id) ON DELETE CASCADE,
    FOREIGN KEY (id_variante) REFERENCES variantes(id) ON DELETE RESTRICT
);

-- Vista para transferencias completas con detalles
CREATE VIEW IF NOT EXISTS vw_transferencias_completas AS
SELECT 
    tc.id,
    tc.codigo_transferencia,
    tc.estado,
    tc.prioridad,
    tc.fecha_creacion,
    tc.fecha_procesada,
    tc.responsable,
    tc.motivo,
    tc.total_productos,
    tc.valor_total,
    uo.nombre AS ubicacion_origen,
    ud.nombre AS ubicacion_destino,
    COUNT(td.id) AS total_lineas,
    SUM(CASE WHEN td.estado_detalle = 'completado' THEN 1 ELSE 0 END) AS lineas_completadas
FROM transferencias_cabecera tc
LEFT JOIN ubicaciones uo ON uo.id = tc.id_ubicacion_origen
LEFT JOIN ubicaciones ud ON ud.id = tc.id_ubicacion_destino
LEFT JOIN transferencias_detalle td ON td.id_transferencia_cabecera = tc.id
GROUP BY tc.id, tc.codigo_transferencia, tc.estado, tc.prioridad, 
         tc.fecha_creacion, tc.fecha_procesada, tc.responsable, tc.motivo,
         tc.total_productos, tc.valor_total, uo.nombre, ud.nombre;