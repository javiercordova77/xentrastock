/**
 * Controlador para Colores de Variantes
 * Gestiona los colores disponibles para cada variante de producto
 */

const database = require('../config/database');

class ColoresVariantesController {
    // Obtener todos los colores de una variante específica
    static async obtenerColoresPorVariante(req, res) {
        try {
            const { varianteId } = req.params;
            const db = database.getDb();

            const colores = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        cv.id,
                        cv.id_variante,
                        cv.color,
                        cv.codigo_color,
                        cv.imagen_color,
                        cv.activo,
                        cv.created_at,
                        cv.updated_at,
                        v.codigo_variante,
                        v.medida,
                        p.descripcion as producto_descripcion
                    FROM colores_variantes cv
                    INNER JOIN variantes v ON v.id = cv.id_variante
                    INNER JOIN productos p ON p.id = v.id_producto
                    WHERE cv.id_variante = ? AND cv.activo = 1
                    ORDER BY cv.color
                `;

                db.all(query, [varianteId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            res.json({
                success: true,
                data: colores,
                total: colores.length
            });

        } catch (error) {
            console.error('Error obteniendo colores de variante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener todos los colores disponibles
    static async obtenerTodos(req, res) {
        try {
            const db = database.getDb();
            const { page = 1, limit = 50, activo } = req.query;
            const offset = (page - 1) * limit;

            let whereClause = '1=1';
            let params = [];

            if (activo !== undefined) {
                whereClause += ' AND cv.activo = ?';
                params.push(activo);
            }

            const query = `
                SELECT 
                    cv.id,
                    cv.id_variante,
                    cv.color,
                    cv.codigo_color,
                    cv.imagen_color,
                    cv.activo,
                    cv.created_at,
                    cv.updated_at,
                    v.codigo_variante,
                    v.medida,
                    p.descripcion as producto_descripcion,
                    c.nombre as categoria_nombre,
                    pr.nombre as proveedor_nombre
                FROM colores_variantes cv
                INNER JOIN variantes v ON v.id = cv.id_variante
                INNER JOIN productos p ON p.id = v.id_producto
                INNER JOIN categorias c ON c.id = p.id_categoria
                INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                WHERE ${whereClause}
                ORDER BY p.descripcion, v.codigo_variante, cv.color
                LIMIT ? OFFSET ?
            `;

            params.push(limit, offset);

            const colores = await new Promise((resolve, reject) => {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Obtener total de registros
            const totalQuery = `
                SELECT COUNT(*) as total
                FROM colores_variantes cv
                INNER JOIN variantes v ON v.id = cv.id_variante
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
                data: colores,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalResult.total,
                    pages: Math.ceil(totalResult.total / limit)
                }
            });

        } catch (error) {
            console.error('Error obteniendo colores:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear nuevo color para variante
    static async crear(req, res) {
        try {
            const db = database.getDb();
            const {
                id_variante,
                color,
                codigo_color,
                imagen_color,
                activo = 1
            } = req.body;

            // Validaciones
            if (!id_variante || !color || !codigo_color) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos id_variante, color y codigo_color son obligatorios'
                });
            }

            // Verificar que la variante existe
            const variante = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM variantes WHERE id = ? AND activo = 1',
                    [id_variante],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!variante) {
                return res.status(404).json({
                    success: false,
                    message: 'Variante no encontrada o inactiva'
                });
            }

            // Verificar que no exista ya esta combinación
            const existe = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id FROM colores_variantes WHERE id_variante = ? AND color = ? AND codigo_color = ?',
                    [id_variante, color, codigo_color],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (existe) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe este color para esta variante'
                });
            }

            const query = `
                INSERT INTO colores_variantes 
                (id_variante, color, codigo_color, imagen_color, activo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;

            const result = await new Promise((resolve, reject) => {
                db.run(query, [id_variante, color, codigo_color, imagen_color, activo], function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                });
            });

            // Obtener el color creado con datos completos
            const colorCreado = await new Promise((resolve, reject) => {
                const selectQuery = `
                    SELECT 
                        cv.id,
                        cv.id_variante,
                        cv.color,
                        cv.codigo_color,
                        cv.imagen_color,
                        cv.activo,
                        cv.created_at,
                        cv.updated_at,
                        v.codigo_variante,
                        v.medida,
                        p.descripcion as producto_descripcion
                    FROM colores_variantes cv
                    INNER JOIN variantes v ON v.id = cv.id_variante
                    INNER JOIN productos p ON p.id = v.id_producto
                    WHERE cv.id = ?
                `;

                db.get(selectQuery, [result.id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            res.status(201).json({
                success: true,
                message: 'Color de variante creado exitosamente',
                data: colorCreado
            });

        } catch (error) {
            console.error('Error creando color de variante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar color de variante
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();
            const {
                color,
                codigo_color,
                imagen_color,
                activo
            } = req.body;

            // Verificar que el color existe
            const colorExistente = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM colores_variantes WHERE id = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!colorExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Color de variante no encontrado'
                });
            }

            // Construir consulta de actualización dinámicamente
            const updates = [];
            const params = [];

            if (color !== undefined) {
                updates.push('color = ?');
                params.push(color);
            }
            if (codigo_color !== undefined) {
                updates.push('codigo_color = ?');
                params.push(codigo_color);
            }
            if (imagen_color !== undefined) {
                updates.push('imagen_color = ?');
                params.push(imagen_color);
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
                UPDATE colores_variantes 
                SET ${updates.join(', ')}
                WHERE id = ?
            `;

            await new Promise((resolve, reject) => {
                db.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                });
            });

            // Obtener el color actualizado
            const colorActualizado = await new Promise((resolve, reject) => {
                const selectQuery = `
                    SELECT 
                        cv.id,
                        cv.id_variante,
                        cv.color,
                        cv.codigo_color,
                        cv.imagen_color,
                        cv.activo,
                        cv.created_at,
                        cv.updated_at,
                        v.codigo_variante,
                        v.medida,
                        p.descripcion as producto_descripcion
                    FROM colores_variantes cv
                    INNER JOIN variantes v ON v.id = cv.id_variante
                    INNER JOIN productos p ON p.id = v.id_producto
                    WHERE cv.id = ?
                `;

                db.get(selectQuery, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            res.json({
                success: true,
                message: 'Color de variante actualizado exitosamente',
                data: colorActualizado
            });

        } catch (error) {
            console.error('Error actualizando color de variante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar color de variante (soft delete)
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();

            // Verificar que el color existe
            const colorExistente = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT * FROM colores_variantes WHERE id = ?',
                    [id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (!colorExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Color de variante no encontrado'
                });
            }

            // Soft delete
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE colores_variantes SET activo = 0, updated_at = datetime(\'now\') WHERE id = ?',
                    [id],
                    function(err) {
                        if (err) reject(err);
                        else resolve({ changes: this.changes });
                    }
                );
            });

            res.json({
                success: true,
                message: 'Color de variante eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando color de variante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener color específico por ID
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const db = database.getDb();

            const color = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        cv.id,
                        cv.id_variante,
                        cv.color,
                        cv.codigo_color,
                        cv.imagen_color,
                        cv.activo,
                        cv.created_at,
                        cv.updated_at,
                        v.codigo_variante,
                        v.medida,
                        p.descripcion as producto_descripcion,
                        c.nombre as categoria_nombre,
                        pr.nombre as proveedor_nombre
                    FROM colores_variantes cv
                    INNER JOIN variantes v ON v.id = cv.id_variante
                    INNER JOIN productos p ON p.id = v.id_producto
                    INNER JOIN categorias c ON c.id = p.id_categoria
                    INNER JOIN proveedores pr ON pr.id = p.id_proveedor
                    WHERE cv.id = ?
                `;

                db.get(query, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!color) {
                return res.status(404).json({
                    success: false,
                    message: 'Color de variante no encontrado'
                });
            }

            res.json({
                success: true,
                data: color
            });

        } catch (error) {
            console.error('Error obteniendo color por ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = ColoresVariantesController;