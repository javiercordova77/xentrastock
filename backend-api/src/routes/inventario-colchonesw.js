/**
 * Rutas de inventario para XentraStock v3.0 - ColchonesW
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Obtener inventario (stock por variantes y ubicaciones)
router.get('/', asyncHandler(async (req, res) => {
    const db = database.getDb();
    const { 
        page = 1, 
        limit = 50, 
        variante_id, 
        ubicacion_id, 
        producto_id,
        categoria_id,
        proveedor_id,
        con_stock,
        codigo_variante
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const params = [];

    // Filtros dinámicos
    if (variante_id) {
        whereClause += ' AND v.id = ?';
        params.push(variante_id);
    }
    if (ubicacion_id) {
        whereClause += ' AND u.id = ?';
        params.push(ubicacion_id);
    }
    if (producto_id) {
        whereClause += ' AND p.id = ?';
        params.push(producto_id);
    }
    if (categoria_id) {
        whereClause += ' AND p.id_categoria = ?';
        params.push(categoria_id);
    }
    if (proveedor_id) {
        whereClause += ' AND p.id_proveedor = ?';
        params.push(proveedor_id);
    }
    if (codigo_variante) {
        whereClause += ' AND v.codigo_variante LIKE ?';
        params.push(`%${codigo_variante}%`);
    }

    let query = `
        SELECT 
            v.id as variante_id,
            v.codigo_variante,
            v.medida,
            v.precio_venta,
            v.precio_compra,
            v.activo as variante_activa,
            p.id as producto_id,
            p.descripcion as producto_descripcion,
            p.imagen as producto_imagen,
            p.material,
            c.nombre as categoria_nombre,
            pr.nombre as proveedor_nombre,
            u.id as ubicacion_id,
            u.nombre as ubicacion_nombre,
            u.tipo as ubicacion_tipo,
            COALESCE(su.cantidad_disponible, 0) as stock_disponible,
            COALESCE(su.cantidad_minima, 0) as stock_minimo,
            COALESCE(su.cantidad_disponible, 0) as stock_total,
            CASE 
                WHEN COALESCE(su.cantidad_disponible, 0) <= COALESCE(su.cantidad_minima, 0) 
                THEN 'bajo'
                WHEN COALESCE(su.cantidad_disponible, 0) = 0 
                THEN 'agotado'
                ELSE 'normal'
            END as estado_stock
        FROM variantes v
        INNER JOIN productos p ON p.id = v.id_producto AND p.activo = 1
        INNER JOIN categorias c ON c.id = p.id_categoria AND c.activo = 1
        INNER JOIN proveedores pr ON pr.id = p.id_proveedor AND pr.activo = 1
        LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
        LEFT JOIN ubicaciones u ON u.id = su.id_ubicacion AND u.activo = 1
        WHERE v.activo = 1 AND ${whereClause}
    `;

    // Filtro de stock
    if (con_stock === 'true') {
        query += ' AND COALESCE(su.cantidad_disponible, 0) > 0';
    } else if (con_stock === 'false') {
        query += ' AND COALESCE(su.cantidad_disponible, 0) = 0';
    }

    query += ' ORDER BY p.descripcion, v.codigo_variante, u.nombre LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const inventario = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    // Obtener total de registros para paginación
    const countQuery = `
        SELECT COUNT(*) as total
        FROM variantes v
        INNER JOIN productos p ON p.id = v.id_producto AND p.activo = 1
        INNER JOIN categorias c ON c.id = p.id_categoria AND c.activo = 1
        INNER JOIN proveedores pr ON pr.id = p.id_proveedor AND pr.activo = 1
        LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
        LEFT JOIN ubicaciones u ON u.id = su.id_ubicacion AND u.activo = 1
        WHERE v.activo = 1 AND ${whereClause}
        ${con_stock === 'true' ? 'AND COALESCE(su.cantidad_disponible, 0) > 0' : ''}
        ${con_stock === 'false' ? 'AND COALESCE(su.cantidad_disponible, 0) = 0' : ''}
    `;

    const totalResult = await new Promise((resolve, reject) => {
        db.get(countQuery, params.slice(0, -2), (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    // Agrupar por variante para mejor presentación
    const inventarioAgrupado = inventario.reduce((acc, item) => {
        const key = item.variante_id;
        if (!acc[key]) {
            acc[key] = {
                variante_id: item.variante_id,
                codigo_variante: item.codigo_variante,
                medida: item.medida,
                precio_venta: item.precio_venta,
                precio_compra: item.precio_compra,
                variante_activa: item.variante_activa,
                producto_id: item.producto_id,
                producto_descripcion: item.producto_descripcion,
                producto_imagen: item.producto_imagen,
                material: item.material,
                categoria_nombre: item.categoria_nombre,
                proveedor_nombre: item.proveedor_nombre,
                stock_total: 0,
                ubicaciones: []
            };
        }

        if (item.ubicacion_id) {
            acc[key].ubicaciones.push({
                ubicacion_id: item.ubicacion_id,
                ubicacion_nombre: item.ubicacion_nombre,
                ubicacion_tipo: item.ubicacion_tipo,
                stock_disponible: item.stock_disponible,
                stock_minimo: item.stock_minimo,
                estado_stock: item.estado_stock
            });
            acc[key].stock_total += item.stock_disponible;
        }

        return acc;
    }, {});

    res.json({
        success: true,
        isOk: true,
        data: Object.values(inventarioAgrupado),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalResult.total,
            pages: Math.ceil(totalResult.total / limit)
        }
    });
}));

// Obtener inventario por producto específico
router.get('/producto/:productoId', asyncHandler(async (req, res) => {
    const { productoId } = req.params;
    const db = database.getDb();

    const query = `
        SELECT 
            p.id as producto_id,
            p.descripcion as producto_descripcion,
            p.imagen as producto_imagen,
            p.material,
            c.nombre as categoria_nombre,
            pr.nombre as proveedor_nombre,
            v.id as variante_id,
            v.codigo_variante,
            v.medida,
            v.precio_venta,
            v.precio_compra,
            u.id as ubicacion_id,
            u.nombre as ubicacion_nombre,
            u.tipo as ubicacion_tipo,
            COALESCE(su.cantidad_disponible, 0) as stock_disponible,
            COALESCE(su.cantidad_minima, 0) as stock_minimo
        FROM productos p
        INNER JOIN categorias c ON c.id = p.id_categoria
        INNER JOIN proveedores pr ON pr.id = p.id_proveedor
        LEFT JOIN variantes v ON v.id_producto = p.id AND v.activo = 1
        LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
        LEFT JOIN ubicaciones u ON u.id = su.id_ubicacion AND u.activo = 1
        WHERE p.id = ? AND p.activo = 1
        ORDER BY v.codigo_variante, u.nombre
    `;

    const inventario = await new Promise((resolve, reject) => {
        db.all(query, [productoId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    if (inventario.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    // Estructurar la respuesta
    const producto = {
        producto_id: inventario[0].producto_id,
        producto_descripcion: inventario[0].producto_descripcion,
        producto_imagen: inventario[0].producto_imagen,
        material: inventario[0].material,
        categoria_nombre: inventario[0].categoria_nombre,
        proveedor_nombre: inventario[0].proveedor_nombre,
        variantes: []
    };

    // Agrupar por variante
    const variantesMap = {};
    inventario.forEach(item => {
        if (item.variante_id) {
            if (!variantesMap[item.variante_id]) {
                variantesMap[item.variante_id] = {
                    variante_id: item.variante_id,
                    codigo_variante: item.codigo_variante,
                    medida: item.medida,
                    precio_venta: item.precio_venta,
                    precio_compra: item.precio_compra,
                    stock_total: 0,
                    ubicaciones: []
                };
            }

            if (item.ubicacion_id) {
                variantesMap[item.variante_id].ubicaciones.push({
                    ubicacion_id: item.ubicacion_id,
                    ubicacion_nombre: item.ubicacion_nombre,
                    ubicacion_tipo: item.ubicacion_tipo,
                    stock_disponible: item.stock_disponible,
                    stock_minimo: item.stock_minimo
                });
                variantesMap[item.variante_id].stock_total += item.stock_disponible;
            }
        }
    });

    producto.variantes = Object.values(variantesMap);

    res.json({
        success: true,
        isOk: true,
        data: producto
    });
}));

// Obtener resumen de inventario
router.get('/resumen', asyncHandler(async (req, res) => {
    const db = database.getDb();

    const query = `
        SELECT 
            COUNT(DISTINCT p.id) as total_productos,
            COUNT(DISTINCT v.id) as total_variantes,
            COUNT(DISTINCT c.id) as total_categorias,
            COUNT(DISTINCT pr.id) as total_proveedores,
            COUNT(DISTINCT u.id) as total_ubicaciones,
            SUM(COALESCE(su.cantidad_disponible, 0)) as stock_total_disponible,
            COUNT(CASE WHEN COALESCE(su.cantidad_disponible, 0) = 0 THEN 1 END) as productos_agotados,
            COUNT(CASE WHEN COALESCE(su.cantidad_disponible, 0) <= COALESCE(su.cantidad_minima, 0) AND COALESCE(su.cantidad_disponible, 0) > 0 THEN 1 END) as productos_stock_bajo
        FROM productos p
        INNER JOIN categorias c ON c.id = p.id_categoria AND c.activo = 1
        INNER JOIN proveedores pr ON pr.id = p.id_proveedor AND pr.activo = 1
        LEFT JOIN variantes v ON v.id_producto = p.id AND v.activo = 1
        LEFT JOIN stock_ubicaciones su ON su.id_variante = v.id
        LEFT JOIN ubicaciones u ON u.id = su.id_ubicacion AND u.activo = 1
        WHERE p.activo = 1
    `;

    const resumen = await new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    res.json({
        success: true,
        isOk: true,
        data: resumen
    });
}));

// Obtener stock específico por variante y ubicación
router.get('/stock-ubicacion/:varianteId/:ubicacionId', asyncHandler(async (req, res) => {
	const db = database.getDb();
	const { varianteId, ubicacionId } = req.params;
	
	const query = `SELECT 
		su.cantidad_disponible,
		v.codigo_variante,
		v.medida,
		p.descripcion as producto_descripcion,
		u.nombre as ubicacion_nombre
	FROM stock_ubicaciones su
	LEFT JOIN variantes v ON su.id_variante = v.id
	LEFT JOIN productos p ON v.id_producto = p.id  
	LEFT JOIN ubicaciones u ON su.id_ubicacion = u.id
	WHERE su.id_variante = ? AND su.id_ubicacion = ?`;
	
	const stock = await new Promise((resolve, reject) => {
		db.get(query, [varianteId, ubicacionId], (err, row) => err ? reject(err) : resolve(row));
	});
	
	if (!stock) {
		return res.json({ 
			success: true, 
			isOk: true,
			data: { 
				cantidad_disponible: 0,
				mensaje: 'No hay stock en esta ubicación' 
			} 
		});
	}
	
	res.json({ success: true, isOk: true, data: stock });
}));

module.exports = router;