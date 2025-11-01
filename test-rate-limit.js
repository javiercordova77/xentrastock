/**
 * Test de rate limiting - Verificar que no bloquee operaciones normales
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRateLimit() {
    console.log('🧪 Iniciando prueba intensiva de rate limiting...\n');
    
    const requests = [];
    const startTime = Date.now();
    
    // Hacer 50 peticiones simultáneas (similar a uso real)
    for (let i = 0; i < 50; i++) {
        const request = axios.get(`${BASE_URL}/api/categorias`)
            .then(response => ({
                index: i,
                status: response.status,
                success: true
            }))
            .catch(error => ({
                index: i,
                status: error.response?.status || 'ERROR',
                success: false,
                message: error.response?.data?.message || error.message
            }));
        
        requests.push(request);
    }
    
    console.log('📤 Enviando 50 peticiones simultáneas...');
    
    try {
        const results = await Promise.all(requests);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const rateLimited = results.filter(r => r.status === 429).length;
        
        console.log('\n📊 RESULTADOS:');
        console.log(`⏱️  Tiempo total: ${duration}ms`);
        console.log(`✅ Exitosas: ${successful}/50`);
        console.log(`❌ Fallidas: ${failed}/50`);
        console.log(`🚫 Rate limited: ${rateLimited}/50`);
        
        if (rateLimited > 0) {
            console.log('\n⚠️  RATE LIMIT DETECTADO:');
            results.filter(r => r.status === 429).forEach(r => {
                console.log(`   Request #${r.index}: ${r.message}`);
            });
        }
        
        if (successful >= 45) {
            console.log('\n🎉 PRUEBA EXITOSA: Rate limiting permite operaciones normales');
        } else {
            console.log('\n⚠️  ADVERTENCIA: Muchas peticiones bloqueadas');
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

// Ejecutar test
testRateLimit();