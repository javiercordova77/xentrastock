/**
 * Rutas para gestión de productos
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Validaciones
const validarProducto = [
    body('descripcion')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .isLength({ min: 2, max: 1000 })
        .withMessage('La descripción debe tener entre 2 y 1000 caracteres'),
    body('id_categoria')
        .notEmpty()
        .withMessage('La categoría es requerida')
        .isInt({ min: 1 })
        .withMessage('ID de categoría no válido'),
    body('id_proveedor')
        .notEmpty()
        .withMessage('El proveedor es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de proveedor no válido'),
    body('material')
        .optional()
        .isLength({ max: 255 })
        .withMessage('El material no puede exceder 255 caracteres'),
    body('imagen')
        .optional()
        .isLength({ max: 255 })
        .withMessage('La ruta de imagen no puede exceder 255 caracteres'),
    body('activo')
        .optional()
        .isBoolean()
        .withMessage('El campo activo debe ser un booleano')
];

// Obtener todos los productos
router.get('/', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { activo, categoria_id, proveedor_id, search, con_stock, sin_stock } = req.query;
    
    let query = `
        SELECT p.*, 
               c.nombre as categoria_nombre,
               pr.nombre as proveedor_nombre,
               COUNT(DISTINCT v.id) as total_variantes,
               COALESCE(SUM(su.cantidad_disponible), 0) as stock_total
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id
        LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
        LEFT JOIN variantes v ON p.id = v.id_producto
        LEFT JOIN stock_ubicaciones su ON v.id = su.id_variante
        WHERE 1=1
    `;
    const params = [];

    if (activo !== undefined) {
        query += ' AND p.activo = ?';
        params.push(activo === 'true' ? 1 : 0);
    }

    if (categoria_id) {
        query += ' AND p.id_categoria = ?';
        params.push(categoria_id);
    }

    if (proveedor_id) {
        query += ' AND p.id_proveedor = ?';
        params.push(proveedor_id);
    }

    if (search) {
        query += ' AND (p.descripcion LIKE ? OR p.material LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam);
    }

    query += ' GROUP BY p.id';
    
    // Filtros de stock
    if (con_stock === 'true') {
        query += ' HAVING stock_total > 0';
    } else if (sin_stock === 'true') {
        query += ' HAVING stock_total = 0';
    }

    query += ' ORDER BY p.descripcion ASC';

    const productos = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    res.json({
        success: true,
        data: productos,
        count: productos.length
    });
}));

// Obtener producto por ID
router.get('/:id', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    
    const producto = await new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, 
                   c.nombre as categoria_nombre,
                   pr.nombre as proveedor_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id
            LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
            WHERE p.id = ?
        `;
        
        db.get(query, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    
    if (!producto) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    res.json({
        success: true,
        data: producto
    });
}));

// Obtener variantes de un producto
router.get('/:id/variantes', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    const variantes = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM variantes WHERE id_producto = ? ORDER BY codigo_variante ASC', [id], (err, rows) => err ? reject(err) : resolve(rows));
    });
    res.json({ success: true, data: variantes, count: variantes.length });
}));

// Crear nuevo producto
router.post('/', validarProducto, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }

    const db = database.getDb();
    const { 
        descripcion, 
        material, 
        imagen, 
        id_categoria, 
        id_proveedor, 
        activo = 1
    } = req.body;
    
    // Verificar que existe la categoría
    const categoria = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM categorias WHERE id = ?', [id_categoria], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (!categoria) {
        return res.status(400).json({
            success: false,
            message: 'La categoría especificada no existe'
        });
    }

    // Verificar que existe el proveedor
    const proveedor = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM proveedores WHERE id = ?', [id_proveedor], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (!proveedor) {
        return res.status(400).json({
            success: false,
            message: 'El proveedor especificado no existe'
        });
    }
    
    const producto = await new Promise((resolve, reject) => {
        const query = `
            INSERT INTO productos 
            (descripcion, material, imagen, id_categoria, id_proveedor, activo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [descripcion, material, imagen, id_categoria, id_proveedor, activo], function(err) {
            if (err) {
                reject(err);
            } else {
                // Obtener el registro creado con datos de categoría y proveedor
                const getQuery = `
                    SELECT p.*, 
                           c.nombre as categoria_nombre,
                           pr.nombre as proveedor_nombre
                    FROM productos p
                    LEFT JOIN categorias c ON p.id_categoria = c.id
                    LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
                    WHERE p.id = ?
                `;
                
                db.get(getQuery, [this.lastID], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    });
    
    res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: producto
    });
}));

// Actualizar producto
router.put('/:id', validarProducto, asyncHandler(async (req, res) => {
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
    const { 
        descripcion, 
        material, 
        imagen, 
        id_categoria, 
        id_proveedor, 
        activo 
    } = req.body;
    
    // Verificar que existe la categoría
    const categoria = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM categorias WHERE id = ?', [id_categoria], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (!categoria) {
        return res.status(400).json({
            success: false,
            message: 'La categoría especificada no existe'
        });
    }

    // Verificar que existe el proveedor
    const proveedor = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM proveedores WHERE id = ?', [id_proveedor], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (!proveedor) {
        return res.status(400).json({
            success: false,
            message: 'El proveedor especificado no existe'
        });
    }
    
    const producto = await new Promise((resolve, reject) => {
        const query = `
            UPDATE productos 
            SET descripcion = ?, material = ?, imagen = ?, id_categoria = ?, id_proveedor = ?, 
                activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(query, [descripcion, material, imagen, id_categoria, id_proveedor, activo, id], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve(null);
            } else {
                // Obtener el registro actualizado con datos de categoría y proveedor
                const getQuery = `
                    SELECT p.*, 
                           c.nombre as categoria_nombre,
                           pr.nombre as proveedor_nombre
                    FROM productos p
                    LEFT JOIN categorias c ON p.id_categoria = c.id
                    LEFT JOIN proveedores pr ON p.id_proveedor = pr.id
                    WHERE p.id = ?
                `;
                
                db.get(getQuery, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            }
        });
    });
    
    if (!producto) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: producto
    });
}));

// Eliminar producto
router.delete('/:id', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { id } = req.params;
    
    const result = await new Promise((resolve, reject) => {
        db.run('DELETE FROM productos WHERE id = ?', [id], function(err) {
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
            message: 'Producto no encontrado'
        });
    }

    res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
    });
}));

module.exports = router;
