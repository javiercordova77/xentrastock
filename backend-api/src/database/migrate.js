/**
 * Script de migración para actualizar la estructura de la base de datos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'xentrastock.db');

async function migrate() {
    console.log('🔄 Iniciando migración de base de datos...');
    
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ Error conectando a la base de datos:', err.message);
            process.exit(1);
        } else {
            console.log('✅ Conectado a la base de datos para migración');
        }
    });

    try {
        // Verificar si la tabla productos existe y qué columnas tiene
        const tableInfo = await new Promise((resolve, reject) => {
            db.all("PRAGMA table_info(productos)", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (tableInfo.length === 0) {
            console.log('📋 Tabla productos no existe, se creará con la nueva estructura');
            return;
        }

        const columnNames = tableInfo.map(col => col.name);
        console.log('📋 Columnas existentes en productos:', columnNames);

        // Verificar si necesitamos hacer la migración
        const needsMigration = !columnNames.includes('sku') || 
                              !columnNames.includes('precio') || 
                              !columnNames.includes('stock_minimo') || 
                              !columnNames.includes('stock_maximo');

        if (!needsMigration) {
            console.log('✅ La tabla productos ya tiene la estructura correcta');
            return;
        }

        console.log('🔄 Migrando tabla productos...');

        // 1. Crear tabla temporal con la nueva estructura
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE productos_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre VARCHAR(255) NOT NULL,
                    sku VARCHAR(50) NOT NULL UNIQUE,
                    descripcion TEXT,
                    categoria_id INTEGER NOT NULL,
                    proveedor_id INTEGER NOT NULL,
                    precio DECIMAL(10,2) DEFAULT 0,
                    stock_minimo INTEGER DEFAULT 0,
                    stock_maximo INTEGER DEFAULT 0,
                    imagen VARCHAR(500),
                    activo BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
                    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 2. Copiar datos existentes (generando SKUs automáticos)
        await new Promise((resolve, reject) => {
            const query = `
                INSERT INTO productos_new 
                (id, nombre, sku, descripcion, categoria_id, proveedor_id, precio, stock_minimo, stock_maximo, imagen, activo, created_at, updated_at)
                SELECT 
                    id, 
                    nombre,
                    'SKU-' || PRINTF('%06d', id) as sku,
                    descripcion,
                    categoria_id,
                    proveedor_id,
                    0 as precio,
                    0 as stock_minimo,
                    0 as stock_maximo,
                    imagen,
                    activo,
                    created_at,
                    updated_at
                FROM productos
            `;
            
            db.run(query, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 3. Eliminar tabla original
        await new Promise((resolve, reject) => {
            db.run('DROP TABLE productos', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 4. Renombrar tabla nueva
        await new Promise((resolve, reject) => {
            db.run('ALTER TABLE productos_new RENAME TO productos', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 5. Recrear índices
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id)',
            'CREATE INDEX IF NOT EXISTS idx_productos_proveedor ON productos(proveedor_id)',
            'CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku)'
        ];

        for (const index of indexes) {
            await new Promise((resolve, reject) => {
                db.run(index, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        console.log('✅ Migración de tabla productos completada exitosamente');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Error cerrando la base de datos:', err.message);
            } else {
                console.log('✅ Conexión de base de datos cerrada');
            }
        });
    }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    migrate()
        .then(() => {
            console.log('🎉 Migración completada exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la migración:', error);
            process.exit(1);
        });
}

module.exports = migrate;