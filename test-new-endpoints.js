const axios = require('axios');

const baseURL = 'http://localhost:3001/api';
const api = axios.create({ baseURL });

async function testNewEndpoints() {
    console.log('🧪 Probando nuevos endpoints de XentraStock API\n');
    
    try {
        // 1. Crear datos de prueba
        console.log('📝 1. Creando datos de prueba...');
        
        // Obtener un producto existente
        const productosRes = await api.get('/productos');
        console.log(`   Productos existentes: ${productosRes.data.count}`);
        
        if (productosRes.data.count === 0) {
            console.log('   ⚠️  No hay productos. Creando uno...');
            
            // Obtener categorías y proveedores
            const categoriasRes = await api.get('/categorias');
            const proveedoresRes = await api.get('/proveedores');
            
            if (categoriasRes.data.count > 0 && proveedoresRes.data.count > 0) {
                const categoria = categoriasRes.data.data[0];
                const proveedor = proveedoresRes.data.data[0];
                
                const nuevoProducto = await api.post('/productos', {
                    nombre: 'Producto de Prueba API',
                    sku: 'PROD-TEST-001',
                    descripcion: 'Producto creado para probar nuevos endpoints',
                    categoria_id: categoria.id,
                    proveedor_id: proveedor.id,
                    precio: 150.00,
                    stock_minimo: 5,
                    stock_maximo: 50
                });
                console.log(`   ✅ Producto creado: ${nuevoProducto.data.data.nombre}`);
            }
        }
        
        // Obtener productos actualizados
        const productosActuales = await api.get('/productos');
        const producto = productosActuales.data.data[0];
        
        // 2. Crear variante
        console.log('\n📦 2. Creando variante...');
        const nuevaVariante = await api.post('/variantes', {
            producto_id: producto.id,
            codigo: 'VAR-001-AZUL',
            nombre: 'Variante Azul',
            color: 'Azul',
            talla: 'M',
            precio_compra: 100.00,
            precio_venta: 150.00,
            stock_minimo: 5
        });
        console.log(`   ✅ Variante creada: ${nuevaVariante.data.data.nombre}`);
        
        // 3. Obtener ubicaciones
        const ubicacionesRes = await api.get('/ubicaciones');
        const ubicacion = ubicacionesRes.data.data[0];
        console.log(`   📍 Usando ubicación: ${ubicacion.nombre}`);
        
        // 4. Probar endpoints de inventario
        console.log('\n📊 3. Probando endpoints de inventario...');
        
        // Setear stock inicial
        await api.put('/inventario/stock', {
            variante_id: nuevaVariante.data.data.id,
            ubicacion_id: ubicacion.id,
            cantidad: 25
        });
        console.log(`   ✅ Stock inicial seteado: 25 unidades`);
        
        // 5. Crear movimientos
        console.log('\n📈 4. Creando movimientos...');
        
        // Entrada
        await api.post('/movimientos', {
            variante_id: nuevaVariante.data.data.id,
            ubicacion_id: ubicacion.id,
            tipo: 'entrada',
            cantidad: 10,
            precio_unitario: 100.00,
            motivo: 'Compra de prueba',
            referencia: 'COMP-001'
        });
        console.log(`   ✅ Movimiento de entrada creado: +10 unidades`);
        
        // Salida
        await api.post('/movimientos', {
            variante_id: nuevaVariante.data.data.id,
            ubicacion_id: ubicacion.id,
            tipo: 'salida',
            cantidad: 5,
            motivo: 'Venta de prueba',
            referencia: 'VENTA-001'
        });
        console.log(`   ✅ Movimiento de salida creado: -5 unidades`);
        
        // 6. Probar reportes
        console.log('\n📋 5. Probando reportes...');
        
        // Resumen
        const resumen = await api.get('/reportes/resumen');
        console.log(`   📊 Resumen:`, resumen.data.data);
        
        // Stock actual
        const stockActual = await api.get('/inventario');
        console.log(`   📦 Stock actual: ${stockActual.data.count} registros`);
        if (stockActual.data.count > 0) {
            console.log(`       ${stockActual.data.data[0].variante_nombre}: ${stockActual.data.data[0].cantidad} unidades`);
        }
        
        // Movimientos
        const movimientos = await api.get('/movimientos');
        console.log(`   📈 Movimientos: ${movimientos.data.count} registros`);
        
        // Productos populares
        const populares = await api.get('/reportes/productos-populares?dias=1');
        console.log(`   🔥 Productos populares (último día): ${populares.data.count} productos`);
        
        // 7. Probar transferencias
        console.log('\n🔄 6. Probando transferencias...');
        
        // Verificar que tenemos al menos 2 ubicaciones
        if (ubicacionesRes.data.count >= 2) {
            const ubicacionOrigen = ubicacionesRes.data.data[0];
            const ubicacionDestino = ubicacionesRes.data.data[1];
            
            // Crear transferencia
            const transferencia = await api.post('/transferencias', {
                variante_id: nuevaVariante.data.data.id,
                ubicacion_origen_id: ubicacionOrigen.id,
                ubicacion_destino_id: ubicacionDestino.id,
                cantidad: 3,
                motivo: 'Transferencia de prueba',
                usuario: 'test-user'
            });
            console.log(`   ✅ Transferencia creada: ${transferencia.data.data.cantidad} unidades`);
            console.log(`       De: ${ubicacionOrigen.nombre} → A: ${ubicacionDestino.nombre}`);
            
            // Confirmar transferencia
            const confirmacion = await api.patch(`/transferencias/${transferencia.data.data.id}/confirmar`);
            console.log(`   ✅ Transferencia confirmada: ${confirmacion.data.data.estado}`);
            
        } else {
            console.log(`   ⚠️  Solo hay ${ubicacionesRes.data.count} ubicación(es). Se necesitan al menos 2 para transferencias.`);
        }
        
        // 8. Verificar stock final
        console.log('\n📊 7. Stock final...');
        const stockFinal = await api.get('/inventario');
        stockFinal.data.data.forEach(stock => {
            console.log(`   📦 ${stock.variante_nombre} en ${stock.ubicacion_nombre}: ${stock.cantidad} unidades`);
        });
        
        console.log('\n✅ ¡Todas las pruebas completadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

testNewEndpoints();