/**
 * Configuración de base de datos SQLite para XentraStock v3.0 - ColchonesW
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/xentrastock.db');
const INIT_SQL_PATH = path.join(__dirname, '../database/init.sql');

class DatabaseConfig {
    constructor() {
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('❌ Error conectando a SQLite:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Conectado a SQLite:', DB_PATH);
                    // Habilitar foreign keys
                    this.db.run('PRAGMA foreign_keys = ON');
                    resolve(this.db);
                }
            });
        });
    }

    async initializeDatabase() {
        try {
            await this.connect();
            
            // Verificar si existe el archivo init.sql
            if (!fs.existsSync(INIT_SQL_PATH)) {
                console.warn('⚠️  Archivo init.sql no encontrado, usando estructura legacy');
                await this.createTablesLegacy();
                await this.createIndexes();
                await this.insertSeedData();
            } else {
                console.log('📄 Ejecutando init.sql para estructura ColchonesW...');
                await this.executeInitSQL();
            }
            
            console.log('✅ Base de datos inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando base de datos:', error);
            throw error;
        }
    }

    async executeInitSQL() {
        const initSQL = fs.readFileSync(INIT_SQL_PATH, 'utf8');
        
        // Limpiar comentarios de línea y dividir en statements más inteligentemente
        const cleanSQL = initSQL
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))  // Quitar comentarios de línea
            .join('\n')
            .replace(/\/\*[\s\S]*?\*\//g, '');  // Quitar comentarios de bloque

        // Dividir en statements usando punto y coma, pero solo cuando termine la línea
        const statements = cleanSQL
            .split(/;\s*\n/)
            .map(statement => statement.trim() + (statement.trim() && !statement.endsWith(';') ? ';' : ''))
            .filter(statement => statement.length > 2);  // Más que solo el punto y coma

        console.log(`📋 Ejecutando ${statements.length} statements SQL...`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim() && statement !== ';') {
                try {
                    await new Promise((resolve, reject) => {
                        this.db.run(statement, (err) => {
                            if (err) {
                                console.error(`❌ Error en statement ${i + 1}:`);
                                console.error('Statement:', statement.substring(0, 200) + '...');
                                console.error('Error:', err.message);
                                reject(err);
                            } else {
                                console.log(`✅ Statement ${i + 1} ejecutado correctamente`);
                                resolve();
                            }
                        });
                    });
                } catch (error) {
                    // Continuar con el siguiente statement si hay errores esperados
                    if (error.message.includes('already exists') || 
                        error.message.includes('duplicate column name')) {
                        console.warn(`⚠️  Advertencia en statement ${i + 1}:`, error.message);
                        continue;
                    } else {
                        throw error;
                    }
                }
            }
        }
        
        console.log('✅ Estructura ColchonesW creada exitosamente');
        
        // Verificar que las tablas se crearon
        await this.verifyTables();
    }

    async verifyTables() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
                if (err) {
                    reject(err);
                } else {
                    const tableNames = tables.map(table => table.name);
                    console.log('📋 Tablas creadas:', tableNames);
                    
                    const expectedTables = ['categorias', 'proveedores', 'productos', 'variantes', 'stock_ubicaciones'];
                    const missing = expectedTables.filter(table => !tableNames.includes(table));
                    
                    if (missing.length > 0) {
                        console.error('❌ Faltan tablas:', missing);
                        reject(new Error(`Faltan tablas: ${missing.join(', ')}`));
                    } else {
                        console.log('✅ Todas las tablas principales creadas correctamente');
                        resolve(tableNames);
                    }
                }
            });
        });
    }

    async createTablesLegacy() {
        const tables = [
            // Tabla Proveedores
            `CREATE TABLE IF NOT EXISTS proveedores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(255) NOT NULL UNIQUE,
                contacto VARCHAR(255),
                telefono VARCHAR(50),
                email VARCHAR(255),
                direccion TEXT,
                activo BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla Categorías
            `CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(255) NOT NULL UNIQUE,
                descripcion TEXT,
                activo BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla Ubicaciones
            `CREATE TABLE IF NOT EXISTS ubicaciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(255) NOT NULL UNIQUE,
                descripcion TEXT,
                tipo VARCHAR(50) DEFAULT 'almacen',
                activo BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Tabla Productos
            `CREATE TABLE IF NOT EXISTS productos (
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
            )`,

            // Tabla Variantes
            `CREATE TABLE IF NOT EXISTS variantes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                producto_id INTEGER NOT NULL,
                codigo VARCHAR(100) NOT NULL UNIQUE,
                nombre VARCHAR(255) NOT NULL,
                color VARCHAR(100),
                talla VARCHAR(50),
                precio_compra DECIMAL(10,2) DEFAULT 0,
                precio_venta DECIMAL(10,2) DEFAULT 0,
                stock_minimo INTEGER DEFAULT 0,
                activo BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
            )`,

            // Tabla Stock (inventario actual)
            `CREATE TABLE IF NOT EXISTS stock (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                variante_id INTEGER NOT NULL,
                ubicacion_id INTEGER NOT NULL,
                cantidad INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variante_id) REFERENCES variantes(id) ON DELETE CASCADE,
                FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE RESTRICT,
                UNIQUE(variante_id, ubicacion_id)
            )`,

            // Tabla Movimientos
            `CREATE TABLE IF NOT EXISTS movimientos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                variante_id INTEGER NOT NULL,
                ubicacion_id INTEGER NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                subtipo VARCHAR(50),
                cantidad INTEGER NOT NULL,
                precio_unitario DECIMAL(10,2),
                motivo VARCHAR(255),
                referencia VARCHAR(100),
                usuario VARCHAR(100),
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variante_id) REFERENCES variantes(id) ON DELETE RESTRICT,
                FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE RESTRICT
            )`,

            // Tabla Transferencias
            `CREATE TABLE IF NOT EXISTS transferencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                variante_id INTEGER NOT NULL,
                ubicacion_origen_id INTEGER NOT NULL,
                ubicacion_destino_id INTEGER NOT NULL,
                cantidad INTEGER NOT NULL,
                estado VARCHAR(50) DEFAULT 'pendiente',
                motivo VARCHAR(255),
                usuario VARCHAR(100),
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_completada DATETIME,
                FOREIGN KEY (variante_id) REFERENCES variantes(id) ON DELETE RESTRICT,
                FOREIGN KEY (ubicacion_origen_id) REFERENCES ubicaciones(id) ON DELETE RESTRICT,
                FOREIGN KEY (ubicacion_destino_id) REFERENCES ubicaciones(id) ON DELETE RESTRICT
            )`
        ];

        for (const table of tables) {
            await new Promise((resolve, reject) => {
                this.db.run(table, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }

        console.log('✅ Tablas legacy creadas correctamente');
    }

    async createIndexes() {
        const indexes = [
            // Índices para la estructura ColchonesW
            'CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(id_categoria)',
            'CREATE INDEX IF NOT EXISTS idx_productos_proveedor ON productos(id_proveedor)', 
            'CREATE INDEX IF NOT EXISTS idx_variantes_producto ON variantes(id_producto)',
            'CREATE INDEX IF NOT EXISTS idx_variantes_codigo ON variantes(codigo_variante)',
            'CREATE INDEX IF NOT EXISTS idx_stock_variante_ubicacion ON stock_ubicaciones(id_variante, id_ubicacion)',
            'CREATE INDEX IF NOT EXISTS idx_movimientos_variante ON movimientos(id_variante)',
            'CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha)',
            'CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo)',
            'CREATE INDEX IF NOT EXISTS idx_transferencias_variante ON transferencias(id_variante)',
            'CREATE INDEX IF NOT EXISTS idx_colores_variantes_variante ON colores_variantes(id_variante)',
            
            // Índices para la estructura legacy (por compatibilidad)
            'CREATE INDEX IF NOT EXISTS idx_productos_categoria_legacy ON productos(categoria_id)',
            'CREATE INDEX IF NOT EXISTS idx_productos_proveedor_legacy ON productos(proveedor_id)',
            'CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku)',
            'CREATE INDEX IF NOT EXISTS idx_variantes_producto_legacy ON variantes(producto_id)',
            'CREATE INDEX IF NOT EXISTS idx_variantes_codigo_legacy ON variantes(codigo)',
            'CREATE INDEX IF NOT EXISTS idx_stock_variante_ubicacion_legacy ON stock(variante_id, ubicacion_id)'
        ];

        for (const index of indexes) {
            try {
                await new Promise((resolve, reject) => {
                    this.db.run(index, (err) => {
                        if (err) {
                            // Ignorar errores de tablas que no existen
                            if (err.message.includes('no such table')) {
                                resolve();
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve();
                        }
                    });
                });
            } catch (error) {
                console.warn('⚠️  Error creando índice:', error.message);
            }
        }

        console.log('✅ Índices creados correctamente');
    }

    async insertSeedData() {
        // Verificar si ya hay datos
        const count = await new Promise((resolve, reject) => {
            this.db.get('SELECT COUNT(*) as count FROM categorias', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        if (count > 0) {
            console.log('📊 Datos semilla ya existen, omitiendo inserción');
            return;
        }

        const seedData = {
            categorias: [
                { nombre: 'Colchones', descripcion: 'Colchones de diferentes tipos y medidas' },
                { nombre: 'Almohadas', descripcion: 'Almohadas y cojines para el descanso' },
                { nombre: 'Bases', descripcion: 'Bases para colchones y somieres' },
                { nombre: 'Accesorios', descripcion: 'Protectores, sabanas y accesorios' }
            ],
            proveedores: [
                { nombre: 'Chaide', contacto: 'Representante Chaide', telefono: '555-0001', email: 'ventas@chaide.com' },
                { nombre: 'Lamitex', contacto: 'Representante Lamitex', telefono: '555-0002', email: 'pedidos@lamitex.com' },
                { nombre: 'Sueño Dorado', contacto: 'Carlos Mendoza', telefono: '555-0003', email: 'info@sueñodorado.com' }
            ],
            ubicaciones: [
                { nombre: 'Bodega Central', descripcion: 'Almacén principal - Matriz', tipo: 'almacen' },
                { nombre: 'Sala de Ventas', descripcion: 'Exhibición y ventas - Local principal', tipo: 'tienda' },
                { nombre: 'Showroom Norte', descripcion: 'Sala de exhibición - Sucursal norte', tipo: 'showroom' }
            ]
        };

        // Insertar categorías
        for (const categoria of seedData.categorias) {
            await new Promise((resolve, reject) => {
                this.db.run(
                    'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
                    [categoria.nombre, categoria.descripcion],
                    (err) => err ? reject(err) : resolve()
                );
            });
        }

        // Insertar proveedores
        for (const proveedor of seedData.proveedores) {
            await new Promise((resolve, reject) => {
                this.db.run(
                    'INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES (?, ?, ?, ?)',
                    [proveedor.nombre, proveedor.contacto, proveedor.telefono, proveedor.email],
                    (err) => err ? reject(err) : resolve()
                );
            });
        }

        // Insertar ubicaciones
        for (const ubicacion of seedData.ubicaciones) {
            await new Promise((resolve, reject) => {
                this.db.run(
                    'INSERT INTO ubicaciones (nombre, descripcion, tipo) VALUES (?, ?, ?)',
                    [ubicacion.nombre, ubicacion.descripcion, ubicacion.tipo],
                    (err) => err ? reject(err) : resolve()
                );
            });
        }

        console.log('✅ Datos semilla insertados correctamente');
    }

    getDb() {
        return this.db;
    }

    async close() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        console.error('❌ Error cerrando base de datos:', err);
                        reject(err);
                    } else {
                        console.log('✅ Conexión de base de datos cerrada');
                        this.db = null;
                        resolve();
                    }
                });
            });
        }
        return Promise.resolve();
    }
}

module.exports = new DatabaseConfig();