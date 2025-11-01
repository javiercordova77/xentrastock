/**
 * Módulo de Inventario para XentraStock v2.0
 */

// HTML template for inventario section
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
                            <option value="">Todos los niveles</option>
                            <option value="bajo">Stock bajo</option>
                            <option value="agotado">Agotado</option>
                            <option value="disponible">Disponible</option>
                        </select>
                        <button id="refresh-inventario" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mobile-button">
                            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">📊</span>
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
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">⚠️</span>
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
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">🚫</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Agotados</dt>
                                    <dd id="stat-agotados" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">💰</span>
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
            </div>

            <!-- Inventario table -->
            <div class="mt-8 flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
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
                                            Valor
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" class="relative px-6 py-3">
                                            <span class="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="inventario-table-body" class="bg-white divide-y divide-gray-200">
                                    <!-- Content will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div id="inventario-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay inventario</h3>
                <p class="mt-1 text-sm text-gray-500">Comienza agregando productos a tu inventario.</p>
                <div class="mt-6">
                    <button type="button" onclick="openMovimientoModal('ingreso')" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Primer Ingreso
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal for ingreso/salida -->
        <div id="movimiento-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="movimiento-modal-title" class="text-lg font-medium text-gray-900">Movimiento de Inventario</h2>
                    <button type="button" onclick="closeMovimientoModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="movimiento-form" class="space-y-6">
                    <input type="hidden" id="movimiento-tipo">
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="movimiento-producto" class="block text-sm font-medium text-gray-700">Producto *</label>
                            <select id="movimiento-producto" required 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Seleccionar producto</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="movimiento-variante" class="block text-sm font-medium text-gray-700">Variante</label>
                            <select id="movimiento-variante" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Sin variante específica</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="movimiento-ubicacion" class="block text-sm font-medium text-gray-700">Ubicación *</label>
                            <select id="movimiento-ubicacion" required 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Seleccionar ubicación</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="movimiento-cantidad" class="block text-sm font-medium text-gray-700">Cantidad *</label>
                            <input type="number" id="movimiento-cantidad" required min="1" step="1" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                    </div>
                    
                    <div id="stock-actual-info" class="bg-blue-50 p-4 rounded-md" style="display: none;">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-blue-800">Stock Actual</h3>
                                <div id="stock-actual-value" class="mt-2 text-sm text-blue-700"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label for="movimiento-motivo" class="block text-sm font-medium text-gray-700">Motivo/Observaciones</label>
                        <textarea id="movimiento-motivo" rows="3" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Describe el motivo del movimiento..."></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeMovimientoModal()" 
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md mobile-button">
                            Cancelar
                        </button>
                        <button type="submit" id="movimiento-submit-btn"
                                class="px-4 py-2 text-sm font-medium text-white rounded-md mobile-button">
                            Registrar Movimiento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Global variables for filtering
let filteredInventario = [];

// Initialize inventario section
async function initInventario() {
    setupInventarioEventListeners();
    await loadInventarioData();
    await loadSelectOptions();
}

// Setup event listeners for inventario
function setupInventarioEventListeners() {
    // Add buttons
    document.getElementById('add-ingreso').addEventListener('click', () => {
        openMovimientoModal('ingreso');
    });

    document.getElementById('add-salida').addEventListener('click', () => {
        openMovimientoModal('salida');
    });

    // Refresh button
    document.getElementById('refresh-inventario').addEventListener('click', () => {
        loadInventarioData();
    });

    // Search input
    const searchInput = document.getElementById('search-inventario');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterInventario();
        }, 300);
    });

    // Filter selects
    document.getElementById('filter-ubicacion').addEventListener('change', filterInventario);
    document.getElementById('filter-categoria').addEventListener('change', filterInventario);
    document.getElementById('filter-stock').addEventListener('change', filterInventario);

    // Form submission
    document.getElementById('movimiento-form').addEventListener('submit', handleMovimientoSubmit);

    // Product selection change
    document.getElementById('movimiento-producto').addEventListener('change', updateVariantesSelect);
    document.getElementById('movimiento-producto').addEventListener('change', updateStockInfo);
    document.getElementById('movimiento-variante').addEventListener('change', updateStockInfo);
    document.getElementById('movimiento-ubicacion').addEventListener('change', updateStockInfo);
}

// Load inventario data from real API
async function loadInventarioData() {
    try {
        // Fetch real data from the ColchonesW inventory API
        const response = await fetch('http://localhost:3001/api/inventario-colchonesw');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        const inventarioData = apiData.data || [];
        
        // Transform API data to match the component structure
        const inventario = [];
        
        inventarioData.forEach(variante => {
            if (variante.ubicaciones && variante.ubicaciones.length > 0) {
                variante.ubicaciones.forEach(ubicacion => {
                    inventario.push({
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
                        stockActual: ubicacion.stock_disponible || 0,
                        stockMinimo: ubicacion.stock_minimo || 5,
                        stockMaximo: (ubicacion.stock_minimo || 5) * 4,
                        precioUnitario: variante.precio_venta || 0,
                        valorTotal: (ubicacion.stock_disponible || 0) * (variante.precio_venta || 0),
                        estado: ubicacion.estado_stock || 'normal'
                    });
                });
            }
        });
        
        filteredInventario = inventario;
        renderInventarioTable(inventario);
        updateInventarioStats(inventario);
        
        console.log(`✅ Inventario cargado: ${inventario.length} items reales`);
        
    } catch (error) {
        console.error('Error loading inventario from API:', error);
        showToast('Error cargando inventario: ' + error.message, 'error');
        
        // Fallback to empty inventory if API fails
        filteredInventario = [];
        renderInventarioTable([]);
        updateInventarioStats([]);
    }
}

// Load select options from real APIs
async function loadSelectOptions() {
    try {
        // Load ubicaciones from real API
        const ubicacionesResponse = await fetch('http://localhost:3001/api/ubicaciones');
        const ubicacionesData = await ubicacionesResponse.json();
        const ubicaciones = ubicacionesData.data?.data || ubicacionesData.data || [];
        
        const ubicacionSelects = ['movimiento-ubicacion', 'filter-ubicacion'];
        
        ubicacionSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
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

        // For now, we'll use a simplified approach for products since they come from the inventory API
        // This could be enhanced to fetch from separate product API if needed
        const productoSelect = document.getElementById('movimiento-producto');
        productoSelect.innerHTML = '<option value="">Seleccionar producto</option>';
        
        // Add static option for general inventory management
        const option = document.createElement('option');
        option.value = 'general';
        option.textContent = 'Gestión General de Inventario';
        productoSelect.appendChild(option);
        
        // Load categories from real data
        const categoriaSelect = document.getElementById('filter-categoria');
        categoriaSelect.innerHTML = '<option value="">Todas las categorías</option>';
        
        // Add categories that we know exist from the inventory
        const knownCategories = ['Colchones', 'Almohadas', 'Esponjas'];
        knownCategories.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoriaSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading select options from API:', error);
    }
}

// Update variantes select based on selected product
function updateVariantesSelect() {
    const productoId = document.getElementById('movimiento-producto').value;
    const varianteSelect = document.getElementById('movimiento-variante');
    
    varianteSelect.innerHTML = '<option value="">Sin variante específica</option>';
    
    if (productoId && filteredInventario) {
        // Get unique variants from current inventory data
        const variantes = [];
        const seenVariants = new Set();
        
        filteredInventario.forEach(item => {
            const variantKey = item.varianteId;
            if (!seenVariants.has(variantKey)) {
                seenVariants.add(variantKey);
                variantes.push({
                    id: item.varianteId,
                    nombre: item.varianteSku + ' - ' + item.varianteDetalle
                });
            }
        });
        
        variantes.forEach(variante => {
            const option = document.createElement('option');
            option.value = variante.id;
            option.textContent = variante.nombre;
            varianteSelect.appendChild(option);
        });
    }
}

// Update stock info using real inventory data
function updateStockInfo() {
    const productoId = document.getElementById('movimiento-producto').value;
    const varianteId = document.getElementById('movimiento-variante').value;
    const ubicacionId = document.getElementById('movimiento-ubicacion').value;
    
    const stockInfo = document.getElementById('stock-actual-info');
    const stockValue = document.getElementById('stock-actual-value');
    
    if (ubicacionId && filteredInventario) {
        let stockItem = null;
        
        if (varianteId) {
            // Find specific variant in specific location
            stockItem = filteredInventario.find(item => 
                item.varianteId == varianteId && item.ubicacionId == ubicacionId
            );
        } else {
            // Find any items in the specific location
            const items = filteredInventario.filter(item => 
                item.ubicacionId == ubicacionId
            );
            if (items.length > 0) {
                // Calculate total stock for the location
                const totalStock = items.reduce((sum, item) => sum + item.stockActual, 0);
                stockItem = {
                    stockActual: totalStock,
                    ubicacionNombre: items[0].ubicacionNombre,
                    varianteSku: 'Múltiples productos'
                };
            }
        }
        
        if (stockItem) {
            stockValue.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="font-medium">Ubicación:</span>
                        <span>${stockItem.ubicacionNombre}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Producto:</span>
                        <span>${stockItem.varianteSku || 'Múltiples'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-medium">Stock actual:</span>
                        <span class="text-lg font-bold ${stockItem.stockActual <= (stockItem.stockMinimo || 5) ? 'text-red-600' : 'text-green-600'}">${stockItem.stockActual}</span>
                    </div>
                    ${stockItem.stockMinimo ? `
                    <div class="flex justify-between text-sm text-gray-600">
                        <span>Stock mínimo:</span>
                        <span>${stockItem.stockMinimo}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            stockInfo.style.display = 'block';
        } else {
            stockInfo.style.display = 'none';
        }
    } else {
        stockInfo.style.display = 'none';
    }
}

// Update inventario statistics
// Update stats using real inventory data
function updateInventarioStats(inventario) {
    const itemsEnStock = inventario.filter(item => item.stockActual > 0).length;
    
    let stockBajo = 0;
    let agotados = 0;
    let valorTotal = 0;
    
    inventario.forEach(item => {
        if (item.stockActual === 0) {
            agotados++;
        } else if (item.stockActual <= item.stockMinimo) {
            stockBajo++;
        }
        
        valorTotal += item.valorTotal || 0;
    });

    document.getElementById('stat-items-stock').textContent = itemsEnStock;
    document.getElementById('stat-stock-bajo').textContent = stockBajo;
    document.getElementById('stat-agotados').textContent = agotados;
    document.getElementById('stat-valor-total').textContent = `$${valorTotal.toLocaleString()}`;
}

// Render inventario table
function renderInventarioTable(inventario) {
    const tableBody = document.getElementById('inventario-table-body');
    const emptyState = document.getElementById('inventario-empty');
    
    if (inventario.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tableBody.innerHTML = inventario.map(item => {
        let estadoStock = 'Disponible';
        let estadoColor = 'bg-green-100 text-green-800';
        
        if (item.stockActual === 0) {
            estadoStock = 'Agotado';
            estadoColor = 'bg-red-100 text-red-800';
        } else if (item.stockActual <= item.stockMinimo) {
            estadoStock = 'Stock Bajo';
            estadoColor = 'bg-amber-100 text-amber-800';
        }
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${item.productoNombre}</div>
                    <div class="text-sm text-gray-500">${item.varianteSku}</div>
                    <div class="text-xs text-gray-400">${item.varianteDetalle}</div>
                    <div class="text-xs text-blue-600">${item.categoria} | ${item.proveedor}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center">
                        <div class="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                        ${item.ubicacionNombre}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="font-medium text-lg">${item.stockActual}</span>
                    <div class="text-xs text-gray-500">Mín: ${item.stockMinimo}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColor}">
                        ${estadoStock}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="font-medium">$${item.precioUnitario.toLocaleString()}</div>
                    <div class="text-xs text-gray-500">Total: $${item.valorTotal.toLocaleString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editarStock('${item.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="verMovimientos('${item.id}')" class="text-green-600 hover:text-green-900">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter inventario using real data
function filterInventario() {
    const searchTerm = document.getElementById('search-inventario').value.toLowerCase();
    const ubicacionFilter = document.getElementById('filter-ubicacion').value;
    const categoriaFilter = document.getElementById('filter-categoria').value;
    const stockFilter = document.getElementById('filter-stock').value;
    
    if (!filteredInventario || filteredInventario.length === 0) {
        renderInventarioTable([]);
        return;
    }
    
    const filtered = filteredInventario.filter(item => {
        const matchesSearch = !searchTerm || 
            (item.productoNombre && item.productoNombre.toLowerCase().includes(searchTerm)) ||
            (item.varianteSku && item.varianteSku.toLowerCase().includes(searchTerm)) ||
            (item.varianteDetalle && item.varianteDetalle.toLowerCase().includes(searchTerm)) ||
            (item.ubicacionNombre && item.ubicacionNombre.toLowerCase().includes(searchTerm)) ||
            (item.categoria && item.categoria.toLowerCase().includes(searchTerm)) ||
            (item.proveedor && item.proveedor.toLowerCase().includes(searchTerm));
            
        const matchesUbicacion = !ubicacionFilter || item.ubicacionId == ubicacionFilter;
        const matchesCategoria = !categoriaFilter || item.categoria === categoriaFilter;
        
        let matchesStock = true;
        if (stockFilter === 'bajo') {
            matchesStock = item.stockActual <= item.stockMinimo;
        } else if (stockFilter === 'agotado') {
            matchesStock = item.stockActual === 0;
        }
        
        return matchesSearch && matchesUbicacion && matchesCategoria && matchesStock;
    });
    
    renderInventarioTable(filtered);
    updateInventarioStats(filtered);
}
            
        const matchesUbicacion = !ubicacionFilter || item.ubicacionId === ubicacionFilter;
        const matchesCategoria = !categoriaFilter || (producto && producto.categoriaId === categoriaFilter);
        
        let matchesStock = true;
        if (stockFilter) {
            const stockMinimo = producto?.stockMinimo || 0;
            switch (stockFilter) {
                case 'bajo':
                    matchesStock = item.cantidad <= stockMinimo && stockMinimo > 0 && item.cantidad > 0;
                    break;
                case 'agotado':
                    matchesStock = item.cantidad === 0;
                    break;
                case 'disponible':
                    matchesStock = item.cantidad > 0;
                    break;
            }
        }
        
        return matchesSearch && matchesUbicacion && matchesCategoria && matchesStock;
    });
    
    filteredInventario = filtered;
    renderInventarioTable(filtered);
    updateInventarioStats(filtered);
}

// Open movimiento modal
function openMovimientoModal(tipo, productoId = '', varianteId = '', ubicacionId = '') {
    const modal = document.getElementById('movimiento-modal');
    const title = document.getElementById('movimiento-modal-title');
    const submitBtn = document.getElementById('movimiento-submit-btn');
    const form = document.getElementById('movimiento-form');
    
    // Reset form
    form.reset();
    
    // Set modal title and styling based on type
    if (tipo === 'ingreso') {
        title.textContent = 'Ingreso de Inventario';
        submitBtn.className = 'px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md mobile-button';
        submitBtn.textContent = 'Registrar Ingreso';
    } else {
        title.textContent = 'Salida de Inventario';
        submitBtn.className = 'px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md mobile-button';
        submitBtn.textContent = 'Registrar Salida';
    }
    
    document.getElementById('movimiento-tipo').value = tipo;
    
    // Pre-fill values if provided
    if (productoId) {
        document.getElementById('movimiento-producto').value = productoId;
        updateVariantesSelect();
        if (varianteId) {
            document.getElementById('movimiento-variante').value = varianteId;
        }
        if (ubicacionId) {
            document.getElementById('movimiento-ubicacion').value = ubicacionId;
        }
        updateStockInfo();
    }
    
    modal.style.display = 'flex';
}

// Close movimiento modal
function closeMovimientoModal() {
    document.getElementById('movimiento-modal').style.display = 'none';
}

// Handle movimiento form submission
async function handleMovimientoSubmit(e) {
    e.preventDefault();
    
    try {
        const tipo = document.getElementById('movimiento-tipo').value;
        const productoId = document.getElementById('movimiento-producto').value;
        const varianteId = document.getElementById('movimiento-variante').value || null;
        const ubicacionId = document.getElementById('movimiento-ubicacion').value;
        const cantidad = parseInt(document.getElementById('movimiento-cantidad').value);
        const motivo = document.getElementById('movimiento-motivo').value || null;
        
        // Validate for salida that there's enough stock
        if (tipo === 'salida') {
            const inventario = filterData(app.data, 'inventario');
            const stockItem = inventario.find(item => 
                item.productoId === productoId && 
                item.ubicacionId === ubicacionId &&
                (varianteId ? item.varianteId === varianteId : !item.varianteId)
            );
            
            const stockActual = stockItem ? stockItem.cantidad : 0;
            if (cantidad > stockActual) {
                showToast(`No hay suficiente stock. Stock actual: ${stockActual}`, 'error');
                return;
            }
        }
        
        // Create movement record
        const movimientoData = {
            tipo: 'movimiento',
            tipoMovimiento: tipo,
            productoId,
            varianteId,
            ubicacionId,
            cantidad: tipo === 'salida' ? -cantidad : cantidad,
            motivo,
            fecha: new Date().toISOString()
        };
        
        const result = await app.sdk.create(movimientoData);
        
        if (result.isOk) {
            closeMovimientoModal();
            showToast(`${tipo === 'ingreso' ? 'Ingreso' : 'Salida'} registrado correctamente`, 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error saving movimiento:', error);
        showToast('Error registrando movimiento: ' + error.message, 'error');
    }
}