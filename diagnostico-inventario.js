/**
 * Script de diagnóstico específico para el problema del inventario
 * Simula la carga exacta de datos y el flujo del frontend
 */

console.log('🔬 DIAGNÓSTICO ESPECÍFICO DEL INVENTARIO');
console.log('===============================================\n');

// Función para simular filterData
function filterData(data, type) {
    if (!data || !Array.isArray(data)) {
        console.log(`⚠️ filterData recibió datos inválidos:`, typeof data);
        return [];
    }
    return data.filter(item => item.tipo === type);
}

// Test 1: Verificar endpoint ColchonesW actual
async function test1_endpointColchonesW() {
    console.log('1️⃣ Probando endpoint ColchonesW actual...');
    try {
        const response = await fetch('http://localhost:3001/api/inventario-colchonesw');
        const data = await response.json();
        
        if (data.isOk && data.data) {
            console.log('✅ Endpoint ColchonesW funcionando');
            console.log(`📊 ${data.data.length} variantes encontradas`);
            
            // Analizar estructura de ubicaciones
            let totalUbicaciones = 0;
            data.data.forEach(variante => {
                if (variante.ubicaciones) {
                    totalUbicaciones += variante.ubicaciones.length;
                }
            });
            console.log(`📍 ${totalUbicaciones} ubicaciones con stock`);
            
            return data.data;
        } else {
            throw new Error('Endpoint no devuelve datos válidos');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// Test 2: Simular procesamiento de datos del inventario
async function test2_simularProcesamiento(inventarioData) {
    console.log('\n2️⃣ Simulando procesamiento de datos del inventario...');
    
    if (!inventarioData) {
        console.error('❌ No hay datos para procesar');
        return [];
    }
    
    const realInventarioData = [];
    
    inventarioData.forEach(variante => {
        if (variante.ubicaciones && variante.ubicaciones.length > 0) {
            variante.ubicaciones.forEach(ubicacion => {
                realInventarioData.push({
                    tipo: 'inventario',
                    id: `${variante.variante_id}-${ubicacion.ubicacion_id}`,
                    productoId: variante.producto_id,
                    productoNombre: variante.producto_descripcion,
                    varianteId: variante.variante_id,
                    varianteSku: variante.codigo_variante,
                    varianteDetalle: `${variante.medida}${variante.material ? ' - ' + variante.material : ''}`,
                    ubicacionId: ubicacion.ubicacion_id,
                    ubicacionNombre: ubicacion.ubicacion_nombre,
                    categoria: variante.categoria_nombre,
                    proveedor: variante.proveedor_nombre,
                    cantidad: ubicacion.stock_disponible || 0,
                    stockMinimo: ubicacion.stock_minimo || 5,
                    stockMaximo: (ubicacion.stock_minimo || 5) * 4,
                    precioUnitario: variante.precio_venta || 0,
                    valorTotal: (ubicacion.stock_disponible || 0) * (variante.precio_venta || 0),
                    estado: ubicacion.estado_stock || 'normal'
                });
            });
        }
    });
    
    console.log(`✅ Datos procesados: ${realInventarioData.length} items de inventario`);
    
    // Mostrar muestra de datos procesados
    console.log('\n📋 Muestra de datos procesados:');
    realInventarioData.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.varianteSku} - ${item.varianteDetalle}`);
        console.log(`      📦 Stock: ${item.cantidad} en ${item.ubicacionNombre}`);
        console.log(`      💰 Valor: $${item.valorTotal}`);
    });
    
    return realInventarioData;
}

// Test 3: Verificar endpoint legacy vs ColchonesW
async function test3_compararEndpoints() {
    console.log('\n3️⃣ Comparando endpoints legacy vs ColchonesW...');
    
    try {
        // Legacy endpoint
        const legacyResponse = await fetch('http://localhost:3001/api/legacy/data');
        const legacyData = await legacyResponse.json();
        const legacyVariantes = legacyData.data ? legacyData.data.filter(item => item.tipo === 'variante') : [];
        
        // ColchonesW endpoint
        const colchonesResponse = await fetch('http://localhost:3001/api/inventario-colchonesw');
        const colchonesData = await colchonesResponse.json();
        const colchonesVariantes = colchonesData.data || [];
        
        console.log(`📊 Legacy endpoint: ${legacyVariantes.length} variantes`);
        console.log(`📊 ColchonesW endpoint: ${colchonesVariantes.length} variantes`);
        
        // Analizar diferencias
        if (legacyVariantes.length !== colchonesVariantes.length) {
            console.log('⚠️ Diferencia en cantidad de variantes entre endpoints');
        }
        
        return { legacy: legacyVariantes, colchones: colchonesVariantes };
    } catch (error) {
        console.error('❌ Error comparando endpoints:', error.message);
        return null;
    }
}

// Test 4: Simular inicialización de app.data
async function test4_simularAppData() {
    console.log('\n4️⃣ Simulando inicialización de app.data...');
    
    try {
        const response = await fetch('http://localhost:3001/api/legacy/data');
        const result = await response.json();
        
        if (result.isOk && result.data) {
            const appData = result.data;
            console.log(`✅ app.data simulado con ${appData.length} registros`);
            
            // Filtrar por tipos
            const tipos = {};
            appData.forEach(item => {
                tipos[item.tipo] = (tipos[item.tipo] || 0) + 1;
            });
            
            console.log('📋 Tipos disponibles en app.data:', tipos);
            
            // Verificar si hay datos de inventario en app.data
            const inventarioEnAppData = filterData(appData, 'inventario');
            console.log(`📦 Items de inventario en app.data: ${inventarioEnAppData.length}`);
            
            if (inventarioEnAppData.length === 0) {
                console.log('⚠️ NO HAY DATOS DE INVENTARIO EN APP.DATA - Este es el problema!');
                console.log('💡 El fallback no funcionará porque app.data no tiene tipo "inventario"');
            }
            
            return appData;
        } else {
            throw new Error('No se pudo cargar app.data');
        }
    } catch (error) {
        console.error('❌ Error simulando app.data:', error.message);
        return [];
    }
}

// Test 5: Diagnóstico de renderizado
function test5_diagnosticoRenderizado(inventarioData) {
    console.log('\n5️⃣ Diagnóstico de renderizado...');
    
    if (!inventarioData || inventarioData.length === 0) {
        console.log('❌ NO HAY DATOS PARA RENDERIZAR');
        console.log('💡 Posibles causas:');
        console.log('   - Error en procesamiento de datos');
        console.log('   - Error en función renderInventarioTable()');
        console.log('   - Error en DOM elements');
        return false;
    }
    
    console.log(`✅ Hay ${inventarioData.length} items para renderizar`);
    
    // Verificar estadísticas
    const stats = {
        totalItems: inventarioData.length,
        totalStock: inventarioData.reduce((sum, item) => sum + item.cantidad, 0),
        valorTotal: inventarioData.reduce((sum, item) => sum + item.valorTotal, 0),
        stockBajo: inventarioData.filter(item => item.cantidad <= item.stockMinimo).length
    };
    
    console.log('📊 Estadísticas calculadas:');
    console.log(`   Items: ${stats.totalItems}`);
    console.log(`   Stock total: ${stats.totalStock}`);
    console.log(`   Valor total: $${stats.valorTotal.toFixed(2)}`);
    console.log(`   Items con stock bajo: ${stats.stockBajo}`);
    
    return true;
}

// Ejecutar todos los tests
async function ejecutarDiagnostico() {
    const inventarioData = await test1_endpointColchonesW();
    const inventarioProcesado = await test2_simularProcesamiento(inventarioData);
    await test3_compararEndpoints();
    const appData = await test4_simularAppData();
    const renderOK = test5_diagnosticoRenderizado(inventarioProcesado);
    
    console.log('\n🎯 DIAGNÓSTICO FINAL:');
    console.log('====================');
    
    if (inventarioData && inventarioProcesado.length > 0) {
        console.log('✅ Los datos se cargan y procesan correctamente');
        if (renderOK) {
            console.log('✅ Los datos están listos para renderizar');
            console.log('\n💡 SOLUCIÓN RECOMENDADA:');
            console.log('   El problema podría estar en:');
            console.log('   1. Función renderInventarioTable() no encuentra elementos DOM');
            console.log('   2. Error JavaScript que impide la ejecución');
            console.log('   3. Timing entre carga de SDK y carga de módulo');
        } else {
            console.log('❌ Problema en datos para renderizado');
        }
    } else {
        console.log('❌ Problema fundamental en carga de datos');
    }
    
    console.log('\n🔍 Para continuar diagnóstico, revisar:');
    console.log('   - Consola del navegador en http://localhost:3000');
    console.log('   - Función renderInventarioTable() en js/inventario.js');
    console.log('   - Elementos DOM del inventario');
}

// Ejecutar diagnóstico
ejecutarDiagnostico().catch(error => {
    console.error('💥 Error en diagnóstico:', error);
});