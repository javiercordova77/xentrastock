/**
 * Rutas para Colores de Variantes
 * Gestiona los endpoints para los colores disponibles de cada variante
 */

const express = require('express');
const router = express.Router();
const ColoresVariantesController = require('../controllers/ColoresVariantesController');

// GET /api/colores-variantes - Obtener todos los colores
router.get('/', ColoresVariantesController.obtenerTodos);

// GET /api/colores-variantes/:id - Obtener color específico por ID
router.get('/:id', ColoresVariantesController.obtenerPorId);

// GET /api/colores-variantes/variante/:varianteId - Obtener colores de una variante específica
router.get('/variante/:varianteId', ColoresVariantesController.obtenerColoresPorVariante);

// POST /api/colores-variantes - Crear nuevo color para variante
router.post('/', ColoresVariantesController.crear);

// PUT /api/colores-variantes/:id - Actualizar color de variante
router.put('/:id', ColoresVariantesController.actualizar);

// DELETE /api/colores-variantes/:id - Eliminar color de variante (soft delete)
router.delete('/:id', ColoresVariantesController.eliminar);

module.exports = router;