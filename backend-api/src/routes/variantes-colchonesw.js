/**
 * Rutas para Variantes - ColchonesW
 * Gestiona las variantes de productos con medidas, precios y stock
 */

const express = require('express');
const router = express.Router();
const VariantesController = require('../controllers/VariantesController');

// GET /api/variantes - Obtener todas las variantes
router.get('/', VariantesController.obtenerTodas);

// GET /api/variantes/:id - Obtener variante específica por ID
router.get('/:id', VariantesController.obtenerPorId);

// GET /api/variantes/producto/:productoId - Obtener variantes de un producto específico
router.get('/producto/:productoId', VariantesController.obtenerPorProducto);

// POST /api/variantes - Crear nueva variante
router.post('/', VariantesController.crear);

// PUT /api/variantes/:id - Actualizar variante
router.put('/:id', VariantesController.actualizar);

// DELETE /api/variantes/:id - Eliminar variante (soft delete)
router.delete('/:id', VariantesController.eliminar);

module.exports = router;