const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const validarVariante = [
	body('producto_id').notEmpty().isInt({ min: 1 }).withMessage('producto_id inválido'),
	body('codigo').notEmpty().isLength({ min: 1 }).withMessage('codigo es requerido'),
	body('nombre').notEmpty().isLength({ min: 1 }).withMessage('nombre es requerido')
];

// Listar variantes (con opción de filtrar por producto_id)
router.get('/', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const { producto_id, search } = req.query;
	let query = `SELECT v.*, p.nombre as producto_nombre FROM variantes v LEFT JOIN productos p ON v.producto_id = p.id WHERE 1=1`;
	const params = [];
	if (producto_id) {
		query += ' AND v.producto_id = ?';
		params.push(producto_id);
	}
	if (search) {
		query += ' AND (v.nombre LIKE ? OR v.codigo LIKE ?)';
		const s = `%${search}%`;
		params.push(s, s);
	}
	query += ' ORDER BY v.nombre ASC';

	const variantes = await new Promise((resolve, reject) => {
		db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
	});

	res.json({ success: true, data: variantes, count: variantes.length });
}));

// Obtener variante por id
router.get('/:id', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const { id } = req.params;
	const variante = await new Promise((resolve, reject) => {
		db.get('SELECT v.*, p.nombre as producto_nombre FROM variantes v LEFT JOIN productos p ON v.producto_id = p.id WHERE v.id = ?', [id], (err, row) => err ? reject(err) : resolve(row));
	});
	if (!variante) return res.status(404).json({ success: false, message: 'Variante no encontrada' });
	res.json({ success: true, data: variante });
}));

// Crear variante
router.post('/', validarVariante, asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });

	const db = database.getDb();
	const { producto_id, codigo, nombre, color, talla, precio_compra, precio_venta, stock_minimo } = req.body;

	// Verificar producto
	const producto = await new Promise((resolve, reject) => {
		db.get('SELECT id FROM productos WHERE id = ?', [producto_id], (err, row) => err ? reject(err) : resolve(row));
	});
	if (!producto) return res.status(400).json({ success: false, message: 'Producto no encontrado' });

	// Verificar código único
	const existe = await new Promise((resolve, reject) => {
		db.get('SELECT id FROM variantes WHERE codigo = ?', [codigo], (err, row) => err ? reject(err) : resolve(row));
	});
	if (existe) return res.status(409).json({ success: false, message: 'Código de variante ya existe' });

	const variante = await new Promise((resolve, reject) => {
		const q = `INSERT INTO variantes (producto_id, codigo, nombre, color, talla, precio_compra, precio_venta, stock_minimo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
		db.run(q, [producto_id, codigo, nombre, color, talla, precio_compra || 0, precio_venta || 0, stock_minimo || 0], function(err) {
			if (err) reject(err);
			else db.get('SELECT v.*, p.nombre as producto_nombre FROM variantes v LEFT JOIN productos p ON v.producto_id = p.id WHERE v.id = ?', [this.lastID], (err2, row) => err2 ? reject(err2) : resolve(row));
		});
	});

	res.status(201).json({ success: true, message: 'Variante creada', data: variante });
}));

// Actualizar variante
router.put('/:id', validarVariante, asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });

	const db = database.getDb();
	const { id } = req.params;
	const { producto_id, codigo, nombre, color, talla, precio_compra, precio_venta, stock_minimo, activo } = req.body;

	// Verificar existencia
	const existente = await new Promise((resolve, reject) => {
		db.get('SELECT id FROM variantes WHERE id = ?', [id], (err, row) => err ? reject(err) : resolve(row));
	});
	if (!existente) return res.status(404).json({ success: false, message: 'Variante no encontrada' });

	// Validar producto
	const producto = await new Promise((resolve, reject) => {
		db.get('SELECT id FROM productos WHERE id = ?', [producto_id], (err, row) => err ? reject(err) : resolve(row));
	});
	if (!producto) return res.status(400).json({ success: false, message: 'Producto no encontrado' });

	// Verificar código único en otro registro
	const existeCodigo = await new Promise((resolve, reject) => {
		db.get('SELECT id FROM variantes WHERE codigo = ? AND id != ?', [codigo, id], (err, row) => err ? reject(err) : resolve(row));
	});
	if (existeCodigo) return res.status(409).json({ success: false, message: 'Código ya usado por otra variante' });

	const variante = await new Promise((resolve, reject) => {
		const q = `UPDATE variantes SET producto_id = ?, codigo = ?, nombre = ?, color = ?, talla = ?, precio_compra = ?, precio_venta = ?, stock_minimo = ?, activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
		db.run(q, [producto_id, codigo, nombre, color, talla, precio_compra || 0, precio_venta || 0, stock_minimo || 0, activo !== undefined ? activo : 1, id], function(err) {
			if (err) reject(err);
			else if (this.changes === 0) resolve(null);
			else db.get('SELECT v.*, p.nombre as producto_nombre FROM variantes v LEFT JOIN productos p ON v.producto_id = p.id WHERE v.id = ?', [id], (err2, row) => err2 ? reject(err2) : resolve(row));
		});
	});

	if (!variante) return res.status(404).json({ success: false, message: 'Variante no encontrada' });
	res.json({ success: true, message: 'Variante actualizada', data: variante });
}));

// Eliminar variante
router.delete('/:id', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const { id } = req.params;
	const result = await new Promise((resolve, reject) => {
		db.run('DELETE FROM variantes WHERE id = ?', [id], function(err) {
			if (err) reject(err);
			else resolve(this.changes > 0);
		});
	});
	if (!result) return res.status(404).json({ success: false, message: 'Variante no encontrada' });
	res.json({ success: true, message: 'Variante eliminada' });
}));

module.exports = router;
