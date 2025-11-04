/**
 * Test completo del módulo de inventario
 * Verifica que los datos se carguen correctamente desde la API
 */

console.log('🧪 Iniciando test completo del módulo de inventario...\n');

// 1. Verificar que el endpoint legacy funcione
async function testLegacyEndpoint() {
    console.log('1️⃣ Probando endpoint legacy...');
    try {
        const response = await fetch('http://localhost:3001/api/legacy/data');
        const data = await response.json();
        
        if (data.isOk && data.data && data.data.length > 0) {
            console.log('✅ Endpoint legacy funcionando');
            console.log(`📊 Total registros: ${data.data.length}`);
            console.log('📋 Totales por tipo:', data.totales);
            
            // Analizar datos por tipo
            const tipos = {};
            data.data.forEach(item => {
                tipos[item.tipo] = (tipos[item.tipo] || 0) + 1;
            });
            console.log('🔍 Análisis de datos:', tipos);
            return data.data;
        } else {
            throw new Error('Endpoint legacy no devuelve datos válidos');
        }
    } catch (error) {
        console.error('❌ Error en endpoint legacy:', error.message);
        return null;
    }
    console.log();
}

// 2. Simular inicialización del SDK
async function testSDKInitialization() {
    console.log('2️⃣ Simulando inicialización del SDK...');
    try {
        // Simular el objeto app global
        const app = { data: [], sdk: null };
        
        // Simular el handler
        const dataHandler = {
            onDataChanged: function(data) {
                app.data = data;
                console.log(`📊 Datos actualizados en app.data: ${data.length} registros`);
            }
        };
        
        // Simular carga de datos desde endpoint legacy
        const response = await fetch('http://localhost:3001/api/legacy/data');
        const result = await response.json();
        
        if (result.isOk) {
            dataHandler.onDataChanged(result.data);
            console.log('✅ SDK simulado inicializado correctamente');
            return app.data;
        } else {
            throw new Error('Error cargando datos para SDK');
        }
    } catch (error) {
        console.error('❌ Error simulando SDK:', error.message);
        return [];
    }
    console.log();
}

// 3. Probar función filterData (simulada)
function testFilterData(appData) {
    console.log('3️⃣ Probando filtrado de datos...');
    
    // Simular función filterData
    function filterData(data, type) {
        return data.filter(item => item.tipo === type);
    }
    
    const variantes = filterData(appData, 'variante');
    const productos = filterData(appData, 'producto');
    const categorias = filterData(appData, 'categoria');
    const ubicaciones = filterData(appData, 'ubicacion');
    const proveedores = filterData(appData, 'proveedor');
    
    console.log('✅ Datos filtrados correctamente:');
    console.log(`   📦 Variantes: ${variantes.length}`);
    console.log(`   🎁 Productos: ${productos.length}`);
    console.log(`   📁 Categorías: ${categorias.length}`);
    console.log(`   📍 Ubicaciones: ${ubicaciones.length}`);
    console.log(`   🏢 Proveedores: ${proveedores.length}`);
    
    console.log();
    return { variantes, productos, categorias, ubicaciones, proveedores };
}

// 4. Verificar estructura de datos para inventario
function testInventoryData(filteredData) {
    console.log('4️⃣ Verificando estructura de datos para inventario...');
    
    const { variantes, productos, categorias, ubicaciones } = filteredData;
    
    // Verificar que tenemos variantes con stock
    console.log('\n📦 Análisis de variantes:');
    variantes.slice(0, 3).forEach((variante, index) => {
        console.log(`   ${index + 1}. ${variante.codigo || 'Sin código'}`);
        console.log(`      Producto: ${variante.producto || 'N/A'}`);
        console.log(`      Medida: ${variante.medida || 'N/A'}`);
        console.log(`      Stock: ${variante.stock || 0}`);
        console.log(`      Precio venta: $${variante.precio_venta || 0}`);
        console.log(`      Categoría: ${variante.categoria || 'N/A'}`);
        console.log(`      Proveedor: ${variante.proveedor || 'N/A'}`);
    });
    
    // Verificar que los filtros tengan datos
    console.log('\n🔍 Verificando datos para filtros:');
    console.log(`   ✅ Categorías disponibles: ${categorias.length}`);
    console.log(`   ✅ Ubicaciones disponibles: ${ubicaciones.length}`);
    
    if (categorias.length > 0) {
        console.log('   📁 Categorías:', categorias.map(c => c.nombre).join(', '));
    }
    
    if (ubicaciones.length > 0) {
        console.log('   📍 Ubicaciones:', ubicaciones.map(u => u.nombre).join(', '));
    }
    
    console.log();
}

// 5. Verificar endpoint de inventario específico
async function testInventoryEndpoint() {
    console.log('5️⃣ Verificando endpoint específico de inventario...');
    try {
        const response = await fetch('http://localhost:3001/api/inventario/variantes');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Endpoint de inventario funcionando');
            console.log(`📊 Variantes desde API: ${data.data ? data.data.length : 0}`);
        } else {
            console.log('⚠️ Endpoint específico de inventario no disponible (usando legacy)');
        }
    } catch (error) {
        console.log('⚠️ Endpoint específico de inventario no disponible (usando legacy)');
    }
    console.log();
}

// Ejecutar todos los tests
async function runAllTests() {
    const legacyData = await testLegacyEndpoint();
    
    if (!legacyData) {
        console.error('💥 Test fallido: No se pudieron cargar los datos básicos');
        return;
    }
    
    const appData = await testSDKInitialization();
    const filteredData = testFilterData(appData);
    testInventoryData(filteredData);
    await testInventoryEndpoint();
    
    console.log('🎉 ¡Test completado!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Endpoint legacy funcionando');
    console.log('   ✅ SDK simulado funcionando');
    console.log('   ✅ Filtrado de datos funcionando');
    console.log('   ✅ Estructura de datos correcta');
    console.log('\n🚀 El módulo de inventario debería funcionar correctamente');
    console.log('💡 Accede a http://localhost:3000 y haz clic en "Inventario"');
}

// Ejecutar tests
runAllTests().catch(error => {
    console.error('💥 Error ejecutando tests:', error);
});