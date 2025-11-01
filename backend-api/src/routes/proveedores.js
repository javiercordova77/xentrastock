/**
 * Rutas para gestión de proveedores
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ProveedorController = require('../controllers/ProveedorController');
const { asyncHandler } = require('../middleware/errorHandler');

// Validaciones
const validarProveedor = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    body('contacto')
        .optional()
        .isLength({ max: 255 })
        .withMessage('El contacto no puede exceder 255 caracteres'),
    body('telefono')
        .optional()
        .isLength({ max: 50 })
        .withMessage('El teléfono no puede exceder 50 caracteres'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('El email debe tener un formato válido'),
    body('direccion')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La dirección no puede exceder 500 caracteres')
];

// Rutas
router.get('/', asyncHandler(ProveedorController.getAll));
router.get('/:id', asyncHandler(ProveedorController.getById));
router.post('/', validarProveedor, asyncHandler(ProveedorController.create));
router.put('/:id', validarProveedor, asyncHandler(ProveedorController.update));
router.delete('/:id', asyncHandler(ProveedorController.delete));

module.exports = router;