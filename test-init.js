/**
 * Script de prueba para inicializar la base de datos ColchonesW
 */

const database = require('./backend-api/src/config/database');

async function testInit() {
    try {
        console.log('🧪 Iniciando prueba de inicialización...');
        
        await database.initializeDatabase();
        
        const db = database.getDb();
        
        // Verificar que las tablas existen
        const tables = await new Promise((resolve, reject) => {
            db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log('📋 Tablas creadas:', tables.map(t => t.name));
        
        // Probar consulta simple
        const categorias = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM categorias", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log('📊 Categorías de ejemplo:', categorias);
        
        await database.close();
        console.log('✅ Prueba completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    }
}

testInit();