const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Listar transferencias
router.get('/', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const query = `SELECT 
		t.id,
		t.cantidad,
		t.estado,
		t.motivo,
		t.usuario,
		t.fecha_creacion,
		t.fecha_completada,
		t.created_at,
		t.updated_at,
		v.codigo_variante,
		v.medida as variante_medida,
		p.descripcion as producto_descripcion,
		uo.id as ubicacion_origen_id,
		uo.nombre as ubicacion_origen,
		ud.id as ubicacion_destino_id,
		ud.nombre as ubicacion_destino,
		c.nombre as categoria_nombre,
		pr.nombre as proveedor_nombre,
		'normal' as urgencia,
		t.usuario as usuario_nombre
	FROM transferencias t 
	LEFT JOIN variantes v ON t.id_variante = v.id
	LEFT JOIN productos p ON v.id_producto = p.id
	LEFT JOIN ubicaciones uo ON t.id_ubicacion_origen = uo.id 
	LEFT JOIN ubicaciones ud ON t.id_ubicacion_destino = ud.id
	LEFT JOIN categorias c ON p.id_categoria = c.id
	LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
	ORDER BY t.fecha_creacion DESC`;
	
	const rows = await new Promise((resolve, reject) => {
		db.all(query, [], (err, rows) => err ? reject(err) : resolve(rows));
	});
	res.json({ success: true, data: rows, count: rows.length });
}));

// Crear transferencia (pendiente)
router.post('/', [
	body('id_variante').isInt({ min: 1 }).withMessage('id_variante inválido'),
	body('id_ubicacion_origen').isInt({ min: 1 }).withMessage('id_ubicacion_origen inválido'),
	body('id_ubicacion_destino').isInt({ min: 1 }).withMessage('id_ubicacion_destino inválido'),
	body('cantidad').isInt({ min: 1 }).withMessage('cantidad inválida')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Errores de validación', errors: errors.array() });

	const db = database.getDb();
	const { id_variante, id_ubicacion_origen, id_ubicacion_destino, cantidad, motivo, usuario, urgencia } = req.body;

	const id = await new Promise((resolve, reject) => {
		const q = 'INSERT INTO transferencias (id_variante, id_ubicacion_origen, id_ubicacion_destino, cantidad, motivo, usuario) VALUES (?, ?, ?, ?, ?, ?)';
		db.run(q, [id_variante, id_ubicacion_origen, id_ubicacion_destino, cantidad, motivo || null, usuario || 'admin'], function(err) {
			if (err) reject(err); else resolve(this.lastID);
		});
	});

	// Obtener transferencia creada con datos completos
	const row = await new Promise((resolve, reject) => {
		const query = `SELECT 
			t.id,
			t.cantidad,
			t.estado,
			t.motivo,
			t.usuario,
			t.fecha_creacion,
			t.fecha_completada,
			t.created_at,
			t.updated_at,
			v.codigo_variante,
			v.medida as variante_medida,
			p.descripcion as producto_descripcion,
			uo.id as ubicacion_origen_id,
			uo.nombre as ubicacion_origen,
			ud.id as ubicacion_destino_id,
			ud.nombre as ubicacion_destino,
			c.nombre as categoria_nombre,
			pr.nombre as proveedor_nombre,
			'normal' as urgencia,
			t.usuario as usuario_nombre
		FROM transferencias t 
		LEFT JOIN variantes v ON t.id_variante = v.id
		LEFT JOIN productos p ON v.id_producto = p.id
		LEFT JOIN ubicaciones uo ON t.id_ubicacion_origen = uo.id 
		LEFT JOIN ubicaciones ud ON t.id_ubicacion_destino = ud.id
		LEFT JOIN categorias c ON p.id_categoria = c.id
		LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
		WHERE t.id = ?`;
		db.get(query, [id], (err, row) => err ? reject(err) : resolve(row));
	});
	
	res.status(201).json({ success: true, message: 'Transferencia creada', data: row });
}));

// Confirmar transferencia (ejecuta transferencia real de stock)
router.patch('/:id/confirmar', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    
    // Obtener la transferencia
    const transferencia = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM transferencias WHERE id = ? AND estado = ?', [id, 'pendiente'], (err, row) => err ? reject(err) : resolve(row));
    });
    
    if (!transferencia) {
        return res.status(404).json({ 
            success: false, 
            message: 'Transferencia no encontrada o ya procesada' 
        });
    }
    
    // Verificar stock disponible en origen
    const stockOrigen = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM stock_ubicaciones WHERE id_variante = ? AND id_ubicacion = ?', 
               [transferencia.id_variante, transferencia.id_ubicacion_origen], 
               (err, row) => err ? reject(err) : resolve(row));
    });
    
    if (!stockOrigen || stockOrigen.cantidad_disponible < transferencia.cantidad) {
        return res.status(400).json({
            success: false,
            message: `Stock insuficiente en origen. Disponible: ${stockOrigen ? stockOrigen.cantidad_disponible : 0}, Requerido: ${transferencia.cantidad}`
        });
    }
    
    // Iniciar transacción manual (SQLite)
    try {
        // 1. Reducir stock en origen
        await new Promise((resolve, reject) => {
            db.run('UPDATE stock_ubicaciones SET cantidad_disponible = cantidad_disponible - ?, updated_at = CURRENT_TIMESTAMP WHERE id_variante = ? AND id_ubicacion = ?',
                   [transferencia.cantidad, transferencia.id_variante, transferencia.id_ubicacion_origen],
                   function(err) { if (err) reject(err); else resolve(); });
        });
        
        // 2. Aumentar stock en destino (upsert)
        const stockDestino = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM stock_ubicaciones WHERE id_variante = ? AND id_ubicacion = ?',
                   [transferencia.id_variante, transferencia.id_ubicacion_destino],
                   (err, row) => err ? reject(err) : resolve(row));
        });
        
        if (stockDestino) {
            await new Promise((resolve, reject) => {
                db.run('UPDATE stock_ubicaciones SET cantidad_disponible = cantidad_disponible + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                       [transferencia.cantidad, stockDestino.id],
                       function(err) { if (err) reject(err); else resolve(); });
            });
        } else {
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO stock_ubicaciones (id_variante, id_ubicacion, cantidad_disponible) VALUES (?, ?, ?)',
                       [transferencia.id_variante, transferencia.id_ubicacion_destino, transferencia.cantidad],
                       function(err) { if (err) reject(err); else resolve(); });
            });
        }
        
        // 3. Registrar movimientos
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO movimientos (id_variante, id_ubicacion, tipo, subtipo, cantidad, motivo, referencia) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   [transferencia.id_variante, transferencia.id_ubicacion_origen, 'salida', 'transferencia_salida', -transferencia.cantidad, 
                    `Transferencia #${id}`, `TRANS-${id}`],
                   function(err) { if (err) reject(err); else resolve(); });
        });
        
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO movimientos (id_variante, id_ubicacion, tipo, subtipo, cantidad, motivo, referencia) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   [transferencia.id_variante, transferencia.id_ubicacion_destino, 'entrada', 'transferencia_entrada', transferencia.cantidad,
                    `Transferencia #${id}`, `TRANS-${id}`],
                   function(err) { if (err) reject(err); else resolve(); });
        });
        
        // 4. Marcar transferencia como completada
        await new Promise((resolve, reject) => {
            db.run('UPDATE transferencias SET estado = ?, fecha_completada = CURRENT_TIMESTAMP WHERE id = ?',
                   ['completada', id],
                   function(err) { if (err) reject(err); else resolve(); });
        });
        
        // Obtener transferencia actualizada
        const updatedTransferencia = await new Promise((resolve, reject) => {
            const query = `SELECT 
				t.id,
				t.cantidad,
				t.estado,
				t.motivo,
				t.usuario,
				t.fecha_creacion,
				t.fecha_completada,
				t.created_at,
				t.updated_at,
				v.codigo_variante,
				v.medida as variante_medida,
				p.descripcion as producto_descripcion,
				uo.id as ubicacion_origen_id,
				uo.nombre as ubicacion_origen,
				ud.id as ubicacion_destino_id,
				ud.nombre as ubicacion_destino,
				c.nombre as categoria_nombre,
				pr.nombre as proveedor_nombre,
				'normal' as urgencia,
				t.usuario as usuario_nombre
			FROM transferencias t 
			LEFT JOIN variantes v ON t.id_variante = v.id
			LEFT JOIN productos p ON v.id_producto = p.id
			LEFT JOIN ubicaciones uo ON t.id_ubicacion_origen = uo.id 
			LEFT JOIN ubicaciones ud ON t.id_ubicacion_destino = ud.id
			LEFT JOIN categorias c ON p.id_categoria = c.id
			LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
			WHERE t.id = ?`;
            db.get(query, [id], (err, row) => err ? reject(err) : resolve(row));
        });
        
        res.json({ 
            success: true, 
            message: 'Transferencia ejecutada exitosamente',
            data: updatedTransferencia 
        });
        
    } catch (error) {
        // En caso de error, SQLite maneja rollback automático en transacciones simples
        throw error;
    }
}));

// Cancelar transferencia
router.patch('/:id/cancelar', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    const { motivo } = req.body;
    
    const result = await new Promise((resolve, reject) => {
        db.run('UPDATE transferencias SET estado = ?, motivo = ? WHERE id = ? AND estado = ?', 
               ['cancelada', motivo || 'Cancelada por usuario', id, 'pendiente'], 
               function(err) { if (err) reject(err); else resolve(this.changes > 0); });
    });
    
    if (!result) {
        return res.status(404).json({ 
            success: false, 
            message: 'Transferencia no encontrada o ya procesada' 
        });
    }
    
    const row = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM transferencias WHERE id = ?', [id], (err, row) => err ? reject(err) : resolve(row));
    });
    
    res.json({ 
        success: true, 
        message: 'Transferencia cancelada', 
        data: row 
    });
}));module.exports = router;
