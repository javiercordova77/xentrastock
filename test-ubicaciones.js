/**
 * Test específico para la funcionalidad de Ubicaciones
 * Verifica que las validaciones y el CRUD funcionen correctamente
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testUbicaciones() {
    console.log('🧪 Iniciando pruebas de Ubicaciones...\n');
    
    let testsPasados = 0;
    let testsTotal = 0;

    // Test 1: Listar ubicaciones
    testsTotal++;
    try {
        console.log('1️⃣ Probando GET /ubicaciones...');
        const response = await axios.get(`${BASE_URL}/ubicaciones`);
        
        if (response.status === 200 && response.data.success) {
            console.log('   ✅ SUCCESS - Listado de ubicaciones funciona');
            console.log(`   📊 Total ubicaciones: ${response.data.count}`);
            testsPasados++;
        } else {
            console.log('   ❌ FAILED - Respuesta inesperada');
        }
    } catch (error) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
    }

    // Test 2: Crear ubicación válida
    testsTotal++;
    try {
        console.log('\n2️⃣ Probando POST /ubicaciones (datos válidos)...');
        const nuevaUbicacion = {
            nombre: `Ubicación Test ${Date.now()}`,
            descripcion: 'Ubicación creada por script de prueba',
            tipo: 'almacen'
        };
        
        const response = await axios.post(`${BASE_URL}/ubicaciones`, nuevaUbicacion);
        
        if (response.status === 201 && response.data.success) {
            console.log('   ✅ SUCCESS - Creación de ubicación funciona');
            console.log(`   📝 ID creado: ${response.data.data.id}`);
            console.log(`   📍 Nombre: ${response.data.data.nombre}`);
            testsPasados++;
        } else {
            console.log('   ❌ FAILED - Respuesta inesperada');
        }
    } catch (error) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
    }

    // Test 3: Validación de datos inválidos
    testsTotal++;
    try {
        console.log('\n3️⃣ Probando POST /ubicaciones (datos inválidos)...');
        const datosInvalidos = {
            nombre: '', // Nombre vacío (debe fallar)
            tipo: 'tipo-invalido' // Tipo inválido
        };
        
        const response = await axios.post(`${BASE_URL}/ubicaciones`, datosInvalidos);
        console.log('   ❌ FAILED - Debería haber rechazado datos inválidos');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('   ✅ SUCCESS - Validaciones funcionan correctamente');
            console.log(`   📝 Errores encontrados: ${error.response.data.errors?.length || 0}`);
            testsPasados++;
        } else {
            console.log(`   ❌ FAILED - Error inesperado: ${error.message}`);
        }
    }

    // Test 4: Crear ubicación solo con nombre (mínimo requerido)
    testsTotal++;
    try {
        console.log('\n4️⃣ Probando POST /ubicaciones (solo nombre)...');
        const ubicacionMinima = {
            nombre: `Ubicación Mínima ${Date.now()}`
        };
        
        const response = await axios.post(`${BASE_URL}/ubicaciones`, ubicacionMinima);
        
        if (response.status === 201 && response.data.success) {
            console.log('   ✅ SUCCESS - Creación con datos mínimos funciona');
            console.log(`   📝 Ubicación: ${response.data.data.nombre}`);
            console.log(`   📝 Tipo por defecto: ${response.data.data.tipo}`);
            testsPasados++;
        } else {
            console.log('   ❌ FAILED - Respuesta inesperada');
        }
    } catch (error) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
    }

    // Test 5: Tipos de ubicación válidos
    testsTotal++;
    try {
        console.log('\n5️⃣ Probando POST /ubicaciones (tipos válidos)...');
        const tiposValidos = ['almacen', 'tienda', 'showroom', 'deposito'];
        let tiposExitosos = 0;
        
        for (const tipo of tiposValidos) {
            try {
                const ubicacionTipo = {
                    nombre: `Test ${tipo} ${Date.now()}`,
                    tipo: tipo
                };
                
                const response = await axios.post(`${BASE_URL}/ubicaciones`, ubicacionTipo);
                
                if (response.status === 201 && response.data.success) {
                    tiposExitosos++;
                    console.log(`      ✅ Tipo "${tipo}" aceptado`);
                } else {
                    console.log(`      ❌ Tipo "${tipo}" falló`);
                }
            } catch (error) {
                console.log(`      ❌ Tipo "${tipo}" error: ${error.message}`);
            }
        }
        
        if (tiposExitosos === tiposValidos.length) {
            console.log('   ✅ SUCCESS - Todos los tipos válidos aceptados');
            testsPasados++;
        } else {
            console.log(`   ⚠️ PARTIAL - Solo ${tiposExitosos}/${tiposValidos.length} tipos funcionaron`);
        }
    } catch (error) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE PRUEBAS DE UBICACIONES:');
    console.log(`✅ Exitosas: ${testsPasados}/${testsTotal}`);
    console.log(`❌ Fallidas: ${testsTotal - testsPasados}/${testsTotal}`);
    console.log(`📈 Tasa de éxito: ${Math.round((testsPasados/testsTotal) * 100)}%`);

    if (testsPasados === testsTotal) {
        console.log('\n🎉 TODAS LAS PRUEBAS DE UBICACIONES PASARON');
        console.log('🚀 Frontend listo para crear ubicaciones sin errores');
    } else if (testsPasados >= testsTotal * 0.8) {
        console.log('\n⚠️ MAYORÍA DE PRUEBAS PASARON');
        console.log('🔧 Algunos ajustes menores pueden ser necesarios');
    } else {
        console.log('\n❌ MUCHAS PRUEBAS FALLARON');
        console.log('🆘 Se requiere revisión del sistema');
    }

    return {
        pasados: testsPasados,
        total: testsTotal,
        exito: testsPasados === testsTotal
    };
}

// Ejecutar pruebas
testUbicaciones();