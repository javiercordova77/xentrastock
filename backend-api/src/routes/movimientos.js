const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Motivos válidos para cada tipo de movimiento
const MOTIVOS_MOVIMIENTOS = {
	entrada: ['Inventario Inicial', 'Compra', 'Devolución', 'Ajuste'],
	salida: ['Venta', 'Devolución', 'Ajuste'],
	ajuste: ['Ajuste Manual', 'Corrección Inventario', 'Merma', 'Daño']
};

// Endpoint para obtener motivos válidos
router.get('/motivos/:tipo', (req, res) => {
	const { tipo } = req.params;
	const motivos = MOTIVOS_MOVIMIENTOS[tipo];
	
	if (!motivos) {
		return res.status(400).json({ 
			success: false, 
			message: 'Tipo de movimiento inválido' 
		});
	}
	
	res.json({ 
		success: true, 
		data: motivos 
	});
});

// Listar movimientos con filtros
router.get('/', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const { id_variante, id_ubicacion, tipo, desde, hasta } = req.query;
	let query = `SELECT 
		m.id,
		m.id_ubicacion,
		m.tipo,
		m.subtipo,
		m.cantidad,
		m.precio_unitario,
		m.motivo,
		m.referencia,
		m.usuario,
		m.fecha,
		m.created_at,
		v.codigo_variante,
		v.medida as variante_medida,
		p.descripcion as producto_descripcion,
		u.nombre as ubicacion_nombre,
		c.nombre as categoria_nombre,
		pr.nombre as proveedor_nombre,
		(m.cantidad * COALESCE(m.precio_unitario, 0)) as valor_total,
		'completado' as estado,
		m.usuario as usuario_nombre
	FROM movimientos m
	LEFT JOIN variantes v ON m.id_variante = v.id
	LEFT JOIN productos p ON v.id_producto = p.id
	LEFT JOIN ubicaciones u ON m.id_ubicacion = u.id
	LEFT JOIN categorias c ON p.id_categoria = c.id
	LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
	WHERE 1=1`;
	const params = [];
	if (id_variante) { query += ' AND m.id_variante = ?'; params.push(id_variante); }
	if (id_ubicacion) { query += ' AND m.id_ubicacion = ?'; params.push(id_ubicacion); }
	if (tipo) { query += ' AND m.tipo = ?'; params.push(tipo); }
	if (desde) { query += ' AND m.fecha >= ?'; params.push(desde); }
	if (hasta) { query += ' AND m.fecha <= ?'; params.push(hasta); }
	query += ' ORDER BY m.fecha DESC';

	const rows = await new Promise((resolve, reject) => {
		db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
	});
	res.json({ success: true, data: rows, count: rows.length });
}));

// Crear movimiento (entrada/salida/ajuste)
router.post('/', [
	body('id_variante').isInt({ min: 1 }).withMessage('id_variante inválido'),
	body('id_ubicacion').isInt({ min: 1 }).withMessage('id_ubicacion inválido'),
	body('tipo').isIn(['entrada', 'salida', 'ajuste']).withMessage('tipo inválido'),
	body('cantidad').isInt().withMessage('cantidad inválida')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });

	const db = database.getDb();
	const { id_variante, id_ubicacion, tipo, cantidad, precio_unitario, motivo, referencia, usuario } = req.body;

	// Verificar variante y ubicacion
	const variante = await new Promise((resolve, reject) => db.get('SELECT id FROM variantes WHERE id = ?', [id_variante], (err, row) => err ? reject(err) : resolve(row)));
	const ubicacion = await new Promise((resolve, reject) => db.get('SELECT id FROM ubicaciones WHERE id = ?', [id_ubicacion], (err, row) => err ? reject(err) : resolve(row)));
	if (!variante || !ubicacion) return res.status(400).json({ success: false, message: 'Variante o ubicación no encontrados' });

	// Ajustar stock (upsert) según tipo
	const current = await new Promise((resolve, reject) => db.get('SELECT * FROM stock_ubicaciones WHERE id_variante = ? AND id_ubicacion = ?', [id_variante, id_ubicacion], (err, row) => err ? reject(err) : resolve(row)));
	let nuevaCantidad = (current ? current.cantidad_disponible : 0);
	if (tipo === 'entrada') nuevaCantidad += Math.abs(cantidad);
	else if (tipo === 'salida') nuevaCantidad -= Math.abs(cantidad);
	else if (tipo === 'ajuste') nuevaCantidad = cantidad;

	if (nuevaCantidad < 0) return res.status(400).json({ success: false, message: 'Stock insuficiente para la operación' });

	// Verificar movimientos duplicados recientes (últimos 5 segundos)
	const recentDuplicate = await new Promise((resolve, reject) => {
		const query = `SELECT id FROM movimientos 
			WHERE id_variante = ? AND id_ubicacion = ? AND tipo = ? AND cantidad = ? AND usuario = ? 
			AND datetime(created_at) > datetime('now', '-5 seconds')
			LIMIT 1`;
		db.get(query, [id_variante, id_ubicacion, tipo, cantidad, usuario || 'admin'], (err, row) => {
			if (err) reject(err);
			else resolve(row);
		});
	});

	if (recentDuplicate) {
		return res.status(409).json({ 
			success: false, 
			message: 'Movimiento duplicado detectado. Espere unos segundos antes de registrar el mismo movimiento.' 
		});
	}

	// Upsert stock
	if (current) {
		await new Promise((resolve, reject) => db.run('UPDATE stock_ubicaciones SET cantidad_disponible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [nuevaCantidad, current.id], function(err) { if (err) reject(err); else resolve(); }));
	} else {
		await new Promise((resolve, reject) => db.run('INSERT INTO stock_ubicaciones (id_variante, id_ubicacion, cantidad_disponible) VALUES (?, ?, ?)', [id_variante, id_ubicacion, nuevaCantidad], function(err) { if (err) reject(err); else resolve(); }));
	}

	// Insertar movimiento
	const movimientoId = await new Promise((resolve, reject) => {
		const q = `INSERT INTO movimientos (id_variante, id_ubicacion, tipo, subtipo, cantidad, precio_unitario, motivo, referencia, usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		const subtipo = motivo || tipo; // usar motivo como subtipo si está disponible
		db.run(q, [id_variante, id_ubicacion, tipo, subtipo, cantidad, precio_unitario || null, motivo || null, referencia || null, usuario || 'admin'], function(err) { if (err) reject(err); else resolve(this.lastID); });
	});

	// Obtener movimiento creado con datos completos
	const mov = await new Promise((resolve, reject) => {
		const query = `SELECT 
			m.id,
			m.tipo,
			m.subtipo,
			m.cantidad,
			m.precio_unitario,
			m.motivo,
			m.referencia,
			m.usuario,
			m.fecha,
			m.created_at,
			v.codigo_variante,
			v.medida as variante_medida,
			p.descripcion as producto_descripcion,
			u.nombre as ubicacion_nombre,
			c.nombre as categoria_nombre,
			pr.nombre as proveedor_nombre,
			(m.cantidad * COALESCE(m.precio_unitario, 0)) as valor_total,
			'completado' as estado,
			m.usuario as usuario_nombre
		FROM movimientos m
		LEFT JOIN variantes v ON m.id_variante = v.id
		LEFT JOIN productos p ON v.id_producto = p.id
		LEFT JOIN ubicaciones u ON m.id_ubicacion = u.id
		LEFT JOIN categorias c ON p.id_categoria = c.id
		LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
		WHERE m.id = ?`;
		db.get(query, [movimientoId], (err, row) => err ? reject(err) : resolve(row));
	});
	
	res.status(201).json({ success: true, message: 'Movimiento registrado', data: mov });
}));

module.exports = router;
