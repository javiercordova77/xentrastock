/**
 * Test específico para la funcionalidad de Proveedores
 * Verifica que las validaciones y el CRUD funcionen correctamente
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testProveedores() {
    console.log('🧪 Iniciando pruebas de Proveedores...\n');
    
    let testsPasados = 0;
    let testsTotal = 0;

    // Test 1: Listar proveedores
    testsTotal++;
    try {
        console.log('1️⃣ Probando GET /proveedores...');
        const response = await axios.get(`${BASE_URL}/proveedores`);
        
        if (response.status === 200 && response.data.success) {
            console.log('   ✅ SUCCESS - Listado de proveedores funciona');
            console.log(`   📊 Total proveedores: ${response.data.count}`);
            testsPasados++;
        } else {
            console.log('   ❌ FAILED - Respuesta inesperada');
        }
    } catch (error) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
    }

    // Test 2: Crear proveedor válido
    testsTotal++;
    try {
        console.log('\n2️⃣ Probando POST /proveedores (datos válidos)...');
        const nuevoProveedor = {
            nombre: `Proveedor Test ${Date.now()}`,
            contacto: 'Juan Perez',
            telefono: '123-456-7890',
            email: 'juan@test.com',
            direccion: 'Calle Test 123',
            activo: true
        };
        
        const response = await axios.post(`${BASE_URL}/proveedores`, nuevoProveedor);
        
        if (response.status === 201 && response.data.success) {
            console.log('   ✅ SUCCESS - Creación de proveedor funciona');
            console.log(`   📝 ID creado: ${response.data.data.id}`);
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
        console.log('\n3️⃣ Probando POST /proveedores (datos inválidos)...');
        const datosInvalidos = {
            nombre: '', // Nombre vacío (debe fallar)
            email: 'email-invalido' // Email mal formateado
        };
        
        const response = await axios.post(`${BASE_URL}/proveedores`, datosInvalidos);
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

    // Test 4: Crear proveedor solo con nombre (mínimo requerido)
    testsTotal++;
    try {
        console.log('\n4️⃣ Probando POST /proveedores (solo nombre)...');
        const proveedorMinimo = {
            nombre: `Proveedor Mínimo ${Date.now()}`
        };
        
        const response = await axios.post(`${BASE_URL}/proveedores`, proveedorMinimo);
        
        if (response.status === 201 && response.data.success) {
            console.log('   ✅ SUCCESS - Creación con datos mínimos funciona');
            console.log(`   📝 Proveedor: ${response.data.data.nombre}`);
            testsPasados++;
        } else {
            console.log('   ❌ FAILED - Respuesta inesperada');
        }
    } catch (error) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
    }

    // Test 5: Validación de email válido
    testsTotal++;
    try {
        console.log('\n5️⃣ Probando POST /proveedores (email válido)...');
        const proveedorEmailValido = {
            nombre: `Proveedor Email ${Date.now()}`,
            email: 'correo@valido.com'
        };
        
        const response = await axios.post(`${BASE_URL}/proveedores`, proveedorEmailValido);
        
        if (response.status === 201 && response.data.success) {
            console.log('   ✅ SUCCESS - Email válido aceptado');
            console.log(`   📧 Email: ${response.data.data.email}`);
            testsPasados++;
        } else {
            console.log('   ❌ FAILED - Respuesta inesperada');
        }
    } catch (error) {
        console.log(`   ❌ FAILED - Error: ${error.message}`);
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE PRUEBAS DE PROVEEDORES:');
    console.log(`✅ Exitosas: ${testsPasados}/${testsTotal}`);
    console.log(`❌ Fallidas: ${testsTotal - testsPasados}/${testsTotal}`);
    console.log(`📈 Tasa de éxito: ${Math.round((testsPasados/testsTotal) * 100)}%`);

    if (testsPasados === testsTotal) {
        console.log('\n🎉 TODAS LAS PRUEBAS DE PROVEEDORES PASARON');
        console.log('🚀 Frontend listo para crear proveedores sin errores');
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
testProveedores();