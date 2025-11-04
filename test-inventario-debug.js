// Test para detectar errores específicos en el inventario
console.log('🔧 INICIANDO TEST DETALLADO DEL INVENTARIO');

// Test 1: Verificar si las funciones están definidas
setTimeout(() => {
    console.log('\n📋 1. Verificando funciones globales...');
    
    if (typeof getInventarioHTML === 'function') {
        console.log('✅ getInventarioHTML: DEFINIDA');
    } else {
        console.log('❌ getInventarioHTML: NO DEFINIDA');
    }
    
    if (typeof initInventario === 'function') {
        console.log('✅ initInventario: DEFINIDA');
    } else {
        console.log('❌ initInventario: NO DEFINIDA');
    }
    
    if (typeof loadInventarioData === 'function') {
        console.log('✅ loadInventarioData: DEFINIDA');
    } else {
        console.log('❌ loadInventarioData: NO DEFINIDA');
    }
    
    // Test 2: Verificar que la app esté inicializada
    console.log('\n🚀 2. Verificando estado de la aplicación...');
    
    if (typeof app !== 'undefined') {
        console.log('✅ app: DEFINIDA');
        console.log(`📊 app.currentSection: ${app.currentSection}`);
        console.log(`📊 app.data length: ${app.data ? app.data.length : 'undefined'}`);
    } else {
        console.log('❌ app: NO DEFINIDA');
    }
    
    // Test 3: Simular carga del inventario
    console.log('\n📦 3. Intentando cargar inventario...');
    
    if (typeof loadInventarioData === 'function') {
        try {
            loadInventarioData()
                .then(() => {
                    console.log('✅ loadInventarioData: EJECUTADA EXITOSAMENTE');
                    
                    // Verificar tabla
                    const tbody = document.getElementById('inventario-table-body');
                    if (tbody) {
                        console.log(`📊 Filas en tabla: ${tbody.children.length}`);
                        console.log(`📊 Contenido de tabla: ${tbody.innerHTML.length > 0 ? 'CON DATOS' : 'VACÍA'}`);
                    } else {
                        console.log('❌ Tabla inventario-table-body: NO ENCONTRADA');
                    }
                    
                    // Verificar stats
                    const statsItems = document.getElementById('stat-items-stock');
                    if (statsItems) {
                        console.log(`📊 Stats items: ${statsItems.textContent}`);
                    } else {
                        console.log('❌ Stats items: NO ENCONTRADAS');
                    }
                })
                .catch(error => {
                    console.error('❌ Error en loadInventarioData:', error);
                });
        } catch (error) {
            console.error('❌ Error ejecutando loadInventarioData:', error);
        }
    }
    
    // Test 4: Verificar elementos del DOM
    console.log('\n🎯 4. Verificando elementos del DOM...');
    
    const elementos = [
        'inventario-table-body',
        'stat-items-stock',
        'stat-valor-total',
        'stat-stock-bajo',
        'stat-productos',
        'search-inventario',
        'filter-ubicacion'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✅ ${id}: ENCONTRADO`);
        } else {
            console.log(`❌ ${id}: NO ENCONTRADO`);
        }
    });
    
    // Test 5: Manual fetch test
    console.log('\n🌐 5. Test manual de fetch...');
    
    fetch('http://localhost:3001/api/inventario-legacy/inventario-legacy')
        .then(response => {
            console.log(`✅ Fetch response status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`✅ Fetch data received: ${data.data ? data.data.length : 0} items`);
            console.log('✅ Sample data:', data.data ? data.data[0] : 'No data');
            
            // Manual table update test
            const tbody = document.getElementById('inventario-table-body');
            if (tbody && data.data && data.data.length > 0) {
                console.log('🔧 Actualizando tabla manualmente...');
                
                tbody.innerHTML = `
                    <tr>
                        <td class="px-6 py-4">TEST DATA LOADED</td>
                        <td class="px-6 py-4">${data.data[0].ubicacionNombre}</td>
                        <td class="px-6 py-4">${data.data[0].cantidad}</td>
                        <td class="px-6 py-4">-</td>
                        <td class="px-6 py-4">-</td>
                        <td class="px-6 py-4">$${data.data[0].valorTotal}</td>
                        <td class="px-6 py-4">-</td>
                    </tr>
                `;
                
                console.log('✅ Tabla actualizada manualmente');
                
                // Update stats manually
                const statsItems = document.getElementById('stat-items-stock');
                if (statsItems) {
                    statsItems.textContent = data.data.length;
                    console.log('✅ Stats actualizadas manualmente');
                }
            }
        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
        });
    
}, 2000); // Esperar 2 segundos para que todo se cargue