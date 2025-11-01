const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Obtener stock (listado)
router.get('/', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const { variante_id, ubicacion_id, producto_id } = req.query;
	let query = `SELECT s.*, v.codigo as variante_codigo, v.nombre as variante_nombre, p.nombre as producto_nombre, u.nombre as ubicacion_nombre
				 FROM stock s
				 LEFT JOIN variantes v ON s.variante_id = v.id
				 LEFT JOIN productos p ON v.producto_id = p.id
				 LEFT JOIN ubicaciones u ON s.ubicacion_id = u.id
				 WHERE 1=1`;
	const params = [];
	if (variante_id) { query += ' AND s.variante_id = ?'; params.push(variante_id); }
	if (ubicacion_id) { query += ' AND s.ubicacion_id = ?'; params.push(ubicacion_id); }
	if (producto_id) { query += ' AND p.id = ?'; params.push(producto_id); }
	query += ' ORDER BY p.nombre, v.nombre';

	const rows = await new Promise((resolve, reject) => {
		db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
	});

	res.json({ success: true, data: rows, count: rows.length });
}));

// Obtener stock por producto
router.get('/producto/:productoId', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { productoId } = req.params;
    const query = `SELECT s.*, v.codigo as variante_codigo, v.nombre as variante_nombre, u.nombre as ubicacion_nombre
                   FROM stock s
                   LEFT JOIN variantes v ON s.variante_id = v.id
                   LEFT JOIN ubicaciones u ON s.ubicacion_id = u.id
                   LEFT JOIN productos p ON v.producto_id = p.id
                   WHERE p.id = ?`;
    const rows = await new Promise((resolve, reject) => {
        db.all(query, [productoId], (err, rows) => err ? reject(err) : resolve(rows));
    });
    res.json({ success: true, data: rows, count: rows.length });
}));

// Obtener productos con stock bajo
router.get('/bajo-stock', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { limite = 10 } = req.query;
    
    const query = `
        SELECT 
            v.id as variante_id,
            v.codigo as variante_codigo,
            v.nombre as variante_nombre,
            p.nombre as producto_nombre,
            v.stock_minimo,
            COALESCE(SUM(s.cantidad), 0) as stock_actual,
            GROUP_CONCAT(u.nombre) as ubicaciones
        FROM variantes v
        LEFT JOIN productos p ON v.producto_id = p.id
        LEFT JOIN stock s ON v.id = s.variante_id
        LEFT JOIN ubicaciones u ON s.ubicacion_id = u.id
        WHERE v.activo = 1 AND p.activo = 1 AND v.stock_minimo > 0
        GROUP BY v.id
        HAVING stock_actual <= v.stock_minimo
        ORDER BY (stock_actual / NULLIF(v.stock_minimo, 0)) ASC
        LIMIT ?
    `;
    
    const rows = await new Promise((resolve, reject) => {
        db.all(query, [parseInt(limite)], (err, rows) => err ? reject(err) : resolve(rows));
    });
    
    res.json({ 
        success: true, 
        data: rows, 
        count: rows.length,
        message: `${rows.length} productos con stock bajo encontrados`
    });
}));

// Obtener resumen de stock por ubicación
router.get('/resumen-ubicacion', asyncHandler(async (req, res) => {
    const db = database.getDb();
    
    const query = `
        SELECT 
            u.id as ubicacion_id,
            u.nombre as ubicacion_nombre,
            u.tipo,
            COUNT(s.id) as total_items,
            SUM(s.cantidad) as cantidad_total,
            COUNT(DISTINCT v.producto_id) as productos_diferentes
        FROM ubicaciones u
        LEFT JOIN stock s ON u.id = s.ubicacion_id
        LEFT JOIN variantes v ON s.variante_id = v.id
        WHERE u.activo = 1
        GROUP BY u.id
        ORDER BY cantidad_total DESC
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

// Actualizar/Setear stock para una variante en una ubicación (upsert)

// Actualizar/Setear stock para una variante en una ubicación (upsert)
router.put('/stock', [
	body('variante_id').isInt({ min: 1 }).withMessage('variante_id inválido'),
	body('ubicacion_id').isInt({ min: 1 }).withMessage('ubicacion_id inválido'),
	body('cantidad').isInt().withMessage('cantidad inválida')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });

	const db = database.getDb();
	const { variante_id, ubicacion_id, cantidad } = req.body;

	// Upsert: intentar actualizar primero
	const updated = await new Promise((resolve, reject) => {
		db.run('UPDATE stock SET cantidad = ?, updated_at = CURRENT_TIMESTAMP WHERE variante_id = ? AND ubicacion_id = ?', [cantidad, variante_id, ubicacion_id], function(err) {
			if (err) reject(err);
			else resolve(this.changes > 0);
		});
	});

	if (!updated) {
		await new Promise((resolve, reject) => {
			db.run('INSERT INTO stock (variante_id, ubicacion_id, cantidad) VALUES (?, ?, ?)', [variante_id, ubicacion_id, cantidad], function(err) {
				if (err) reject(err);
				else resolve();
			});
		});
	}

	const row = await new Promise((resolve, reject) => {
		db.get('SELECT * FROM stock WHERE variante_id = ? AND ubicacion_id = ?', [variante_id, ubicacion_id], (err, row) => err ? reject(err) : resolve(row));
	});

	res.json({ success: true, message: 'Stock actualizado', data: row });
}));

// Obtener stock específico por variante y ubicación
router.get('/stock-ubicacion/:varianteId/:ubicacionId', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const { varianteId, ubicacionId } = req.params;
	
	const query = `SELECT 
		su.cantidad_disponible,
		v.codigo_variante,
		v.medida,
		p.descripcion as producto_descripcion,
		u.nombre as ubicacion_nombre,
		su.created_at,
		su.updated_at
	FROM stock_ubicaciones su
	LEFT JOIN variantes v ON su.id_variante = v.id
	LEFT JOIN productos p ON v.id_producto = p.id  
	LEFT JOIN ubicaciones u ON su.id_ubicacion = u.id
	WHERE su.id_variante = ? AND su.id_ubicacion = ?`;
	
	const stock = await new Promise((resolve, reject) => {
		db.get(query, [varianteId, ubicacionId], (err, row) => err ? reject(err) : resolve(row));
	});
	
	if (!stock) {
		return res.json({ 
			success: true, 
			data: { 
				cantidad_disponible: 0,
				mensaje: 'No hay stock en esta ubicación' 
			} 
		});
	}
	
	res.json({ success: true, data: stock });
}));

module.exports = router;
