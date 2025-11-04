// Diagnóstico específico para el módulo de Inventario
console.log('🔧 Diagnóstico del módulo Inventario...');

// 1. Verificar que las funciones existen
console.log('\n📋 Verificando funciones del inventario:');
if (typeof getInventarioHTML === 'function') {
    console.log('✅ getInventarioHTML existe');
} else {
    console.log('❌ getInventarioHTML NO existe');
}

if (typeof initInventario === 'function') {
    console.log('✅ initInventario existe');
} else {
    console.log('❌ initInventario NO existe');
}

if (typeof loadInventarioData === 'function') {
    console.log('✅ loadInventarioData existe');
} else {
    console.log('❌ loadInventarioData NO existe');
}

// 2. Probar el endpoint directamente
console.log('\n🌐 Probando endpoint del inventario:');
fetch('http://localhost:3001/api/inventario-legacy/inventario-legacy')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    })
    .then(data => {
        console.log(`✅ Endpoint funciona: ${data.data.length} items encontrados`);
        console.log(`📊 Stock total: ${data.totales.stock_total} unidades`);
        console.log(`💰 Valor total: $${data.totales.valor_total}`);
        console.log('📄 Primeros 3 items:', data.data.slice(0, 3));
    })
    .catch(error => {
        console.log('❌ Error en endpoint:', error.message);
    });

// 3. Verificar si hay errores en la consola
console.log('\n🔍 Para ver errores, haz clic en "Inventario" en el sidebar y revisa la consola...');

console.log('\n✅ Diagnóstico del inventario completado');