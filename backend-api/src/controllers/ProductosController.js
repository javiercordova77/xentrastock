/**
 * Controlador para Productos - XentraStock
 * Gestiona productos con variantes, colores e imágenes
 */

const database = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class ProductosController {
    // Configuración de multer para subida de imágenes
    static setupImageUpload() {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                const uploadPath = path.join(__dirname, '../../uploads/productos');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        });

        return multer({
            storage: storage,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB límite
            },
            fileFilter: function (req, file, cb) {
                const allowedTypes = /jpeg|jpg|png|gif|webp/;
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                const mimetype = allowedTypes.test(file.mimetype);

                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
                }
            }
        });
    }

    // Obtener todos los productos con sus variantes y colores
    static async obtenerTodos(req, res) {
        try {
            const db = database.getDb();
            const { page = 1, limit = 20, categoria, proveedor, activo } = req.query;
            const offset = (page - 1) * limit;

            let whereClause = '1=1';
            let params = [];

            if (categoria) {
                whereClause += ' AND p.id_categoria = ?';
                params.push(categoria);
            }
            if (proveedor) {
                whereClause += ' AND p.id_proveedor = ?';
                params.push(proveedor);
            }
            if (activo !== undefined) {
                whereClause += ' AND p.activo = ?';
                params.push(activo);
            }

            const query = `
                SELECT 
                    p.id,
                    p.id_categoria,
                    p.id_proveedor,
                    p.descripcion,
                    p.imagen,
                    p.material,
                    p.activo,
                    p.created_at,
                    p.updated_at,
                    c.nombre as categoria_nombre,
                    pr.nombre as proveedor_nombre,
                    COUNT(v.id) as total_variantes,
                    COALESCE(SUM(su.cantidad_disponible), 0) as stock_total
                FROM productos p
                INNER JOIN categorias c ON c.id = p.id_categoria
                INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                LEFT JOIN variantes v ON v.id_producto = p.id AND v.activo = 1
                LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
                WHERE ${whereClause}
                GROUP BY p.id, p.id_categoria, p.id_proveedor, p.descripcion, p.imagen, 
                         p.material, p.activo, p.created_at, p.updated_at, 
                         c.nombre, pr.nombre
                ORDER BY p.descripcion
                LIMIT ? OFFSET ?
            `;

            params.push(limit, offset);

            const productos = await new Promise((resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Obtener variantes y colores para cada producto
            for (let producto of productos) {
                // Obtener variantes
                const variantes = await new Promise((resolve, reject) => {
                    const variantesQuery = `
                        SELECT 
                            v.id,
                            v.codigo_variante,
                            v.medida,
                            v.precio_venta,
                            v.precio_compra,
                            v.activo,
                            COALESCE(SUM(su.cantidad_disponible), 0) as stock_disponible,
                            GROUP_CONCAT(DISTINCT cv.color) as colores
                        FROM variantes v
                        LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
                        LEFT JOIN colores_variantes cv ON cv.id_variante = v.id AND cv.activo = 1
                        WHERE v.id_producto = ? AND v.activo = 1
                        GROUP BY v.id, v.codigo_variante, v.medida, v.precio_venta, v.precio_compra, v.activo
                        ORDER BY v.codigo_variante
                    `;

                    db.all(variantesQuery, [producto.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });

                producto.variantes = variantes;
            }

            // Obtener total de registros
            const totalQuery = `
                SELECT COUNT(DISTINCT p.id) as total
                FROM productos p
                INNER JOIN categorias c ON c.id = p.id_categoria
                INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                WHERE ${whereClause}
            `;

            const totalResult = await new Promise((resolve, reject) => {
                db.get(totalQuery, params.slice(0, -2), (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            res.json({
                success: true,
                data: productos,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalResult.total,
                    pages: Math.ceil(totalResult.total / limit)
                }
            });

        } catch (error) {
            console.error('Error obteniendo productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener producto por ID con detalles completos
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();

            // Obtener producto básico
            const producto = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        p.id,
                        p.id_categoria,
                        p.id_proveedor,
                        p.descripcion,
                        p.imagen,
                        p.material,
                        p.activo,
                        p.created_at,
                        p.updated_at,
                        c.nombre as categoria_nombre,
                        pr.nombre as proveedor_nombre,
                        pr.actividad as proveedor_actividad
                    FROM productos p
                    INNER JOIN categorias c ON c.id = p.id_categoria
                    INNER JOIN proveedores pr ON pr.id = p.id_proveedor
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

            // Obtener variantes con colores y stock
            const variantes = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        v.id,
                        v.codigo_variante,
                        v.medida,
                        v.precio_venta,
                        v.precio_compra,
                        v.fecha_ingreso,
                        v.activo
                    FROM variantes v
                    WHERE v.id_producto = ?
                    ORDER BY v.codigo_variante
                `;

                db.all(query, [id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Para cada variante, obtener colores y stock
            for (let variante of variantes) {
                // Obtener colores
                const colores = await new Promise((resolve, reject) => {
                    const query = `
                        SELECT 
                            id,
                            color,
                            codigo_color,
                            imagen_color,
                            activo
                        FROM colores_variantes
                        WHERE id_variante = ? AND activo = 1
                        ORDER BY color
                    `;

                    db.all(query, [variante.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });

                // Obtener stock por ubicación
                const stock = await new Promise((resolve, reject) => {
                    const query = `
                        SELECT 
                            su.id,
                            su.cantidad_disponible,
                            su.cantidad_minima,
                            su.fecha_ingreso,
                            u.id as ubicacion_id,
                            u.nombre as ubicacion_nombre,
                            u.tipo as ubicacion_tipo
                        FROM stock_ubicaciones su
                        INNER JOIN ubicaciones u ON u.id = su.id_ubicacion
                        WHERE su.id_variante = ?
                        ORDER BY u.nombre
                    `;

                    db.all(query, [variante.id], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });

                variante.colores = colores;
                variante.stock_ubicaciones = stock;
                variante.stock_total = stock.reduce((total, s) => total + s.cantidad_disponible, 0);
            }

            producto.variantes = variantes;

            res.json({
                success: true,
                data: producto
            });

        } catch (error) {
            console.error('Error obteniendo producto por ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear nuevo producto
    static async crear(req, res) {
        try {
            const db = database.getDb();
            const {
                id_categoria,
                id_proveedor,
                descripcion,
                material,
                activo = 1
            } = req.body;

            // Validaciones
            if (!id_categoria || !id_proveedor || !descripcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos id_categoria, id_proveedor y descripcion son obligatorios'
                });
            }

            // Verificar que la categoría existe
            const categoria = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM categorias WHERE id = ? AND activo = 1',
                    [id_categoria],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada o inactiva'
                });
            }

            // Verificar que el proveedor existe
            const proveedor = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM proveedores WHERE id = ? AND activo = 1',
                    [id_proveedor],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado o inactivo'
                });
            }

            // Manejar la imagen si se subió
            let imagen = null;
            if (req.file) {
                imagen = `uploads/productos/${req.file.filename}`;
            }

            const query = `
                INSERT INTO productos 
                (id_categoria, id_proveedor, descripcion, imagen, material, activo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;

            const result = await new Promise((resolve, reject) => {
                db.run(query, [id_categoria, id_proveedor, descripcion, imagen, material, activo], function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                });
            });

            // Obtener el producto creado con datos completos
            const productoCreado = await new Promise((resolve, reject) => {
                const selectQuery = `
                    SELECT 
                        p.id,
                        p.id_categoria,
                        p.id_proveedor,
                        p.descripcion,
                        p.imagen,
                        p.material,
                        p.activo,
                        p.created_at,
                        p.updated_at,
                        c.nombre as categoria_nombre,
                        pr.nombre as proveedor_nombre
                    FROM productos p
                    INNER JOIN categorias c ON c.id = p.id_categoria
                    INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                    WHERE p.id = ?
                `;

                db.get(selectQuery, [result.id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: productoCreado
            });

        } catch (error) {
            console.error('Error creando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar producto
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();
            const {
                id_categoria,
                id_proveedor,
                descripcion,
                material,
                activo
            } = req.body;

            // Verificar que el producto existe
            const productoExistente = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM productos WHERE id = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!productoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Construir consulta de actualización dinámicamente
            const updates = [];
            const params = [];

            if (id_categoria !== undefined) {
                updates.push('id_categoria = ?');
                params.push(id_categoria);
            }
            if (id_proveedor !== undefined) {
                updates.push('id_proveedor = ?');
                params.push(id_proveedor);
            }
            if (descripcion !== undefined) {
                updates.push('descripcion = ?');
                params.push(descripcion);
            }
            if (material !== undefined) {
                updates.push('material = ?');
                params.push(material);
            }
            if (activo !== undefined) {
                updates.push('activo = ?');
                params.push(activo);
            }

            // Manejar nueva imagen
            if (req.file) {
                updates.push('imagen = ?');
                params.push(`uploads/productos/${req.file.filename}`);
                
                // Eliminar imagen anterior si existe
                if (productoExistente.imagen) {
                    const oldImagePath = path.join(__dirname, '../../', productoExistente.imagen);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionaron campos para actualizar'
                });
            }

            updates.push('updated_at = datetime(\'now\')');
            params.push(id);

            const query = `
                UPDATE productos 
                SET ${updates.join(', ')}
                WHERE id = ?
            `;

            await new Promise((resolve, reject) => {
                db.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                });
            });

            // Obtener el producto actualizado
            const productoActualizado = await new Promise((resolve, reject) => {
                const selectQuery = `
                    SELECT 
                        p.id,
                        p.id_categoria,
                        p.id_proveedor,
                        p.descripcion,
                        p.imagen,
                        p.material,
                        p.activo,
                        p.created_at,
                        p.updated_at,
                        c.nombre as categoria_nombre,
                        pr.nombre as proveedor_nombre
                    FROM productos p
                    INNER JOIN categorias c ON c.id = p.id_categoria
                    INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                    WHERE p.id = ?
                `;

                db.get(selectQuery, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: productoActualizado
            });

        } catch (error) {
            console.error('Error actualizando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar producto (soft delete)
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();

            // Verificar que el producto existe
            const productoExistente = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM productos WHERE id = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!productoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Verificar si tiene variantes activas
            const variantesActivas = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT COUNT(*) as count FROM variantes WHERE id_producto = ? AND activo = 1',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row.count);
                    }
                );
            });

            if (variantesActivas > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el producto porque tiene variantes activas'
                });
            }

            // Soft delete
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE productos SET activo = 0, updated_at = datetime(\'now\') WHERE id = ?',
                    [id],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ changes: this.changes });
                    }
                );
            });

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = ProductosController;