/**
 * Módulo de Inventario para XentraStock v2.0
 * CAMBIO MÍNIMO: Solo datos reales en lugar de datos de prueba
 */

// HTML template for inventario section (sin cambios)
function getInventarioHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Inventario</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Gestiona las existencias de productos en tus ubicaciones.
                    </p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
                    <button id="add-ingreso" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Ingreso
                    </button>
                    <button id="add-salida" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                        Salida
                    </button>
                </div>
            </div>

            <!-- Filters and search -->
            <div class="mt-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <label for="search-inventario" class="sr-only">Buscar en inventario</label>
                        <div class="relative">
                            <input type="text" id="search-inventario" placeholder="Buscar productos en inventario..." 
                                   class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mobile-input">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <select id="filter-ubicacion" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todas las ubicaciones</option>
                        </select>
                        <select id="filter-categoria" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todas las categorías</option>
                        </select>
                        <select id="filter-stock" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todo el stock</option>
                            <option value="bajo">Stock bajo</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="mt-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                        <i class="fas fa-boxes text-sm"></i>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Items en Stock</dt>
                                        <dd id="stat-items-stock" class="text-lg font-medium text-gray-900">-</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <i class="fas fa-dollar-sign text-sm"></i>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                                        <dd id="stat-valor-total" class="text-lg font-medium text-gray-900">-</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                        <i class="fas fa-exclamation-triangle text-sm"></i>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Stock Bajo</dt>
                                        <dd id="stat-stock-bajo" class="text-lg font-medium text-gray-900">-</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                        <i class="fas fa-chart-line text-sm"></i>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Productos</dt>
                                        <dd id="stat-productos" class="text-lg font-medium text-gray-900">-</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inventario Table -->
            <div class="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
                <div class="px-4 py-5 sm:p-6">
                    <div class="flow-root">
                        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Producto
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ubicación
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock Actual
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock Mínimo
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Valor Total
                                            </th>
                                            <th scope="col" class="relative px-6 py-3">
                                                <span class="sr-only">Acciones</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody id="inventario-table-body" class="bg-white divide-y divide-gray-200">
                                        <!-- Se carga dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modals -->
            <div id="ingreso-modal" class="modal-overlay hidden">
                <div class="modal-content max-w-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-semibold text-gray-900">Ingreso de Inventario</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="ingreso-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="movimiento-producto" class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                                <select id="movimiento-producto" required class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                    <option value="">Seleccionar producto</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="movimiento-variante" class="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                                <select id="movimiento-variante" class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                    <option value="">Sin variante específica</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="movimiento-ubicacion" class="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                                <select id="movimiento-ubicacion" required class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                    <option value="">Seleccionar ubicación</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="movimiento-cantidad" class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                                <input type="number" id="movimiento-cantidad" min="1" required 
                                       class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            </div>
                        </div>
                        
                        <div>
                            <label for="movimiento-observaciones" class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                            <textarea id="movimiento-observaciones" rows="3" 
                                      class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input"></textarea>
                        </div>
                        
                        <div id="stock-actual-info" class="bg-blue-50 p-4 rounded-md" style="display: none;">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-info-circle text-blue-400"></i>
                                </div>
                                <div class="ml-3 flex-1">
                                    <h3 class="text-sm font-medium text-blue-800">Stock Actual</h3>
                                    <div id="stock-actual-value" class="mt-2 text-sm text-blue-700"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" class="modal-close px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mobile-button">
                                Cancelar
                            </button>
                            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 mobile-button">
                                Registrar Ingreso
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="salida-modal" class="modal-overlay hidden">
                <div class="modal-content max-w-2xl">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-semibold text-gray-900">Salida de Inventario</h3>
                        <button class="modal-close text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="salida-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="salida-producto" class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
                                <select id="salida-producto" required class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                    <option value="">Seleccionar producto</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="salida-variante" class="block text-sm font-medium text-gray-700 mb-2">Variante</label>
                                <select id="salida-variante" class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                    <option value="">Sin variante específica</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="salida-ubicacion" class="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                                <select id="salida-ubicacion" required class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                    <option value="">Seleccionar ubicación</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="salida-cantidad" class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                                <input type="number" id="salida-cantidad" min="1" required 
                                       class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            </div>
                        </div>
                        
                        <div>
                            <label for="salida-observaciones" class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                            <textarea id="salida-observaciones" rows="3" 
                                      class="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mobile-input"></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" class="modal-close px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mobile-button">
                                Cancelar
                            </button>
                            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 mobile-button">
                                Registrar Salida
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Variables globales (sin cambios)
let filteredInventario = [];

// Initialize inventario (sin cambios)
async function initInventario() {
    await loadSelectOptions();
    await loadInventarioData();
    setupEventListeners();
}

// Setup event listeners (sin cambios)
function setupEventListeners() {
    document.getElementById('search-inventario').addEventListener('input', filterInventario);
    document.getElementById('filter-ubicacion').addEventListener('change', filterInventario);
    document.getElementById('filter-categoria').addEventListener('change', filterInventario);
    document.getElementById('filter-stock').addEventListener('change', filterInventario);
    
    document.getElementById('add-ingreso').addEventListener('click', () => openModal('ingreso-modal'));
    document.getElementById('add-salida').addEventListener('click', () => openModal('salida-modal'));
    
    document.getElementById('ingreso-form').addEventListener('submit', handleIngresoSubmit);
    document.getElementById('salida-form').addEventListener('submit', handleSalidaSubmit);
    
    document.getElementById('movimiento-producto').addEventListener('change', updateVariantesSelect);
    document.getElementById('movimiento-variante').addEventListener('change', updateStockInfo);
    document.getElementById('movimiento-ubicacion').addEventListener('change', updateStockInfo);
}

// ÚNICO CAMBIO: Cargar datos reales en lugar de datos de prueba
async function loadInventarioData() {
    try {
        console.log('🔄 Cargando datos reales del inventario ColchonesW...');
        
        // Fetch real data from the ColchonesW inventory API
        const response = await fetch('http://localhost:3001/api/inventario-colchonesw');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        const inventarioData = apiData.data || [];
        
        // Transform API data to maintain existing structure
        const realInventarioData = [];
        
        inventarioData.forEach(variante => {
            if (variante.ubicaciones && variante.ubicaciones.length > 0) {
                variante.ubicaciones.forEach(ubicacion => {
                    realInventarioData.push({
                        tipo: 'inventario',  // Keep existing structure
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
        
        // Use the real data like it was app.data
        filteredInventario = realInventarioData;
        renderInventarioTable(filteredInventario);
        updateInventarioStats(filteredInventario);
        
        console.log(`✅ Inventario real cargado: ${filteredInventario.length} items`);
        
    } catch (error) {
        console.error('❌ Error loading inventario from ColchonesW API:', error);
        showToast('Error cargando inventario: ' + error.message, 'error');
        
        // Fallback to original app.data if API fails
        const fallbackData = filterData(app.data, 'inventario');
        filteredInventario = fallbackData;
        renderInventarioTable(fallbackData);
        updateInventarioStats(fallbackData);
    }
}

// Load select options (using app.data as before)
async function loadSelectOptions() {
    try {
        // Load ubicaciones from the existing app.data
        const ubicaciones = filterData(app.data, 'ubicacion');
        
        const ubicacionSelects = ['movimiento-ubicacion', 'filter-ubicacion'];
        
        ubicacionSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            if (selectId === 'filter-ubicacion') {
                select.innerHTML = '<option value="">Todas las ubicaciones</option>';
            } else {
                select.innerHTML = '<option value="">Seleccionar ubicación</option>';
            }
            
            ubicaciones.forEach(ubicacion => {
                const option = document.createElement('option');
                option.value = ubicacion.id;
                option.textContent = ubicacion.nombre;
                select.appendChild(option);
            });
        });

        // Load productos from the existing app.data
        const productos = filterData(app.data, 'producto');
        const productoSelects = ['movimiento-producto', 'salida-producto'];
        
        productoSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = '<option value="">Seleccionar producto</option>';
            
            productos.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.id;
                option.textContent = producto.nombre;
                select.appendChild(option);
            });
        });
        
        // Load categories from the existing app.data
        const categorias = filterData(app.data, 'categoria');
        const categoriaSelect = document.getElementById('filter-categoria');
        if (categoriaSelect) {
            categoriaSelect.innerHTML = '<option value="">Todas las categorías</option>';
            
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                categoriaSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading select options:', error);
    }
}

// Update variantes select (sin cambios)
function updateVariantesSelect() {
    const productoId = document.getElementById('movimiento-producto').value;
    const varianteSelect = document.getElementById('movimiento-variante');
    
    varianteSelect.innerHTML = '<option value="">Sin variante específica</option>';
    
    if (productoId) {
        const variantes = filterData(app.data, 'variante').filter(v => v.productoId === productoId);
        variantes.forEach(variante => {
            const option = document.createElement('option');
            option.value = variante.id;
            option.textContent = variante.nombre;
            varianteSelect.appendChild(option);
        });
    }
}

// Update stock info (usa datos reales)
function updateStockInfo() {
    const productoId = document.getElementById('movimiento-producto').value;
    const varianteId = document.getElementById('movimiento-variante').value;
    const ubicacionId = document.getElementById('movimiento-ubicacion').value;
    
    const stockInfo = document.getElementById('stock-actual-info');
    const stockValue = document.getElementById('stock-actual-value');
    
    if (productoId && ubicacionId) {
        // Find current stock from the real inventory data
        const stockItem = filteredInventario.find(item => 
            item.productoId === productoId && 
            item.ubicacionId === ubicacionId &&
            (!varianteId || item.varianteId === varianteId)
        );
        
        if (stockItem) {
            stockValue.textContent = `Stock actual: ${stockItem.cantidad} unidades`;
            stockInfo.style.display = 'block';
        } else {
            stockValue.textContent = 'Stock actual: 0 unidades (nuevo item)';
            stockInfo.style.display = 'block';
        }
    } else {
        stockInfo.style.display = 'none';
    }
}

// Render inventario table (adaptado para datos reales)
function renderInventarioTable(inventario) {
    const tbody = document.getElementById('inventario-table-body');
    if (!tbody) return;
    
    if (inventario.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                        <p class="text-lg font-medium">No hay productos en inventario</p>
                        <p class="text-sm">Utiliza los botones de arriba para agregar productos.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = inventario.map(item => {
        const stockStatus = getStockStatus(item);
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                        <div class="text-sm font-medium text-gray-900">${item.varianteSku || item.productoNombre || 'N/A'}</div>
                        <div class="text-sm text-gray-500">${item.varianteDetalle || ''}</div>
                        <div class="text-xs text-gray-400">${item.categoria || ''} • ${item.proveedor || ''}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${item.ubicacionNombre || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${item.cantidad || 0}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${item.stockMinimo || 5}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}">
                        ${stockStatus.text}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">$${(item.valorTotal || 0).toLocaleString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3" 
                            onclick="editInventarioItem('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900" 
                            onclick="deleteInventarioItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get stock status (sin cambios)
function getStockStatus(item) {
    const cantidad = item.cantidad || 0;
    const stockMinimo = item.stockMinimo || 5;
    const stockMaximo = item.stockMaximo || 20;
    
    if (cantidad === 0) return { color: 'bg-red-100 text-red-800', text: 'Sin Stock' };
    if (cantidad <= stockMinimo) return { color: 'bg-orange-100 text-orange-800', text: 'Bajo Stock' };
    if (cantidad >= stockMaximo * 0.8) return { color: 'bg-yellow-100 text-yellow-800', text: 'Alto Stock' };
    return { color: 'bg-green-100 text-green-800', text: 'Normal' };
}

// Filter inventario (adaptado para datos reales)
function filterInventario() {
    const searchTerm = document.getElementById('search-inventario').value.toLowerCase();
    const ubicacionFilter = document.getElementById('filter-ubicacion').value;
    const categoriaFilter = document.getElementById('filter-categoria').value;
    const stockFilter = document.getElementById('filter-stock').value;
    
    // Use the real inventory data loaded from API
    let filtered = filteredInventario;
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(item => {
            return (item.varianteSku || '').toLowerCase().includes(searchTerm) ||
                   (item.productoNombre || '').toLowerCase().includes(searchTerm) ||
                   (item.varianteDetalle || '').toLowerCase().includes(searchTerm) ||
                   (item.categoria || '').toLowerCase().includes(searchTerm) ||
                   (item.proveedor || '').toLowerCase().includes(searchTerm) ||
                   (item.ubicacionNombre || '').toLowerCase().includes(searchTerm);
        });
    }
    
    // Apply ubicacion filter
    if (ubicacionFilter) {
        filtered = filtered.filter(item => item.ubicacionId == ubicacionFilter);
    }
    
    // Apply categoria filter
    if (categoriaFilter) {
        const categoria = filterData(app.data, 'categoria').find(c => c.id === categoriaFilter);
        if (categoria) {
            filtered = filtered.filter(item => item.categoria === categoria.nombre);
        }
    }
    
    // Apply stock filter
    if (stockFilter === 'bajo') {
        filtered = filtered.filter(item => (item.cantidad || 0) <= (item.stockMinimo || 5));
    }
    
    renderInventarioTable(filtered);
    updateInventarioStats(filtered);
}

// Update inventario stats (sin cambios)
function updateInventarioStats(inventario) {
    const totalItems = inventario.length;
    const valorTotal = inventario.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const stockBajo = inventario.filter(item => (item.cantidad || 0) <= (item.stockMinimo || 5)).length;
    const productos = new Set(inventario.map(item => item.varianteSku || item.productoNombre)).size;
    
    document.getElementById('stat-items-stock').textContent = totalItems.toLocaleString();
    document.getElementById('stat-valor-total').textContent = `$${valorTotal.toLocaleString()}`;
    document.getElementById('stat-stock-bajo').textContent = stockBajo.toLocaleString();
    document.getElementById('stat-productos').textContent = productos.toLocaleString();
}

// Handle ingreso submit (sin cambios)
async function handleIngresoSubmit(e) {
    e.preventDefault();
    
    const formData = {
        tipo: 'ingreso',
        productoId: document.getElementById('movimiento-producto').value,
        varianteId: document.getElementById('movimiento-variante').value,
        ubicacionId: document.getElementById('movimiento-ubicacion').value,
        cantidad: parseInt(document.getElementById('movimiento-cantidad').value),
        observaciones: document.getElementById('movimiento-observaciones').value,
        fecha: new Date().toISOString().split('T')[0]
    };
    
    try {
        const result = await app.sdk.processIngresoInventario(formData);
        
        if (result.isOk) {
            showToast('Ingreso registrado exitosamente', 'success');
            closeModal('ingreso-modal');
            document.getElementById('ingreso-form').reset();
            await loadInventarioData();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error procesando ingreso: ' + error.message, 'error');
    }
}

// Handle salida submit (sin cambios)
async function handleSalidaSubmit(e) {
    e.preventDefault();
    
    const formData = {
        tipo: 'salida',
        productoId: document.getElementById('salida-producto').value,
        varianteId: document.getElementById('salida-variante').value,
        ubicacionId: document.getElementById('salida-ubicacion').value,
        cantidad: parseInt(document.getElementById('salida-cantidad').value),
        observaciones: document.getElementById('salida-observaciones').value,
        fecha: new Date().toISOString().split('T')[0]
    };
    
    try {
        const result = await app.sdk.processSalidaInventario(formData);
        
        if (result.isOk) {
            showToast('Salida registrada exitosamente', 'success');
            closeModal('salida-modal');
            document.getElementById('salida-form').reset();
            await loadInventarioData();
        } else {
            showToast('Error: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('Error procesando salida: ' + error.message, 'error');
    }
}

// Edit and delete functions (sin cambios)
function editInventarioItem(id) {
    showToast('Función de edición en desarrollo', 'info');
}

function deleteInventarioItem(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este item del inventario?')) {
        showToast('Función de eliminación en desarrollo', 'info');
    }
}