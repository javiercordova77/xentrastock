/**
 * Módulo de Transferencias para XentraStock v2.0
 */

// HTML template for transferencias section
function getTransferenciasHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Transferencias</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Gestiona las transferencias de productos entre ubicaciones.
                    </p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button id="add-transferencia" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                        Nueva Transferencia
                    </button>
                </div>
            </div>

            <!-- Filters and search -->
            <div class="mt-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <label for="search-transferencias" class="sr-only">Buscar transferencias</label>
                        <div class="relative">
                            <input type="text" id="search-transferencias" placeholder="Buscar transferencias..." 
                                   class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mobile-input">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <select id="filter-estado" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_transito">En Tránsito</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                        <button id="refresh-transferencias" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mobile-button">
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
                                    <span class="text-white">📋</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Total</dt>
                                    <dd id="stat-total-transferencias" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <span class="text-white">⏳</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Pendientes</dt>
                                    <dd id="stat-pendientes" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">✅</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Completadas</dt>
                                    <dd id="stat-completadas" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <span class="text-white">🚚</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">En Tránsito</dt>
                                    <dd id="stat-en-transito" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transferencias table -->
            <div class="mt-8 flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transferencia
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Origen → Destino
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th scope="col" class="relative px-6 py-3">
                                            <span class="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="transferencias-table-body" class="bg-white divide-y divide-gray-200">
                                    <!-- Content will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div id="transferencias-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay transferencias</h3>
                <p class="mt-1 text-sm text-gray-500">Comienza creando tu primera transferencia.</p>
                <div class="mt-6">
                    <button type="button" onclick="openTransferenciaModal()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                        Nueva Transferencia
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal for creating/editing transferencia -->
        <div id="transferencia-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="transferencia-modal-title" class="text-lg font-medium text-gray-900">Nueva Transferencia</h2>
                    <button type="button" onclick="closeTransferenciaModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="transferencia-form" class="space-y-6">
                    <input type="hidden" id="transferencia-id">
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="transferencia-producto" class="block text-sm font-medium text-gray-700">Producto *</label>
                            <select id="transferencia-producto" required 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Seleccionar producto</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="transferencia-variante" class="block text-sm font-medium text-gray-700">Variante</label>
                            <select id="transferencia-variante" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Sin variante específica</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="transferencia-origen" class="block text-sm font-medium text-gray-700">Ubicación Origen *</label>
                            <select id="transferencia-origen" required 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Seleccionar origen</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="transferencia-destino" class="block text-sm font-medium text-gray-700">Ubicación Destino *</label>
                            <select id="transferencia-destino" required 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Seleccionar destino</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label for="transferencia-cantidad" class="block text-sm font-medium text-gray-700">Cantidad *</label>
                        <input type="number" id="transferencia-cantidad" required min="1" step="1" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div id="stock-origen-info" class="bg-blue-50 p-4 rounded-md" style="display: none;">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-blue-800">Stock en Origen</h3>
                                <div id="stock-origen-value" class="mt-2 text-sm text-blue-700"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label for="transferencia-motivo" class="block text-sm font-medium text-gray-700">Motivo/Observaciones</label>
                        <textarea id="transferencia-motivo" rows="3" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Describe el motivo de la transferencia..."></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeTransferenciaModal()" 
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md mobile-button">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md mobile-button">
                            Crear Transferencia
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Global variables for filtering
let filteredTransferencias = [];

// Initialize transferencias section
async function initTransferencias() {
    setupTransferenciasEventListeners();
    await loadTransferenciasData();
    await loadSelectOptions();
}

// Setup event listeners for transferencias
function setupTransferenciasEventListeners() {
    // Add button
    document.getElementById('add-transferencia').addEventListener('click', () => {
        openTransferenciaModal();
    });

    // Refresh button
    document.getElementById('refresh-transferencias').addEventListener('click', () => {
        loadTransferenciasData();
    });

    // Search input
    const searchInput = document.getElementById('search-transferencias');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterTransferencias();
        }, 300);
    });

    // Filter select
    document.getElementById('filter-estado').addEventListener('change', filterTransferencias);

    // Form submission
    document.getElementById('transferencia-form').addEventListener('submit', handleTransferenciaSubmit);

    // Product selection change
    document.getElementById('transferencia-producto').addEventListener('change', updateVariantesSelect);
    document.getElementById('transferencia-producto').addEventListener('change', updateStockOrigenInfo);
    document.getElementById('transferencia-variante').addEventListener('change', updateStockOrigenInfo);
    document.getElementById('transferencia-origen').addEventListener('change', updateStockOrigenInfo);
}

// Load transferencias data
async function loadTransferenciasData() {
    try {
        const transferencias = filterData(app.data, 'transferencia');
        filteredTransferencias = transferencias;
        renderTransferenciasTable(transferencias);
        updateTransferenciasStats(transferencias);
        
    } catch (error) {
        console.error('Error loading transferencias:', error);
        showToast('Error cargando transferencias: ' + error.message, 'error');
    }
}

// Load select options
async function loadSelectOptions() {
    try {
        // Load products
        const productos = filterData(app.data, 'producto').filter(p => p.activo !== false);
        const productoSelect = document.getElementById('transferencia-producto');
        productoSelect.innerHTML = '<option value="">Seleccionar producto</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = producto.nombre;
            productoSelect.appendChild(option);
        });

        // Load locations
        const ubicaciones = filterData(app.data, 'ubicacion');
        const ubicacionSelects = ['transferencia-origen', 'transferencia-destino'];
        
        ubicacionSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            select.innerHTML = `<option value="">Seleccionar ${selectId.includes('origen') ? 'origen' : 'destino'}</option>`;
            
            ubicaciones.forEach(ubicacion => {
                const option = document.createElement('option');
                option.value = ubicacion.id;
                option.textContent = ubicacion.nombre;
                select.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('Error loading select options:', error);
    }
}

// Update variantes select based on selected product
function updateVariantesSelect() {
    const productoId = document.getElementById('transferencia-producto').value;
    const varianteSelect = document.getElementById('transferencia-variante');
    
    varianteSelect.innerHTML = '<option value="">Sin variante específica</option>';
    
    if (productoId) {
        const variantes = filterData(app.data, 'variante').filter(v => 
            v.productoId === productoId && v.activa !== false
        );
        
        variantes.forEach(variante => {
            const option = document.createElement('option');
            option.value = variante.id;
            option.textContent = variante.nombre;
            varianteSelect.appendChild(option);
        });
    }
}

// Update stock origen info
function updateStockOrigenInfo() {
    const productoId = document.getElementById('transferencia-producto').value;
    const varianteId = document.getElementById('transferencia-variante').value;
    const origenId = document.getElementById('transferencia-origen').value;
    
    const stockInfo = document.getElementById('stock-origen-info');
    const stockValue = document.getElementById('stock-origen-value');
    
    if (productoId && origenId) {
        const inventario = filterData(app.data, 'inventario');
        const stockItem = inventario.find(item => 
            item.productoId === productoId && 
            item.ubicacionId === origenId &&
            (varianteId ? item.varianteId === varianteId : !item.varianteId)
        );
        
        if (stockItem) {
            stockValue.textContent = `${stockItem.cantidad} unidades disponibles`;
            stockInfo.style.display = 'block';
        } else {
            stockValue.textContent = 'Sin stock disponible en ubicación origen';
            stockInfo.style.display = 'block';
        }
    } else {
        stockInfo.style.display = 'none';
    }
}

// Update transferencias statistics
function updateTransferenciasStats(transferencias) {
    const total = transferencias.length;
    const pendientes = transferencias.filter(t => t.estado === 'pendiente').length;
    const completadas = transferencias.filter(t => t.estado === 'completada').length;
    const enTransito = transferencias.filter(t => t.estado === 'en_transito').length;

    document.getElementById('stat-total-transferencias').textContent = total;
    document.getElementById('stat-pendientes').textContent = pendientes;
    document.getElementById('stat-completadas').textContent = completadas;
    document.getElementById('stat-en-transito').textContent = enTransito;
}

// Render transferencias table
function renderTransferenciasTable(transferencias) {
    const tableBody = document.getElementById('transferencias-table-body');
    const emptyState = document.getElementById('transferencias-empty');
    
    if (transferencias.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const productos = filterData(app.data, 'producto');
    const variantes = filterData(app.data, 'variante');
    const ubicaciones = filterData(app.data, 'ubicacion');
    
    tableBody.innerHTML = transferencias.map(transferencia => {
        const producto = productos.find(p => p.id === transferencia.productoId);
        const variante = variantes.find(v => v.id === transferencia.varianteId);
        const origen = ubicaciones.find(u => u.id === transferencia.origenId);
        const destino = ubicaciones.find(u => u.id === transferencia.destinoId);
        
        let estadoColor = 'bg-gray-100 text-gray-800';
        switch(transferencia.estado) {
            case 'pendiente':
                estadoColor = 'bg-amber-100 text-amber-800';
                break;
            case 'en_transito':
                estadoColor = 'bg-blue-100 text-blue-800';
                break;
            case 'completada':
                estadoColor = 'bg-green-100 text-green-800';
                break;
            case 'cancelada':
                estadoColor = 'bg-red-100 text-red-800';
                break;
        }
        
        const estadoTexto = {
            'pendiente': 'Pendiente',
            'en_transito': 'En Tránsito',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        }[transferencia.estado] || transferencia.estado;
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">#${transferencia.id?.slice(-8) || 'N/A'}</div>
                    ${transferencia.motivo ? `<div class="text-sm text-gray-500">${transferencia.motivo}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${producto ? producto.nombre : 'Producto no encontrado'}</div>
                    ${variante ? `<div class="text-sm text-gray-500">${variante.nombre}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${origen ? origen.nombre : 'N/A'} → ${destino ? destino.nombre : 'N/A'}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="font-medium">${transferencia.cantidad}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoColor}">
                        ${estadoTexto}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transferencia.fecha ? formatDate(transferencia.fecha) : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${transferencia.estado === 'pendiente' ? `
                        <button onclick="completarTransferencia('${transferencia.id}')" 
                                class="text-green-600 hover:text-green-900 mr-4">
                            Completar
                        </button>
                        <button onclick="cancelarTransferencia('${transferencia.id}')" 
                                class="text-red-600 hover:text-red-900">
                            Cancelar
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Filter transferencias
function filterTransferencias() {
    const searchTerm = document.getElementById('search-transferencias').value.toLowerCase();
    const estadoFilter = document.getElementById('filter-estado').value;
    
    const transferencias = filterData(app.data, 'transferencia');
    const productos = filterData(app.data, 'producto');
    const variantes = filterData(app.data, 'variante');
    const ubicaciones = filterData(app.data, 'ubicacion');
    
    const filtered = transferencias.filter(transferencia => {
        const producto = productos.find(p => p.id === transferencia.productoId);
        const variante = variantes.find(v => v.id === transferencia.varianteId);
        const origen = ubicaciones.find(u => u.id === transferencia.origenId);
        const destino = ubicaciones.find(u => u.id === transferencia.destinoId);
        
        const matchesSearch = !searchTerm || 
            (producto && producto.nombre.toLowerCase().includes(searchTerm)) ||
            (variante && variante.nombre.toLowerCase().includes(searchTerm)) ||
            (origen && origen.nombre.toLowerCase().includes(searchTerm)) ||
            (destino && destino.nombre.toLowerCase().includes(searchTerm)) ||
            (transferencia.motivo && transferencia.motivo.toLowerCase().includes(searchTerm));
            
        const matchesEstado = !estadoFilter || transferencia.estado === estadoFilter;
        
        return matchesSearch && matchesEstado;
    });
    
    filteredTransferencias = filtered;
    renderTransferenciasTable(filtered);
    updateTransferenciasStats(filtered);
}

// Open transferencia modal
function openTransferenciaModal(transferencia = null) {
    const modal = document.getElementById('transferencia-modal');
    const title = document.getElementById('transferencia-modal-title');
    const form = document.getElementById('transferencia-form');
    
    // Reset form
    form.reset();
    
    if (transferencia) {
        title.textContent = 'Editar Transferencia';
        // Fill form with transferencia data
        // ... implementation for editing
    } else {
        title.textContent = 'Nueva Transferencia';
        document.getElementById('transferencia-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Close transferencia modal
function closeTransferenciaModal() {
    document.getElementById('transferencia-modal').style.display = 'none';
}

// Handle transferencia form submission
async function handleTransferenciaSubmit(e) {
    e.preventDefault();
    
    try {
        const productoId = document.getElementById('transferencia-producto').value;
        const varianteId = document.getElementById('transferencia-variante').value || null;
        const origenId = document.getElementById('transferencia-origen').value;
        const destinoId = document.getElementById('transferencia-destino').value;
        const cantidad = parseInt(document.getElementById('transferencia-cantidad').value);
        const motivo = document.getElementById('transferencia-motivo').value || null;
        
        // Validate that origen and destino are different
        if (origenId === destinoId) {
            showToast('La ubicación de origen debe ser diferente a la de destino', 'error');
            return;
        }
        
        // Validate stock availability
        const inventario = filterData(app.data, 'inventario');
        const stockItem = inventario.find(item => 
            item.productoId === productoId && 
            item.ubicacionId === origenId &&
            (varianteId ? item.varianteId === varianteId : !item.varianteId)
        );
        
        const stockDisponible = stockItem ? stockItem.cantidad : 0;
        if (cantidad > stockDisponible) {
            showToast(`No hay suficiente stock. Stock disponible: ${stockDisponible}`, 'error');
            return;
        }
        
        // Create transferencia record
        const transferenciaData = {
            tipo: 'transferencia',
            productoId,
            varianteId,
            origenId,
            destinoId,
            cantidad,
            motivo,
            estado: 'pendiente',
            fecha: new Date().toISOString()
        };
        
        const result = await app.sdk.create(transferenciaData);
        
        if (result.isOk) {
            closeTransferenciaModal();
            showToast('Transferencia creada correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error saving transferencia:', error);
        showToast('Error creando transferencia: ' + error.message, 'error');
    }
}

// Complete transferencia
async function completarTransferencia(transferenciaId) {
    if (!confirm('¿Confirmar que la transferencia ha sido completada?')) {
        return;
    }
    
    try {
        const transferencia = app.data.find(item => item.id === transferenciaId && item.tipo === 'transferencia');
        if (!transferencia) {
            showToast('Transferencia no encontrada', 'error');
            return;
        }
        
        // Update transferencia status
        const updatedTransferencia = {
            ...transferencia,
            estado: 'completada',
            fechaCompletada: new Date().toISOString()
        };
        
        const result = await app.sdk.update(updatedTransferencia);
        
        if (result.isOk) {
            showToast('Transferencia completada correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error completing transferencia:', error);
        showToast('Error completando transferencia: ' + error.message, 'error');
    }
}

// Cancel transferencia
async function cancelarTransferencia(transferenciaId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta transferencia?')) {
        return;
    }
    
    try {
        const transferencia = app.data.find(item => item.id === transferenciaId && item.tipo === 'transferencia');
        if (!transferencia) {
            showToast('Transferencia no encontrada', 'error');
            return;
        }
        
        // Update transferencia status
        const updatedTransferencia = {
            ...transferencia,
            estado: 'cancelada',
            fechaCancelada: new Date().toISOString()
        };
        
        const result = await app.sdk.update(updatedTransferencia);
        
        if (result.isOk) {
            showToast('Transferencia cancelada correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error canceling transferencia:', error);
        showToast('Error cancelando transferencia: ' + error.message, 'error');
    }
}