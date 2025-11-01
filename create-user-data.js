#!/usr/bin/env node

/**
 * Script para crear el proveedor "Chaide" y la categoría "Colchones"
 */

const http = require('http');

function createData(path, method = 'POST', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000
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

        req.on('error', reject);
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

async function createUserData() {
    console.log('🏭 Creando proveedor "Chaide" y categoría "Colchones"...\n');

    try {
        // Crear categoría "Colchones"
        console.log('1️⃣ Creando categoría "Colchones"...');
        const categoriaColchones = {
            nombre: 'Colchones',
            descripcion: 'Colchones y productos para el descanso'
        };
        
        const resultCategoria = await createData('/api/categorias', 'POST', categoriaColchones);
        console.log(`   Status: ${resultCategoria.status}`);
        if (resultCategoria.status === 201) {
            console.log(`   ✅ Categoría creada con ID: ${resultCategoria.data.data.id}`);
        } else {
            console.log(`   ❌ Error: ${JSON.stringify(resultCategoria.data)}`);
        }

        // Crear proveedor "Chaide"
        console.log('\n2️⃣ Creando proveedor "Chaide"...');
        const proveedorChaide = {
            nombre: 'Chaide',
            contacto: 'Representante Chaide',
            telefono: '555-0100',
            email: 'contacto@chaide.com',
            direccion: 'Av. Principal, Ciudad'
        };
        
        const resultProveedor = await createData('/api/proveedores', 'POST', proveedorChaide);
        console.log(`   Status: ${resultProveedor.status}`);
        if (resultProveedor.status === 201) {
            console.log(`   ✅ Proveedor creado con ID: ${resultProveedor.data.data.id}`);
        } else {
            console.log(`   ❌ Error: ${JSON.stringify(resultProveedor.data)}`);
        }

        // Verificar que se crearon
        console.log('\n3️⃣ Verificando datos creados...');
        const categorias = await createData('/api/categorias', 'GET');
        const proveedores = await createData('/api/proveedores', 'GET');
        
        console.log(`   📊 Total categorías: ${categorias.data.count}`);
        console.log(`   📊 Total proveedores: ${proveedores.data.count}`);

        // Buscar específicamente los datos creados
        const chaideExists = proveedores.data.data.some(p => p.nombre === 'Chaide');
        const colchonesExists = categorias.data.data.some(c => c.nombre === 'Colchones');

        console.log(`\n✅ Resultado:`);
        console.log(`   Proveedor "Chaide": ${chaideExists ? '✅ EXISTE' : '❌ NO EXISTE'}`);
        console.log(`   Categoría "Colchones": ${colchonesExists ? '✅ EXISTE' : '❌ NO EXISTE'}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createUserData();