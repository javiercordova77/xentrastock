// Diagnóstico de XentraStock - Script de debug
console.log('🔧 Iniciando diagnóstico de XentraStock...');

// Verificar carga de scripts
const scripts = [
    'js/productos.js',
    'js/categorias.js', 
    'js/ubicaciones.js',
    'js/proveedores.js',
    'js/variantes.js',
    'js/inventario.js',
    'js/transferencias.js',
    'js/movimientos.js',
    'js/reportes.js'
];

console.log('📄 Scripts en el DOM:');
scripts.forEach(script => {
    const element = document.querySelector(`script[src="${script}"]`);
    if (element) {
        console.log(`✅ ${script} - Cargado`);
    } else {
        console.log(`❌ ${script} - NO encontrado`);
    }
});

// Verificar funciones disponibles
console.log('\n🔍 Funciones disponibles:');
const functions = [
    'getProveedoresHTML', 'initProveedores',
    'getCategoriasHTML', 'initCategorias',
    'getUbicacionesHTML', 'initUbicaciones', 
    'getProductosHTML', 'initProductos',
    'getVariantesHTML', 'initVariantes',
    'getInventarioHTML', 'initInventario',
    'getTransferenciasHTML', 'initTransferencias',
    'getMovimientosHTML', 'initMovimientos',
    'getReportesHTML', 'initReportes'
];

functions.forEach(func => {
    if (typeof window[func] === 'function') {
        console.log(`✅ ${func}`);
    } else {
        console.log(`❌ ${func} - NO disponible`);
    }
});

// Verificar APIs
console.log('\n🌐 Probando APIs:');

async function testAPI(endpoint, name) {
    try {
        const response = await fetch(`http://localhost:3001${endpoint}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${name}: ${data.data ? data.data.length : 'OK'} items`);
        } else {
            console.log(`❌ ${name}: HTTP ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
    }
}

// Probar endpoints principales
testAPI('/api/proveedores', 'Proveedores');
testAPI('/api/categorias', 'Categorías');
testAPI('/api/ubicaciones', 'Ubicaciones');
testAPI('/api/productos', 'Productos');
testAPI('/api/variantes', 'Variantes');
testAPI('/api/inventario-legacy/inventario-legacy', 'Inventario');
testAPI('/health', 'Health Check');

console.log('\n✅ Diagnóstico completado');