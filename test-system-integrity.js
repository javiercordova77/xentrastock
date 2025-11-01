/**
 * Test completo del sistema después de arreglos de rate limiting
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testSystemIntegrity() {
    console.log('🔍 Verificando integridad del sistema post-arreglos...\n');
    
    const tests = [
        {
            name: 'Health Check',
            test: () => axios.get('http://localhost:3001/health')
        },
        {
            name: 'Listar Categorías',
            test: () => axios.get(`${BASE_URL}/categorias`)
        },
        {
            name: 'Crear Categoría',
            test: () => axios.post(`${BASE_URL}/categorias`, {
                nombre: `Cat Test ${Date.now()}`,
                descripcion: 'Categoría de prueba'
            })
        },
        {
            name: 'Listar Ubicaciones',
            test: () => axios.get(`${BASE_URL}/ubicaciones`)
        },
        {
            name: 'Crear Ubicación',
            test: () => axios.post(`${BASE_URL}/ubicaciones`, {
                nombre: `Ubicación Test ${Date.now()}`,
                descripcion: 'Ubicación de prueba',
                tipo: 'almacen'
            })
        },
        {
            name: 'Listar Productos',
            test: () => axios.get(`${BASE_URL}/productos`)
        },
        {
            name: 'Listar Variantes',
            test: () => axios.get(`${BASE_URL}/variantes`)
        },
        {
            name: 'Listar Movimientos',
            test: () => axios.get(`${BASE_URL}/movimientos`)
        },
        {
            name: 'Listar Transferencias',
            test: () => axios.get(`${BASE_URL}/transferencias`)
        },
        {
            name: 'Endpoint ColchonesW - Stock por Ubicación',
            test: () => axios.get(`${BASE_URL}/inventario-colchonesw/stock-ubicacion/1/1`)
        }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const [index, testItem] of tests.entries()) {
        try {
            console.log(`${index + 1}️⃣ ${testItem.name}...`);
            
            const response = await testItem.test();
            
            if (response.status >= 200 && response.status < 300) {
                console.log(`   ✅ SUCCESS (${response.status})`);
                
                // Mostrar información adicional para algunos endpoints
                if (testItem.name.includes('Listar') && response.data.data) {
                    console.log(`   📊 Registros: ${response.data.data.length || response.data.count || 'N/A'}`);
                }
                
                passedTests++;
            } else {
                console.log(`   ⚠️ WARNING (${response.status})`);
            }
            
        } catch (error) {
            console.log(`   ❌ FAILED: ${error.response?.status || 'ERROR'}`);
            
            if (error.response?.status === 429) {
                console.log(`   🚫 Rate limited: ${error.response.data.message}`);
            } else {
                console.log(`   💥 Error: ${error.message}`);
            }
        }
        
        // Pequeña pausa entre tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 RESUMEN FINAL:`);
    console.log(`✅ Exitosos: ${passedTests}/${totalTests}`);
    console.log(`❌ Fallidos: ${totalTests - passedTests}/${totalTests}`);
    console.log(`📈 Tasa de éxito: ${Math.round((passedTests/totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL');
        console.log('🚀 Listo para uso en producción');
    } else if (passedTests >= totalTests * 0.8) {
        console.log('\n⚠️ SISTEMA MAYORMENTE FUNCIONAL');
        console.log('🔧 Algunos ajustes menores pueden ser necesarios');
    } else {
        console.log('\n❌ SISTEMA CON PROBLEMAS SERIOS');
        console.log('🆘 Se requiere intervención urgente');
    }
}

// Ejecutar test
testSystemIntegrity();