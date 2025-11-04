// DEBUG COMPLETO DE LA INTERFAZ ACTUAL
console.log('🔍 INICIANDO DEBUG COMPLETO DE XENTRASTOCK 3.0');

// Verificar que todos los elementos del DOM existen
setTimeout(() => {
    console.log('\n📱 1. VERIFICANDO ELEMENTOS DEL DOM...');
    console.log('=======================================');
    
    const elementos = [
        'sidebar',
        'mobile-menu-button', 
        'content-container',
        'loading-overlay',
        'toast-container',
        'tab-dashboard',
        'tab-inventario',
        'tab-proveedores',
        'total-productos',
        'total-variantes'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ ${id}: ENCONTRADO`);
        } else {
            console.log(`❌ ${id}: NO ENCONTRADO`);
        }
    });
    
    console.log('\n🎯 2. VERIFICANDO FUNCIONES GLOBALES...');
    console.log('=======================================');
    
    const funciones = [
        'loadSection',
        'initializeSection', 
        'getDashboardHTML',
        'getInventarioHTML',
        'getProveedoresHTML',
        'showToast',
        'setLoading',
        'filterData'
    ];
    
    funciones.forEach(func => {
        if (typeof window[func] === 'function') {
            console.log(`✅ ${func}: DEFINIDA`);
        } else {
            console.log(`❌ ${func}: NO DEFINIDA`);
        }
    });
    
    console.log('\n📊 3. VERIFICANDO ESTADO DE LA APP...');
    console.log('=====================================');
    
    if (typeof app !== 'undefined') {
        console.log(`✅ app.currentSection: ${app.currentSection}`);
        console.log(`✅ app.data length: ${app.data ? app.data.length : 'undefined'}`);
        console.log(`✅ app.isLoading: ${app.isLoading}`);
        console.log(`✅ app.sdk: ${app.sdk ? 'DEFINIDO' : 'NO DEFINIDO'}`);
    } else {
        console.log('❌ Variable app: NO DEFINIDA');
    }
    
    console.log('\n🔧 4. VERIFICANDO ARCHIVOS JAVASCRIPT...');
    console.log('=========================================');
    
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        console.log(`📄 Script cargado: ${script.src}`);
    });
    
    console.log('\n🎨 5. VERIFICANDO ESTILOS CSS...');
    console.log('=================================');
    
    const tabActive = document.querySelector('.tab-active');
    if (tabActive) {
        console.log(`✅ Tab activo encontrado: ${tabActive.textContent.trim()}`);
    } else {
        console.log('❌ No hay tab activo');
    }
    
    console.log('\n🌐 6. SIMULANDO NAVEGACIÓN...');
    console.log('==============================');
    
    // Simular clic en inventario
    const tabInventario = document.getElementById('tab-inventario');
    if (tabInventario) {
        console.log('🔄 Simulando clic en Inventario...');
        tabInventario.click();
        
        setTimeout(() => {
            const contentContainer = document.getElementById('content-container');
            if (contentContainer && contentContainer.innerHTML.trim() !== '') {
                console.log('✅ Contenido de inventario cargado');
                console.log(`📄 Longitud del HTML: ${contentContainer.innerHTML.length} caracteres`);
                
                // Verificar si hay tabla de inventario
                const tabla = document.getElementById('inventario-table-body');
                if (tabla) {
                    console.log(`✅ Tabla de inventario encontrada: ${tabla.children.length} filas`);
                } else {
                    console.log('❌ Tabla de inventario no encontrada');
                }
            } else {
                console.log('❌ No se cargó contenido en el contenedor');
            }
        }, 2000);
    } else {
        console.log('❌ Botón de inventario no encontrado');
    }
    
    console.log('\n📡 7. VERIFICANDO CONEXIÓN API...');
    console.log('==================================');
    
    fetch('http://localhost:3001/health')
        .then(response => response.json())
        .then(data => {
            console.log('✅ API Health check exitoso:', data);
            
            // Probar endpoint de inventario
            return fetch('http://localhost:3001/api/inventario-legacy/inventario-legacy');
        })
        .then(response => response.json())
        .then(data => {
            console.log(`✅ API Inventario: ${data.data ? data.data.length : 0} items`);
        })
        .catch(error => {
            console.error('❌ Error de API:', error);
        });
    
    console.log('\n🚨 8. IDENTIFICANDO PROBLEMAS...');
    console.log('=================================');
    
    // Verificar errores comunes
    const problemas = [];
    
    if (!document.getElementById('content-container')) {
        problemas.push('Content container no existe');
    }
    
    if (typeof loadSection !== 'function') {
        problemas.push('Función loadSection no definida');
    }
    
    if (typeof app === 'undefined') {
        problemas.push('Variable app no definida');
    }
    
    if (problemas.length === 0) {
        console.log('✅ No se detectaron problemas obvios');
        console.log('💡 La interfaz debería estar funcionando correctamente');
    } else {
        console.log('⚠️ Problemas detectados:');
        problemas.forEach(problema => console.log(`  - ${problema}`));
    }
    
}, 3000); // Esperar 3 segundos para que todo se cargue