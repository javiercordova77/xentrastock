/**
 * Rutas para Productos - ColchonesW
 * Gestiona productos con variantes, colores e imágenes
 */

const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/ProductosController');

// Configurar multer para subida de imágenes
const upload = ProductosController.setupImageUpload();

// GET /api/productos - Obtener todos los productos
router.get('/', ProductosController.obtenerTodos);

// GET /api/productos/:id - Obtener producto específico por ID
router.get('/:id', ProductosController.obtenerPorId);

// POST /api/productos - Crear nuevo producto (con imagen opcional)
router.post('/', upload.single('imagen'), ProductosController.crear);

// PUT /api/productos/:id - Actualizar producto (con imagen opcional)
router.put('/:id', upload.single('imagen'), ProductosController.actualizar);

// DELETE /api/productos/:id - Eliminar producto (soft delete)
router.delete('/:id', ProductosController.eliminar);

module.exports = router;