-- Limpieza de datos para módulo de Movimientos y Transferencias
-- Este script elimina todos los datos de movimientos y transferencias
-- manteniendo la estructura de las tablas intacta

-- Desactivar restricciones de claves foráneas temporalmente
PRAGMA foreign_keys = OFF;

-- Limpiar tabla de transferencias
DELETE FROM transferencias;

-- Limpiar tabla de movimientos
DELETE FROM movimientos;

-- Reiniciar contadores de auto-incremento
UPDATE sqlite_sequence SET seq = 0 WHERE name = 'movimientos';
UPDATE sqlite_sequence SET seq = 0 WHERE name = 'transferencias';

-- Reactivar restricciones de claves foráneas
PRAGMA foreign_keys = ON;

-- Verificar que las tablas estén vacías
SELECT 'Movimientos restantes: ' || COUNT(*) as resultado FROM movimientos
UNION ALL
SELECT 'Transferencias restantes: ' || COUNT(*) FROM transferencias;