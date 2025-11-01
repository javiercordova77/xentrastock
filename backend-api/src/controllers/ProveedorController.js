/**
 * Controlador para gestión de proveedores
 */

const { validationResult } = require('express-validator');
const ProveedorService = require('../services/ProveedorService');

class ProveedorController {
    async getAll(req, res) {
        try {
            const { activo, search } = req.query;
            const proveedores = await ProveedorService.getAll({ activo, search });
            
            res.json({
                success: true,
                data: proveedores,
                count: proveedores.length
            });
        } catch (error) {
            throw error;
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const proveedor = await ProveedorService.getById(id);
            
            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            res.json({
                success: true,
                data: proveedor
            });
        } catch (error) {
            throw error;
        }
    }

    async create(req, res) {
        try {
            // Validar datos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const proveedor = await ProveedorService.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Proveedor creado exitosamente',
                data: proveedor
            });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un proveedor con ese nombre'
                });
            }
            throw error;
        }
    }

    async update(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const proveedor = await ProveedorService.update(id, req.body);
            
            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Proveedor actualizado exitosamente',
                data: proveedor
            });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un proveedor con ese nombre'
                });
            }
            throw error;
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await ProveedorService.delete(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Proveedor eliminado exitosamente'
            });
        } catch (error) {
            if (error.message.includes('FOREIGN KEY constraint failed')) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el proveedor porque tiene productos asociados'
                });
            }
            throw error;
        }
    }
}

module.exports = new ProveedorController();