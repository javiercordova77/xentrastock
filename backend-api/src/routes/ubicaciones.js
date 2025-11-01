/**
 * Rutas para gestión de ubicaciones
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Validaciones
const validarUbicacion = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('descripcion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    body('tipo')
        .optional()
        .isIn(['almacen', 'tienda', 'showroom', 'deposito'])
        .withMessage('Tipo de ubicación no válido')
];

// Obtener todas las ubicaciones
router.get('/', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { activo, tipo, search } = req.query;
    
    let query = 'SELECT * FROM ubicaciones WHERE 1=1';
    const params = [];

    if (activo !== undefined) {
        query += ' AND activo = ?';
        params.push(activo === 'true' ? 1 : 0);
    }

    if (tipo) {
        query += ' AND tipo = ?';
        params.push(tipo);
    }

    if (search) {
        query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
    }

    query += ' ORDER BY nombre ASC';

    const ubicaciones = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    res.json({
        success: true,
        data: ubicaciones,
        count: ubicaciones.length
    });
}));

// Obtener ubicación por ID
router.get('/:id', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    
    const ubicacion = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM ubicaciones WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    if (!ubicacion) {
        return res.status(404).json({
            success: false,
            message: 'Ubicación no encontrada'
        });
    }

    res.json({
        success: true,
        data: ubicacion
    });
}));

// Crear nueva ubicación
router.post('/', validarUbicacion, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    const db = database.getDb();
    const { nombre, descripcion, tipo = 'almacen' } = req.body;
    
    const ubicacion = await new Promise((resolve, reject) => {
        const query = 'INSERT INTO ubicaciones (nombre, descripcion, tipo) VALUES (?, ?, ?)';
        
        db.run(query, [nombre, descripcion, tipo], function(err) {
            if (err) {
                reject(err);
            } else {
                // Obtener el registro creado
                db.get('SELECT * FROM ubicaciones WHERE id = ?', [this.lastID], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    });
    
    res.status(201).json({
        success: true,
        message: 'Ubicación creada exitosamente',
        data: ubicacion
    });
}));

// Actualizar ubicación
router.put('/:id', validarUbicacion, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    const db = database.getDb();
    const { id } = req.params;
    const { nombre, descripcion, tipo, activo } = req.body;
    
    const ubicacion = await new Promise((resolve, reject) => {
        const query = `
            UPDATE ubicaciones 
            SET nombre = ?, descripcion = ?, tipo = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(query, [nombre, descripcion, tipo, activo, id], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve(null);
            } else {
                // Obtener el registro actualizado
                db.get('SELECT * FROM ubicaciones WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    });
    
    if (!ubicacion) {
        return res.status(404).json({
            success: false,
            message: 'Ubicación no encontrada'
        });
    }

    res.json({
        success: true,
        message: 'Ubicación actualizada exitosamente',
        data: ubicacion
    });
}));

// Eliminar ubicación
router.delete('/:id', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    
    const result = await new Promise((resolve, reject) => {
        db.run('DELETE FROM ubicaciones WHERE id = ?', [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
    
    if (!result) {
        return res.status(404).json({
            success: false,
            message: 'Ubicación no encontrada'
        });
    }

    res.json({
        success: true,
        message: 'Ubicación eliminada exitosamente'
    });
}));

module.exports = router;
