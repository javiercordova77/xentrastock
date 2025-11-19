/**
 * Rutas principales de la API
 */

const express = require('express');
const router = express.Router();

// Importar rutas específicas
const proveedoresRoutes = require('./proveedores');
const categoriasRoutes = require('./categorias');
const ubicacionesRoutes = require('./ubicaciones');
const productosRoutes = require('./productos');
const variantesRoutes = require('./variantes');
const coloresVariantesRoutes = require('./colores-variantes');
const inventarioRoutes = require('./stockinventario');
const inventarioLegacyRoutes = require('./inventario-legacy');
const movimientosRoutes = require('./movimientos');
const transferenciasRoutes = require('./transferencias');
const reportesRoutes = require('./reportes');
const legacyRoutes = require('./legacy');

// Configurar rutas
router.use('/proveedores', proveedoresRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/ubicaciones', ubicacionesRoutes);
router.use('/productos', productosRoutes);
router.use('/variantes', variantesRoutes);
router.use('/colores-variantes', coloresVariantesRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/inventario-legacy', inventarioLegacyRoutes);
router.use('/movimientos', movimientosRoutes);
router.use('/transferencias', transferenciasRoutes);
router.use('/reportes', reportesRoutes);
router.use('/legacy', legacyRoutes);

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
            movimientos: '/api/movimientos',
            transferencias: '/api/transferencias',
            reportes: '/api/reportes',
            legacy_data: '/api/legacy/data'
        }
    });
});

module.exports = router;