/**
 * Rutas principales de la API
 */

const express = require('express');
const router = express.Router();

// Importar rutas específicas
const proveedoresRoutes = require('./proveedores');
const categoriasRoutes = require('./categorias');
const ubicacionesRoutes = require('./ubicaciones');
const productosRoutes = require('./productos-colchonesw');
const variantesRoutes = require('./variantes-colchonesw');
const coloresVariantesRoutes = require('./colores-variantes');
const inventarioRoutes = require('./inventario-colchonesw');
const movimientosRoutes = require('./movimientos');
const transferenciasRoutes = require('./transferencias');
const reportesRoutes = require('./reportes');

// Configurar rutas
router.use('/proveedores', proveedoresRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/ubicaciones', ubicacionesRoutes);
router.use('/productos', productosRoutes);
router.use('/variantes', variantesRoutes);
router.use('/colores-variantes', coloresVariantesRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/inventario-colchonesw', inventarioRoutes);
router.use('/movimientos', movimientosRoutes);
router.use('/transferencias', transferenciasRoutes);
router.use('/reportes', reportesRoutes);

// Ruta de información de la API
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'XentraStock v3.0 API',
        version: '3.0.0',
        endpoints: {
            proveedores: '/api/proveedores',
            categorias: '/api/categorias',
            ubicaciones: '/api/ubicaciones',
            productos: '/api/productos',
            variantes: '/api/variantes',
            colores_variantes: '/api/colores-variantes',
            inventario: '/api/inventario',
            inventario_colchonesw: '/api/inventario-colchonesw',
            movimientos: '/api/movimientos',
            transferencias: '/api/transferencias',
            reportes: '/api/reportes'
        }
    });
});

module.exports = router;