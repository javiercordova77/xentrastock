#!/usr/bin/env node

/**
 * Script de prueba para verificar las APIs de XentraStock
 * Sin usar curl que se queda colgado
 */

const http = require('http');

function testAPI(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000  // 5 segundos de timeout
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Iniciando pruebas de API...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣ Probando Health Check...');
        const health = await testAPI('/health');
        console.log(`   Status: ${health.status}`);
        console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

        // Test 2: Obtener Categorías
        console.log('2️⃣ Probando GET /api/categorias...');
        const categorias = await testAPI('/api/categorias');
        console.log(`   Status: ${categorias.status}`);
        console.log(`   Total categorías: ${categorias.data.count || 0}\n`);

        // Test 3: Obtener Proveedores
        console.log('3️⃣ Probando GET /api/proveedores...');
        const proveedores = await testAPI('/api/proveedores');
        console.log(`   Status: ${proveedores.status}`);
        console.log(`   Total proveedores: ${proveedores.data.count || 0}\n`);

        // Test 4: Crear una nueva categoría
        console.log('4️⃣ Probando POST /api/categorias (crear nueva)...');
        const nuevaCategoria = {
            nombre: 'Categoría de Prueba ' + Date.now(),
            descripcion: 'Categoría creada por script de prueba'
        };
        
        const createCategoria = await testAPI('/api/categorias', 'POST', nuevaCategoria);
        console.log(`   Status: ${createCategoria.status}`);
        console.log(`   Response: ${JSON.stringify(createCategoria.data, null, 2)}\n`);

        // Test 5: Verificar que se guardó
        console.log('5️⃣ Verificando categorías después de crear...');
        const categoriasAfter = await testAPI('/api/categorias');
        console.log(`   Status: ${categoriasAfter.status}`);
        console.log(`   Total categorías ahora: ${categoriasAfter.data.count || 0}\n`);

        console.log('✅ Pruebas completadas exitosamente');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
}

runTests();