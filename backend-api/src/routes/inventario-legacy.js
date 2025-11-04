/**
 * SOLUCIÓN DEFINITIVA PARA EL INVENTARIO
 * 
 * Crea un endpoint específico que convierte los datos de ColchonesW
 * al formato que espera el frontend, sin afectar otros módulos
 */

const express = require('express');
const router = express.Router();
const database = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

// Endpoint específico para inventario que convierte datos ColchonesW al formato legacy
router.get('/inventario-legacy', asyncHandler(async (req, res) => {
    console.log('📊 Generando datos de inventario en formato legacy...');
    
    const db = database.getDb();
    
    // Consulta que obtiene el inventario como items individuales (como espera el frontend)
    const query = `
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
            su.cantidad_disponible,
            su.cantidad_minima as stock_minimo,
            CASE 
                WHEN su.cantidad_disponible <= su.cantidad_minima THEN 'bajo'
                WHEN su.cantidad_disponible >= (su.cantidad_minima * 3) THEN 'alto'
                ELSE 'normal'
            END as estado_stock
        FROM variantes v
        JOIN productos p ON v.id_producto = p.id
        JOIN categorias c ON p.id_categoria = c.id
        JOIN proveedores pr ON p.id_proveedor = pr.id
        LEFT JOIN stock_ubicaciones su ON v.id = su.id_variante
        LEFT JOIN ubicaciones u ON su.id_ubicacion = u.id
        WHERE v.activo = 1 
          AND (su.cantidad_disponible > 0 OR su.cantidad_disponible IS NULL)
        ORDER BY p.descripcion, v.medida, u.nombre
    `;

    const inventarioData = await new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error en consulta de inventario:', err);
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });

    // Convertir cada fila a formato que espera el frontend
    const inventarioLegacy = inventarioData
        .filter(item => item.ubicacion_id && item.cantidad_disponible > 0) // Solo items con ubicación y stock
        .map(item => ({
            // Formato exacto que espera el frontend
            tipo: 'inventario',
            id: `${item.variante_id}-${item.ubicacion_id}`,
            productoId: item.producto_id,
            productoNombre: item.producto_descripcion,
            varianteId: item.variante_id,
            varianteSku: item.codigo_variante,
            varianteDetalle: `${item.medida}${item.material ? ' - ' + item.material : ''}`,
            ubicacionId: item.ubicacion_id,
            ubicacionNombre: item.ubicacion_nombre,
            categoria: item.categoria_nombre,
            proveedor: item.proveedor_nombre,
            cantidad: item.cantidad_disponible || 0,
            stockMinimo: item.stock_minimo || 5,
            stockMaximo: (item.stock_minimo || 5) * 4,
            precioUnitario: item.precio_venta || 0,
            valorTotal: (item.cantidad_disponible || 0) * (item.precio_venta || 0),
            estado: item.estado_stock || 'normal'
        }));

    console.log(`✅ Inventario legacy generado: ${inventarioLegacy.length} items`);

    res.json({
        isOk: true,
        success: true,
        data: inventarioLegacy,
        message: 'Inventario en formato legacy',
        totales: {
            items: inventarioLegacy.length,
            stock_total: inventarioLegacy.reduce((sum, item) => sum + item.cantidad, 0),
            valor_total: inventarioLegacy.reduce((sum, item) => sum + item.valorTotal, 0),
            ubicaciones: [...new Set(inventarioLegacy.map(item => item.ubicacionId))].length
        }
    });
}));

module.exports = router;