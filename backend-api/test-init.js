/**
 * Script de prueba para inicialización de base de datos
 */

const database = require('./src/config/database');

async function testInit() {
    try {
        console.log('🔄 Iniciando prueba de base de datos...');
        
        // Inicializar base de datos
        await database.initializeDatabase();
        
        // Verificar conexión
        const db = database.getDb();
        if (!db) {
            throw new Error('No hay conexión de base de datos');
        }
        
        // Probar una consulta simple
        await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM categorias', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Prueba exitosa - Categorías encontradas:', row.count);
                    resolve();
                }
            });
        });
        
        console.log('🎉 Todas las pruebas pasaron correctamente');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
        process.exit(1);
    } finally {
        await database.close();
    }
}

testInit();