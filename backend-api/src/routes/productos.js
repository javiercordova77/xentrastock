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
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('sku')
        .notEmpty()
        .withMessage('El SKU es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El SKU debe tener entre 2 y 50 caracteres'),
    body('categoria_id')
        .notEmpty()
        .withMessage('La categoría es requerida')
        .isInt({ min: 1 })
        .withMessage('ID de categoría no válido'),
    body('proveedor_id')
        .notEmpty()
        .withMessage('El proveedor es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de proveedor no válido'),
    body('precio')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    body('stock_minimo')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero positivo'),
    body('stock_maximo')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock máximo debe ser un número entero positivo'),
    body('descripcion')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede exceder 1000 caracteres')
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
               COALESCE(SUM(s.cantidad), 0) as stock_total
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        LEFT JOIN variantes v ON p.id = v.producto_id
        LEFT JOIN stock s ON v.id = s.variante_id
        WHERE 1=1
    `;
    const params = [];

    if (activo !== undefined) {
        query += ' AND p.activo = ?';
        params.push(activo === 'true' ? 1 : 0);
    }

    if (categoria_id) {
        query += ' AND p.categoria_id = ?';
        params.push(categoria_id);
    }

    if (proveedor_id) {
        query += ' AND p.proveedor_id = ?';
        params.push(proveedor_id);
    }

    if (search) {
        query += ' AND (p.nombre LIKE ? OR p.sku LIKE ? OR p.descripcion LIKE ?)';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    query += ' GROUP BY p.id';
    
    // Filtros de stock
    if (con_stock === 'true') {
        query += ' HAVING stock_total > 0';
    } else if (sin_stock === 'true') {
        query += ' HAVING stock_total = 0';
    }

    query += ' ORDER BY p.nombre ASC';

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
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
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
        db.all('SELECT * FROM variantes WHERE producto_id = ? ORDER BY nombre ASC', [id], (err, rows) => err ? reject(err) : resolve(rows));
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
        nombre, 
        sku, 
        descripcion, 
        categoria_id, 
        proveedor_id, 
        precio, 
        stock_minimo, 
        stock_maximo 
    } = req.body;
    
    // Verificar que el SKU no existe
    const existeSkU = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM productos WHERE sku = ?', [sku], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (existeSkU) {
        return res.status(409).json({
            success: false,
            message: 'El SKU ya existe'
        });
    }

    // Verificar que existe la categoría
    const categoria = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM categorias WHERE id = ?', [categoria_id], (err, row) => {
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
        db.get('SELECT id FROM proveedores WHERE id = ?', [proveedor_id], (err, row) => {
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
            (nombre, sku, descripcion, categoria_id, proveedor_id, precio, stock_minimo, stock_maximo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [nombre, sku, descripcion, categoria_id, proveedor_id, precio, stock_minimo, stock_maximo], function(err) {
            if (err) {
                reject(err);
            } else {
                // Obtener el registro creado con datos de categoría y proveedor
                const getQuery = `
                    SELECT p.*, 
                           c.nombre as categoria_nombre,
                           pr.nombre as proveedor_nombre
                    FROM productos p
                    LEFT JOIN categorias c ON p.categoria_id = c.id
                    LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
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
        nombre, 
        sku, 
        descripcion, 
        categoria_id, 
        proveedor_id, 
        precio, 
        stock_minimo, 
        stock_maximo, 
        activo 
    } = req.body;
    
    // Verificar que el SKU no existe en otro producto
    const existeSkU = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM productos WHERE sku = ? AND id != ?', [sku, id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (existeSkU) {
        return res.status(409).json({
            success: false,
            message: 'El SKU ya existe en otro producto'
        });
    }

    // Verificar que existe la categoría
    const categoria = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM categorias WHERE id = ?', [categoria_id], (err, row) => {
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
        db.get('SELECT id FROM proveedores WHERE id = ?', [proveedor_id], (err, row) => {
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
            SET nombre = ?, sku = ?, descripcion = ?, categoria_id = ?, proveedor_id = ?, 
                precio = ?, stock_minimo = ?, stock_maximo = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        db.run(query, [nombre, sku, descripcion, categoria_id, proveedor_id, precio, stock_minimo, stock_maximo, activo, id], function(err) {
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
                    LEFT JOIN categorias c ON p.categoria_id = c.id
                    LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
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
