/**
 * Servicio para gestión de proveedores
 */

const database = require('../config/database');

class ProveedorService {
    async getAll(filters = {}) {
        const db = database.getDb();
        const { activo, search } = filters;
        
        let query = 'SELECT * FROM proveedores WHERE 1=1';
        const params = [];

        if (activo !== undefined) {
            query += ' AND activo = ?';
            params.push(activo === 'true' ? 1 : 0);
        }

        if (search) {
            query += ' AND (nombre LIKE ? OR contacto LIKE ? OR email LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += ' ORDER BY nombre ASC';

        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async getById(id) {
        const db = database.getDb();
        
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM proveedores WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async create(data) {
        const db = database.getDb();
        const { 
            nombre, 
            contacto = null, 
            telefono = null, 
            email = null, 
            direccion = null,
            activo = 1 // valor por defecto
        } = data;
        
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO proveedores (nombre, contacto, telefono, email, direccion, activo)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.run(query, [nombre, contacto, telefono, email, direccion, activo], function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Obtener el registro creado
                    db.get('SELECT * FROM proveedores WHERE id = ?', [this.lastID], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                }
            });
        });
    }

    async update(id, data) {
        const db = database.getDb();
        const { 
            nombre, 
            contacto = null, 
            telefono = null, 
            email = null, 
            direccion = null, 
            activo = 1 
        } = data;
        
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE proveedores 
                SET nombre = ?, contacto = ?, telefono = ?, email = ?, direccion = ?, 
                    activo = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(query, [nombre, contacto, telefono, email, direccion, activo ? 1 : 0, id], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    resolve(null);
                } else {
                    // Obtener el registro actualizado
                    db.get('SELECT * FROM proveedores WHERE id = ?', [id], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                }
            });
        });
    }

    async delete(id) {
        const db = database.getDb();
        
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM proveedores WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    async getProductCount(id) {
        const db = database.getDb();
        
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT COUNT(*) as count FROM productos WHERE proveedor_id = ?',
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                }
            );
        });
    }
}

module.exports = new ProveedorService();