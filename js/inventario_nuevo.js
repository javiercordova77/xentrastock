/**
 * Módulo de Inventario RECONSTRUIDO para XentraStock v3.0
 * VERSIÓN SIMPLIFICADA Y ROBUSTA
 */

console.log('🔄 Cargando módulo de inventario reconstruido...');

// HTML template simplificado y robusto
function getInventarioHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center mb-6">
                <div class="sm:flex-auto">
                    <h1 class="text-2xl font-bold text-gray-900">Inventario</h1>
                    <p class="mt-2 text-sm text-gray-700">Control de stock y ubicaciones</p>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-boxes text-sm"></i>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                                    <dd id="total-items" class="text-lg font-medium text-gray-900">0</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <span class="text-sm font-bold">∑</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Cantidad Total</dt>
                                    <dd id="cantidad-total" class="text-lg font-medium text-gray-900">0</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                    <span class="text-sm font-bold">$</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                                    <dd id="valor-total" class="text-lg font-medium text-gray-900">$0.00</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-exclamation-triangle text-sm"></i>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Bajo Stock</dt>
                                    <dd id="bajo-stock" class="text-lg font-medium text-gray-900">0</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filtros -->
            <div class="bg-white shadow rounded-lg p-4 mb-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <input type="text" id="buscar-inventario" placeholder="Buscar en inventario..." 
                               class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="flex gap-2">
                        <select id="filtro-ubicacion" class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Todas las ubicaciones</option>
                        </select>
                        <select id="filtro-stock" class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Todo el stock</option>
                            <option value="bajo">Solo bajo stock</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tabla de Inventario -->
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 class="text-sm font-medium text-gray-900">
                        Mostrando: <span id="registros-mostrados">0</span> registros
                    </h3>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Producto / Variante
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody id="tabla-inventario" class="bg-white divide-y divide-gray-200">
                            <tr>
                                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                    <div class="flex flex-col items-center">
                                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                        <p>Cargando inventario...</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// Variables globales
let inventarioCompleto = [];
let inventarioFiltrado = [];

// Función principal de inicialización
async function initInventario() {
    console.log('🚀 Inicializando inventario reconstruido...');
    
    try {
        // 1. Cargar ubicaciones para filtros
        await cargarUbicaciones();
        
        // 2. Cargar datos del inventario
        await cargarInventario();
        
        // 3. Configurar eventos
        configurarEventos();
        
        console.log('✅ Inventario inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando inventario:', error);
        mostrarError('Error inicializando inventario: ' + error.message);
    }
}

// Cargar ubicaciones para el filtro
async function cargarUbicaciones() {
    try {
        console.log('🔄 Cargando ubicaciones...');
        
        const response = await fetch('http://localhost:3001/api/ubicaciones');
        if (!response.ok) throw new Error('No se pudieron cargar las ubicaciones');
        
        const data = await response.json();
        const ubicaciones = data.data || [];
        
        const select = document.getElementById('filtro-ubicacion');
        if (select) {
            select.innerHTML = '<option value="">Todas las ubicaciones</option>';
            ubicaciones.forEach(ubicacion => {
                const option = document.createElement('option');
                option.value = ubicacion.id;
                option.textContent = ubicacion.nombre;
                select.appendChild(option);
            });
        }
        
        console.log(`✅ ${ubicaciones.length} ubicaciones cargadas`);
        
    } catch (error) {
        console.warn('⚠️ Error cargando ubicaciones:', error);
    }
}

// Cargar datos del inventario
async function cargarInventario() {
    try {
        console.log('🔄 Cargando datos del inventario...');
        
        // Mostrar spinner
        const tabla = document.getElementById('tabla-inventario');
        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>Cargando inventario...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Hacer petición al endpoint
        const response = await fetch('http://localhost:3001/api/inventario-legacy/inventario-legacy');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.isOk || !data.data) {
            throw new Error('API no devuelve datos válidos');
        }
        
        // Guardar datos
        inventarioCompleto = data.data;
        inventarioFiltrado = [...inventarioCompleto];
        
        // Actualizar interfaz
        actualizarTabla();
        actualizarEstadisticas(data.totales);
        
        console.log(`✅ Inventario cargado: ${inventarioCompleto.length} items`);
        
    } catch (error) {
        console.error('❌ Error cargando inventario:', error);
        mostrarError('Error cargando inventario: ' + error.message);
        
        // Mostrar mensaje de error en la tabla
        const tabla = document.getElementById('tabla-inventario');
        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-red-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                            <p class="font-medium">Error cargando datos</p>
                            <p class="text-sm">${error.message}</p>
                            <button onclick="cargarInventario()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Reintentar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

// Actualizar tabla
function actualizarTabla() {
    const tabla = document.getElementById('tabla-inventario');
    const registrosMostrados = document.getElementById('registros-mostrados');
    
    if (!tabla) return;
    
    if (inventarioFiltrado.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                        <p class="font-medium">No se encontraron productos</p>
                        <p class="text-sm">Intenta cambiar los filtros de búsqueda</p>
                    </div>
                </td>
            </tr>
        `;
        if (registrosMostrados) registrosMostrados.textContent = '0';
        return;
    }
    
    // Generar filas de la tabla
    const filas = inventarioFiltrado.map(item => {
        const estado = obtenerEstadoStock(item);
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <div class="text-sm font-medium text-gray-900">${item.varianteSku || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${item.varianteDetalle || ''}</div>
                        <div class="text-xs text-gray-400">${item.categoria || ''} • ${item.proveedor || ''}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${item.ubicacionNombre || 'N/A'}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${item.cantidad || 0}</div>
                    <div class="text-xs text-gray-500">Min: ${item.stockMinimo || 0}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">$${(item.valorTotal || 0).toLocaleString()}</div>
                    <div class="text-xs text-gray-500">Unit: $${(item.precioUnitario || 0).toLocaleString()}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estado.color}">
                        ${estado.texto}
                    </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-900" title="Movimiento">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tabla.innerHTML = filas;
    
    if (registrosMostrados) {
        registrosMostrados.textContent = inventarioFiltrado.length;
    }
    
    console.log(`✅ Tabla actualizada: ${inventarioFiltrado.length} filas`);
}

// Obtener estado del stock
function obtenerEstadoStock(item) {
    const cantidad = item.cantidad || 0;
    const minimo = item.stockMinimo || 5;
    
    if (cantidad === 0) {
        return { color: 'bg-red-100 text-red-800', texto: 'Sin Stock' };
    } else if (cantidad <= minimo) {
        return { color: 'bg-orange-100 text-orange-800', texto: 'Bajo Stock' };
    } else if (cantidad > minimo * 2) {
        return { color: 'bg-green-100 text-green-800', texto: 'Buen Stock' };
    } else {
        return { color: 'bg-blue-100 text-blue-800', texto: 'Normal' };
    }
}

// Actualizar estadísticas
function actualizarEstadisticas(totales = null) {
    const items = inventarioCompleto.length;
    const cantidadTotal = totales ? totales.stock_total : inventarioCompleto.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    const valorTotal = totales ? totales.valor_total : inventarioCompleto.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const bajoStock = inventarioCompleto.filter(item => (item.cantidad || 0) <= (item.stockMinimo || 5)).length;
    
    // Actualizar elementos del DOM
    const elementos = {
        'total-items': items,
        'cantidad-total': cantidadTotal,
        'valor-total': `$${valorTotal.toLocaleString()}`,
        'bajo-stock': bajoStock
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    });
    
    console.log(`📊 Stats: ${items} items, ${cantidadTotal} unidades, $${valorTotal}`);
}

// Configurar eventos
function configurarEventos() {
    // Búsqueda
    const buscar = document.getElementById('buscar-inventario');
    if (buscar) {
        buscar.addEventListener('input', filtrarInventario);
    }
    
    // Filtros
    const filtroUbicacion = document.getElementById('filtro-ubicacion');
    const filtroStock = document.getElementById('filtro-stock');
    
    if (filtroUbicacion) {
        filtroUbicacion.addEventListener('change', filtrarInventario);
    }
    
    if (filtroStock) {
        filtroStock.addEventListener('change', filtrarInventario);
    }
    
    console.log('✅ Eventos configurados');
}

// Filtrar inventario
function filtrarInventario() {
    const busqueda = document.getElementById('buscar-inventario')?.value.toLowerCase() || '';
    const ubicacion = document.getElementById('filtro-ubicacion')?.value || '';
    const stock = document.getElementById('filtro-stock')?.value || '';
    
    inventarioFiltrado = inventarioCompleto.filter(item => {
        // Filtro de búsqueda
        if (busqueda) {
            const textoItem = [
                item.varianteSku,
                item.varianteDetalle,
                item.productoNombre,
                item.categoria,
                item.proveedor,
                item.ubicacionNombre
            ].filter(Boolean).join(' ').toLowerCase();
            
            if (!textoItem.includes(busqueda)) return false;
        }
        
        // Filtro de ubicación
        if (ubicacion && item.ubicacionId != ubicacion) return false;
        
        // Filtro de stock
        if (stock === 'bajo' && (item.cantidad || 0) > (item.stockMinimo || 5)) return false;
        
        return true;
    });
    
    actualizarTabla();
    console.log(`🔍 Filtrado: ${inventarioFiltrado.length} de ${inventarioCompleto.length} items`);
}

// Mostrar error
function mostrarError(mensaje) {
    console.error('❌', mensaje);
    
    // Crear toast de error si existe la función
    if (typeof showToast === 'function') {
        showToast(mensaje, 'error');
    } else {
        alert(mensaje);
    }
}

// Función global para recargar
window.recargarInventario = cargarInventario;

console.log('✅ Módulo de inventario reconstruido cargado');