/**
 * Endpoint legacy para compatibilidad con SDK v2.0
 * Combina datos de múltiples endpoints en formato legacy
 */

const express = require('express');
const router = express.Router();
const dbConfig = require('../config/database');

// Función helper para obtener la base de datos
function getDatabase() {
    return dbConfig.getDb();
}

// Ruta legacy que combina todos los datos
router.get('/data', async (req, res) => {
    try {
        console.log('📊 Cargando datos legacy para SDK...');
        
        const db = getDatabase();
        
        // Verificar que la base de datos esté conectada
        if (!db) {
            throw new Error('Base de datos no disponible');
        }
        
        let combinedData = [];
        
        // 1. Cargar proveedores
        const proveedores = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, nombre, actividad, telefono, email, direccion, 
                       activo, created_at, updated_at
                FROM proveedores 
                WHERE activo = 1
                ORDER BY nombre
            `, [], (err, rows) => {
                if (err) {
                    console.error('Error cargando proveedores:', err);
                    resolve([]);
                } else {
                    console.log('✅ Proveedores cargados:', rows.length);
                    resolve(rows);
                }
            });
        });
        
        proveedores.forEach(proveedor => {
            combinedData.push({
                tipo: 'proveedor',
                id: proveedor.id.toString(),
                nombre: proveedor.nombre,
                actividad: proveedor.actividad || '',
                telefono: proveedor.telefono || '',
                email: proveedor.email || '',
                direccion: proveedor.direccion || '',
                activo: proveedor.activo === 1
            });
        });

        // 2. Cargar categorías
        const categorias = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, nombre, descripcion, activo
                FROM categorias 
                WHERE activo = 1
                ORDER BY nombre
            `, [], (err, rows) => {
                if (err) {
                    console.error('Error cargando categorías:', err);
                    resolve([]);
                } else {
                    console.log('✅ Categorías cargadas:', rows.length);
                    resolve(rows);
                }
            });
        });
        
        categorias.forEach(categoria => {
            combinedData.push({
                tipo: 'categoria',
                id: categoria.id.toString(),
                nombre: categoria.nombre,
                descripcion: categoria.descripcion || '',
                activo: categoria.activo === 1
            });
        });

        // 3. Cargar ubicaciones
        const ubicaciones = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, nombre, descripcion, tipo, activo
                FROM ubicaciones 
                WHERE activo = 1
                ORDER BY nombre
            `, [], (err, rows) => {
                if (err) {
                    console.error('Error cargando ubicaciones:', err);
                    resolve([]);
                } else {
                    console.log('✅ Ubicaciones cargadas:', rows.length);
                    resolve(rows);
                }
            });
        });
        
        ubicaciones.forEach(ubicacion => {
            combinedData.push({
                tipo: 'ubicacion',
                id: ubicacion.id.toString(),
                nombre: ubicacion.nombre,
                descripcion: ubicacion.descripcion || '',
                tipoUbicacion: ubicacion.tipo || '',
                activo: ubicacion.activo === 1
            });
        });

        // 4. Cargar productos con categorías y proveedores
        const productos = await new Promise((resolve, reject) => {
            db.all(`
                SELECT p.id, p.descripcion, p.imagen, p.material, p.activo,
                       c.nombre as categoria_nombre,
                       pr.nombre as proveedor_nombre
                FROM productos p
                JOIN categorias c ON p.id_categoria = c.id
                JOIN proveedores pr ON p.id_proveedor = pr.id
                WHERE p.activo = 1
                ORDER BY p.descripcion
            `, [], (err, rows) => {
                if (err) {
                    console.error('Error cargando productos:', err);
                    resolve([]);
                } else {
                    console.log('✅ Productos cargados:', rows.length);
                    resolve(rows);
                }
            });
        });
        
        productos.forEach(producto => {
            combinedData.push({
                tipo: 'producto',
                id: producto.id.toString(),
                descripcion: producto.descripcion,
                imagen: producto.imagen || '',
                material: producto.material || '',
                categoria: producto.categoria_nombre,
                proveedor: producto.proveedor_nombre,
                activo: producto.activo === 1
            });
        });

        // 5. Cargar variantes con productos y stock
        const variantes = await new Promise((resolve, reject) => {
            db.all(`
                SELECT v.id, v.codigo_variante, v.medida, v.precio_venta, v.precio_compra,
                       v.fecha_ingreso, v.activo,
                       p.descripcion as producto_descripcion,
                       c.nombre as categoria_nombre,
                       pr.nombre as proveedor_nombre,
                       COALESCE(SUM(s.cantidad_disponible), 0) as stock_total
                FROM variantes v
                JOIN productos p ON v.id_producto = p.id
                JOIN categorias c ON p.id_categoria = c.id
                JOIN proveedores pr ON p.id_proveedor = pr.id
                LEFT JOIN stock_ubicaciones s ON v.id = s.id_variante
                WHERE v.activo = 1
                GROUP BY v.id
                ORDER BY p.descripcion, v.medida
            `, [], (err, rows) => {
                if (err) {
                    console.error('Error cargando variantes:', err);
                    resolve([]);
                } else {
                    console.log('✅ Variantes cargadas:', rows.length);
                    resolve(rows);
                }
            });
        });
        
        variantes.forEach(variante => {
            combinedData.push({
                tipo: 'variante',
                id: variante.id.toString(),
                codigo: variante.codigo_variante,
                medida: variante.medida || '',
                precio_venta: variante.precio_venta || 0,
                precio_compra: variante.precio_compra || 0,
                stock: variante.stock_total || 0,
                producto: variante.producto_descripcion,
                categoria: variante.categoria_nombre,
                proveedor: variante.proveedor_nombre,
                fecha_ingreso: variante.fecha_ingreso,
                activo: variante.activo === 1
            });
        });

        console.log('✅ Datos legacy cargados exitosamente');
        console.log('📋 Totales:', {
            proveedores: proveedores.length,
            categorias: categorias.length,
            ubicaciones: ubicaciones.length,
            productos: productos.length,
            variantes: variantes.length,
            total: combinedData.length
        });

        res.json({ 
            isOk: true, 
            success: true,
            data: combinedData,
            totales: {
                proveedores: proveedores.length,
                categorias: categorias.length,
                ubicaciones: ubicaciones.length,
                productos: productos.length,
                variantes: variantes.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error en endpoint legacy:', error);
        res.status(500).json({ 
            isOk: false,
            success: false, 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
});

module.exports = router;