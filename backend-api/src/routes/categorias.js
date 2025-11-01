/**
 * Rutas para gestión de categorías
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Validaciones
const validarCategoria = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('descripcion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres')
];

// Obtener todas las categorías
router.get('/', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { activo, search } = req.query;
    
    let query = 'SELECT * FROM categorias WHERE 1=1';
    const params = [];

    if (activo !== undefined) {
        query += ' AND activo = ?';
        params.push(activo === 'true' ? 1 : 0);
    }

    if (search) {
        query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
    }

    query += ' ORDER BY nombre ASC';

    const categorias = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    res.json({
        success: true,
        data: categorias,
        count: categorias.length
    });
}));

// Obtener categoría por ID
router.get('/:id', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    
    const categoria = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    if (!categoria) {
        return res.status(404).json({
            success: false,
            message: 'Categoría no encontrada'
        });
    }

    res.json({
        success: true,
        data: categoria
    });
}));

// Crear nueva categoría
router.post('/', validarCategoria, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    const db = database.getDb();
    const { nombre, descripcion } = req.body;
    
    const categoria = await new Promise((resolve, reject) => {
        const query = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';
        
        db.run(query, [nombre, descripcion], function(err) {
            if (err) {
                reject(err);
            } else {
                // Obtener el registro creado
                db.get('SELECT * FROM categorias WHERE id = ?', [this.lastID], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    });
    
    res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: categoria
    });
}));

// Actualizar categoría
router.put('/:id', validarCategoria, asyncHandler(async (req, res) => {
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
    const { nombre, descripcion, activo } = req.body;
    
    const categoria = await new Promise((resolve, reject) => {
        const query = `
            UPDATE categorias 
            SET nombre = ?, descripcion = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(query, [nombre, descripcion, activo, id], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve(null);
            } else {
                // Obtener el registro actualizado
                db.get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    });
    
    if (!categoria) {
        return res.status(404).json({
            success: false,
            message: 'Categoría no encontrada'
        });
    }

    res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoria
    });
}));

// Eliminar categoría
router.delete('/:id', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    
    const result = await new Promise((resolve, reject) => {
        db.run('DELETE FROM categorias WHERE id = ?', [id], function(err) {
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
            message: 'Categoría no encontrada'
        });
    }

    res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
    });
}));

module.exports = router;
