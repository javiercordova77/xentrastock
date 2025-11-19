/**
 * Controlador para Variantes - XentraStock
 * Gestiona las variantes de productos con medidas, precios y stock por ubicación
 */

const database = require('../config/database');

class VariantesController {
    // Obtener todas las variantes con información del producto
    static async obtenerTodas(req, res) {
        try {
            const db = database.getDb();
            const { page = 1, limit = 50, producto_id, activo, con_stock } = req.query;
            const offset = (page - 1) * limit;

            let whereClause = '1=1';
            let params = [];

            if (producto_id) {
                whereClause += ' AND v.id_producto = ?';
                params.push(producto_id);
            }
            if (activo !== undefined) {
                whereClause += ' AND v.activo = ?';
                params.push(activo);
            }

            let query = `
                SELECT 
                    v.id,
                    v.id_producto,
                    v.codigo_variante,
                    v.medida,
                    v.precio_venta,
                    v.precio_compra,
                    v.fecha_ingreso,
                    v.activo,
                    v.updated_at,
                    p.descripcion as producto_descripcion,
                    p.imagen as producto_imagen,
                    p.material,
                    c.nombre as categoria_nombre,
                    pr.nombre as proveedor_nombre,
                    COALESCE(SUM(su.cantidad_disponible), 0) as stock_total,
                    COALESCE(MIN(su.cantidad_minima), 0) as stock_minimo,
                    COUNT(cv.id) as total_colores,
                    GROUP_CONCAT(cv.color, ', ') as colores_disponibles
                FROM variantes v
                INNER JOIN productos p ON p.id = v.id_producto
                INNER JOIN categorias c ON c.id = p.id_categoria
                INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
                LEFT JOIN colores_variantes cv ON cv.id_variante = v.id AND cv.activo = 1
                WHERE ${whereClause}
                GROUP BY v.id, v.id_producto, v.codigo_variante, v.medida, v.precio_venta, 
                         v.precio_compra, v.fecha_ingreso, v.activo, v.updated_at,
                         p.descripcion, p.imagen, p.material, c.nombre, pr.nombre
            `;

            // Agregar filtro de stock si se especifica
            if (con_stock === 'true') {
                query += ' HAVING stock_total > 0';
            } else if (con_stock === 'false') {
                query += ' HAVING stock_total = 0';
            }

            query += ' ORDER BY p.descripcion, v.codigo_variante LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const variantes = await new Promise((resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Obtener total de registros
            const totalQuery = `
                SELECT COUNT(DISTINCT v.id) as total
                FROM variantes v
                INNER JOIN productos p ON p.id = v.id_producto
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
                data: variantes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalResult.total,
                    pages: Math.ceil(totalResult.total / limit)
                }
            });

        } catch (error) {
            console.error('Error obteniendo variantes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener variante por ID con detalles completos
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();

            // Obtener variante básica
            const variante = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        v.id,
                        v.id_producto,
                        v.codigo_variante,
                        v.medida,
                        v.precio_venta,
                        v.precio_compra,
                        v.fecha_ingreso,
                        v.activo,
                        v.updated_at,
                        p.descripcion as producto_descripcion,
                        p.imagen as producto_imagen,
                        p.material,
                        c.nombre as categoria_nombre,
                        pr.nombre as proveedor_nombre,
                        pr.actividad as proveedor_actividad
                    FROM variantes v
                    INNER JOIN productos p ON p.id = v.id_producto
                    INNER JOIN categorias c ON c.id = p.id_categoria
                    INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                    WHERE v.id = ?
                `;

                db.get(query, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!variante) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante no encontrada'
                });
            }

            // Obtener colores
            const colores = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        id,
                        color,
                        codigo_color,
                        imagen_color,
                        activo,
                        created_at,
                        updated_at
                    FROM colores_variantes
                    WHERE id_variante = ?
                    ORDER BY color
                `;

                db.all(query, [id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Obtener stock por ubicación
            const stockUbicaciones = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        su.id,
                        su.cantidad_disponible,
                        su.cantidad_minima,
                        su.fecha_ingreso,
                        su.updated_at,
                        u.id as ubicacion_id,
                        u.nombre as ubicacion_nombre,
                        u.descripcion as ubicacion_descripcion,
                        u.tipo as ubicacion_tipo
                    FROM stock_ubicaciones su
                    INNER JOIN ubicaciones u ON u.id = su.id_ubicacion
                    WHERE su.id_variante = ?
                    ORDER BY u.nombre
                `;

                db.all(query, [id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Obtener movimientos recientes
            const movimientosRecientes = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        m.id,
                        m.tipo,
                        m.subtipo,
                        m.cantidad,
                        m.precio_unitario,
                        m.motivo,
                        m.referencia,
                        m.usuario,
                        m.fecha,
                        u.nombre as ubicacion_nombre
                    FROM movimientos m
                    INNER JOIN ubicaciones u ON u.id = m.id_ubicacion
                    WHERE m.id_variante = ?
                    ORDER BY m.fecha DESC
                    LIMIT 10
                `;

                db.all(query, [id], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            variante.colores = colores;
            variante.stock_ubicaciones = stockUbicaciones;
            variante.stock_total = stockUbicaciones.reduce((total, s) => total + s.cantidad_disponible, 0);
            variante.movimientos_recientes = movimientosRecientes;

            res.json({
                success: true,
                data: variante
            });

        } catch (error) {
            console.error('Error obteniendo variante por ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear nueva variante
    static async crear(req, res) {
        try {
            const db = database.getDb();
            const {
                id_producto,
                codigo_variante,
                medida,
                precio_venta = 0,
                precio_compra = 0,
                activo = 1
            } = req.body;

            // Validaciones
            if (!id_producto || !codigo_variante) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos id_producto y codigo_variante son obligatorios'
                });
            }

            // Verificar que el producto existe
            const producto = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM productos WHERE id = ? AND activo = 1',
                    [id_producto],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado o inactivo'
                });
            }

            // Verificar que el código de variante no existe
            const existe = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM variantes WHERE codigo_variante = ?',
                    [codigo_variante],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (existe) {
                return res.status(409).json({
                    success: false,
                    message: 'El código de variante ya existe'
                });
            }

            const query = `
                INSERT INTO variantes 
                (id_producto, codigo_variante, medida, precio_venta, precio_compra, 
                 fecha_ingreso, activo, updated_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'))
            `;

            const result = await new Promise((resolve, reject) => {
                db.run(query, [id_producto, codigo_variante, medida, precio_venta, precio_compra, activo], function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                });
            });

            // Obtener la variante creada con datos completos
            const varianteCreada = await new Promise((resolve, reject) => {
                const selectQuery = `
                    SELECT 
                        v.id,
                        v.id_producto,
                        v.codigo_variante,
                        v.medida,
                        v.precio_venta,
                        v.precio_compra,
                        v.fecha_ingreso,
                        v.activo,
                        v.updated_at,
                        p.descripcion as producto_descripcion,
                        c.nombre as categoria_nombre,
                        pr.nombre as proveedor_nombre
                    FROM variantes v
                    INNER JOIN productos p ON p.id = v.id_producto
                    INNER JOIN categorias c ON c.id = p.id_categoria
                    INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                    WHERE v.id = ?
                `;

                db.get(selectQuery, [result.id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            res.status(201).json({
                success: true,
                message: 'Variante creada exitosamente',
                data: varianteCreada
            });

        } catch (error) {
            console.error('Error creando variante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar variante
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();
            const {
                codigo_variante,
                medida,
                precio_venta,
                precio_compra,
                activo
            } = req.body;

            // Verificar que la variante existe
            const varianteExistente = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM variantes WHERE id = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!varianteExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante no encontrada'
                });
            }

            // Verificar código único si se está actualizando
            if (codigo_variante && codigo_variante !== varianteExistente.codigo_variante) {
                const existe = await new Promise((resolve, reject) => {
                    db.get(
                        'SELECT id FROM variantes WHERE codigo_variante = ? AND id != ?',
                        [codigo_variante, id],
                        (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        }
                    );
                });

                if (existe) {
                    return res.status(409).json({
                        success: false,
                        message: 'El código de variante ya existe'
                    });
                }
            }

            // Construir consulta de actualización dinámicamente
            const updates = [];
            const params = [];

            if (codigo_variante !== undefined) {
                updates.push('codigo_variante = ?');
                params.push(codigo_variante);
            }
            if (medida !== undefined) {
                updates.push('medida = ?');
                params.push(medida);
            }
            if (precio_venta !== undefined) {
                updates.push('precio_venta = ?');
                params.push(precio_venta);
            }
            if (precio_compra !== undefined) {
                updates.push('precio_compra = ?');
                params.push(precio_compra);
            }
            if (activo !== undefined) {
                updates.push('activo = ?');
                params.push(activo);
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
                UPDATE variantes 
                SET ${updates.join(', ')}
                WHERE id = ?
            `;

            await new Promise((resolve, reject) => {
                db.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                });
            });

            // Obtener la variante actualizada
            const varianteActualizada = await new Promise((resolve, reject) => {
                const selectQuery = `
                    SELECT 
                        v.id,
                        v.id_producto,
                        v.codigo_variante,
                        v.medida,
                        v.precio_venta,
                        v.precio_compra,
                        v.fecha_ingreso,
                        v.activo,
                        v.updated_at,
                        p.descripcion as producto_descripcion,
                        c.nombre as categoria_nombre,
                        pr.nombre as proveedor_nombre
                    FROM variantes v
                    INNER JOIN productos p ON p.id = v.id_producto
                    INNER JOIN categorias c ON c.id = p.id_categoria
                    INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                    WHERE v.id = ?
                `;

                db.get(selectQuery, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            res.json({
                success: true,
                message: 'Variante actualizada exitosamente',
                data: varianteActualizada
            });

        } catch (error) {
            console.error('Error actualizando variante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar variante (soft delete)
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();

            // Verificar que la variante existe
            const varianteExistente = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM variantes WHERE id = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!varianteExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante no encontrada'
                });
            }

            // Verificar si tiene stock
            const tieneStock = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT SUM(cantidad_disponible) as total FROM stock_ubicaciones WHERE id_variante = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row.total || 0);
                    }
                );
            });

            if (tieneStock > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar la variante porque tiene stock disponible'
                });
            }

            // Soft delete
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE variantes SET activo = 0, updated_at = datetime(\'now\') WHERE id = ?',
                    [id],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ changes: this.changes });
                    }
                );
            });

            res.json({
                success: true,
                message: 'Variante eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando variante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener variantes de un producto específico
    static async obtenerPorProducto(req, res) {
        try {
            const { productoId } = req.params;
            const db = database.getDb();

            const variantes = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        v.id,
                        v.codigo_variante,
                        v.medida,
                        v.precio_venta,
                        v.precio_compra,
                        v.fecha_ingreso,
                        v.activo,
                        COALESCE(SUM(su.cantidad_disponible), 0) as stock_total,
                        COUNT(DISTINCT cv.id) as total_colores,
                        GROUP_CONCAT(DISTINCT cv.color, ', ') as colores_disponibles
                    FROM variantes v
                    LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
                    LEFT JOIN colores_variantes cv ON cv.id_variante = v.id AND cv.activo = 1
                    WHERE v.id_producto = ? AND v.activo = 1
                    GROUP BY v.id, v.codigo_variante, v.medida, v.precio_venta, 
                             v.precio_compra, v.fecha_ingreso, v.activo
                    ORDER BY v.codigo_variante
                `;

                db.all(query, [productoId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            res.json({
                success: true,
                data: variantes,
                total: variantes.length
            });

        } catch (error) {
            console.error('Error obteniendo variantes por producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = VariantesController;