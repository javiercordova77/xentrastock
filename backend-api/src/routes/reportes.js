const express = require('express');
const router = express.Router();
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Endpoint resumen: devuelve conteos básicos
router.get('/resumen', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const counts = {};
    counts.categorias = await new Promise((resolve, reject) => db.get('SELECT COUNT(*) as c FROM categorias', (err, row) => err ? reject(err) : resolve(row.c)));
    counts.proveedores = await new Promise((resolve, reject) => db.get('SELECT COUNT(*) as c FROM proveedores', (err, row) => err ? reject(err) : resolve(row.c)));
    counts.productos = await new Promise((resolve, reject) => db.get('SELECT COUNT(*) as c FROM productos', (err, row) => err ? reject(err) : resolve(row.c)));
    counts.variantes = await new Promise((resolve, reject) => db.get('SELECT COUNT(*) as c FROM variantes', (err, row) => err ? reject(err) : resolve(row.c)));
    counts.ubicaciones = await new Promise((resolve, reject) => db.get('SELECT COUNT(*) as c FROM ubicaciones', (err, row) => err ? reject(err) : resolve(row.c)));
    
    // Resumen de stock total
    const stockTotal = await new Promise((resolve, reject) => {
        db.get('SELECT SUM(cantidad) as total FROM stock', (err, row) => err ? reject(err) : resolve(row.total || 0));
    });
    counts.stock_total = stockTotal;

    res.json({ success: true, data: counts });
}));

// Reporte de productos con stock bajo
router.get('/stock-bajo', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { limite = 5 } = req.query;
    
    const query = `
        SELECT 
            v.id as variante_id,
            v.codigo as variante_codigo,
            v.nombre as variante_nombre,
            p.nombre as producto_nombre,
            v.stock_minimo,
            COALESCE(SUM(s.cantidad), 0) as stock_actual,
            u.nombre as ubicacion_nombre
        FROM variantes v
        LEFT JOIN productos p ON v.producto_id = p.id
        LEFT JOIN stock s ON v.id = s.variante_id
        LEFT JOIN ubicaciones u ON s.ubicacion_id = u.id
        WHERE v.activo = 1 AND p.activo = 1
        GROUP BY v.id, u.id
        HAVING stock_actual <= v.stock_minimo AND v.stock_minimo > 0
        ORDER BY stock_actual ASC
        LIMIT ?
    `;
    
    const rows = await new Promise((resolve, reject) => {
        db.all(query, [parseInt(limite)], (err, rows) => err ? reject(err) : resolve(rows));
    });
    
    res.json({ 
        success: true, 
        data: rows, 
        count: rows.length,
        message: `Productos con stock bajo (${rows.length} encontrados)`
    });
}));

// Reporte de movimientos por período
router.get('/movimientos-periodo', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { fecha_inicio, fecha_fin, tipo } = req.query;
    
    if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
            success: false,
            message: 'Se requieren fecha_inicio y fecha_fin (formato: YYYY-MM-DD)'
        });
    }
    
    let query = `
        SELECT 
            m.tipo,
            m.subtipo,
            COUNT(*) as cantidad_movimientos,
            SUM(ABS(m.cantidad)) as total_unidades,
            AVG(m.precio_unitario) as precio_promedio,
            DATE(m.fecha) as fecha
        FROM movimientos m
        WHERE DATE(m.fecha) BETWEEN ? AND ?
    `;
    const params = [fecha_inicio, fecha_fin];
    
    if (tipo) {
        query += ' AND m.tipo = ?';
        params.push(tipo);
    }
    
    query += ' GROUP BY m.tipo, m.subtipo, DATE(m.fecha) ORDER BY m.fecha DESC';
    
    const rows = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
    });
    
    res.json({ 
        success: true, 
        data: rows, 
        count: rows.length,
        periodo: { inicio: fecha_inicio, fin: fecha_fin },
        filtro_tipo: tipo || 'todos'
    });
}));

// Reporte de productos más movidos
router.get('/productos-populares', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { limite = 10, dias = 30 } = req.query;
    
    const query = `
        SELECT 
            p.id as producto_id,
            p.nombre as producto_nombre,
            p.sku,
            c.nombre as categoria_nombre,
            COUNT(m.id) as total_movimientos,
            SUM(ABS(m.cantidad)) as total_unidades_movidas,
            MAX(m.fecha) as ultimo_movimiento
        FROM productos p
        LEFT JOIN variantes v ON p.id = v.producto_id
        LEFT JOIN movimientos m ON v.id = m.variante_id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE m.fecha >= datetime('now', '-${dias} days')
        GROUP BY p.id
        ORDER BY total_movimientos DESC, total_unidades_movidas DESC
        LIMIT ?
    `;
    
    const rows = await new Promise((resolve, reject) => {
        db.all(query, [parseInt(limite)], (err, rows) => err ? reject(err) : resolve(rows));
    });
    
    res.json({ 
        success: true, 
        data: rows, 
        count: rows.length,
        periodo_dias: parseInt(dias),
        message: `Top ${rows.length} productos más movidos en los últimos ${dias} días`
    });
}));

// Reporte de inventario por ubicación
router.get('/inventario-ubicacion', asyncHandler(async (req, res) => {
    const db = database.getDb();
    
    const query = `
        SELECT 
            u.id as ubicacion_id,
            u.nombre as ubicacion_nombre,
            u.tipo as ubicacion_tipo,
            COUNT(DISTINCT v.producto_id) as productos_diferentes,
            COUNT(s.id) as variantes_con_stock,
            SUM(s.cantidad) as stock_total,
            AVG(s.cantidad) as stock_promedio
        FROM ubicaciones u
        LEFT JOIN stock s ON u.id = s.ubicacion_id
        LEFT JOIN variantes v ON s.variante_id = v.id
        WHERE u.activo = 1
        GROUP BY u.id
        ORDER BY stock_total DESC
    `;
    
    const rows = await new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => err ? reject(err) : resolve(rows));
    });
    
    res.json({ 
        success: true, 
        data: rows, 
        count: rows.length,
        message: 'Resumen de inventario por ubicación'
    });
}));

// Lista de todos los endpoints disponibles
router.get('/', (req, res) => {
    const endpoints = [
        { path: '/reportes/resumen', description: 'Conteos generales del sistema' },
        { path: '/reportes/stock-bajo', description: 'Productos con stock menor al mínimo', params: 'limite=5' },
        { path: '/reportes/movimientos-periodo', description: 'Movimientos por período', params: 'fecha_inicio, fecha_fin, tipo(opcional)' },
        { path: '/reportes/productos-populares', description: 'Productos más movidos', params: 'limite=10, dias=30' },
        { path: '/reportes/inventario-ubicacion', description: 'Resumen de stock por ubicación' }
    ];
    
    res.json({ 
        success: true, 
        message: 'Endpoints de reportes disponibles',
        data: endpoints,
        count: endpoints.length
    });
});

module.exports = router;