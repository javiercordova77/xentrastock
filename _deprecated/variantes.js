/**
 * Módulo de Variantes para XentraStock v2.0
 */

// HTML template for variantes section
function getVariantesHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Variantes de Productos</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Gestiona las diferentes presentaciones y variaciones de tus productos.
                    </p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button id="add-variantes" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Variante
                    </button>
                </div>
            </div>

            <!-- Filters and search -->
            <div class="mt-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <label for="search-variantes" class="sr-only">Buscar variantes</label>
                        <div class="relative">
                            <input type="text" id="search-variantes" placeholder="Buscar variantes..." 
                                   class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mobile-input">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <select id="filter-producto" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todos los productos</option>
                        </select>
                        <button id="refresh-variantes" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mobile-button">
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
                                    <span class="text-white">🎭</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Total Variantes</dt>
                                    <dd id="stat-total-variantes" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <dt class="text-sm font-medium text-gray-500 truncate">Activas</dt>
                                    <dd id="stat-variantes-activas" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <span class="text-white">📦</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Productos</dt>
                                    <dd id="stat-productos-con-variantes" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <span class="text-white">💰</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Promedio Precio</dt>
                                    <dd id="stat-precio-promedio" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Variantes table -->
            <div class="mt-8 flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto / Variante
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Código/SKU
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unidad
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" class="relative px-6 py-3">
                                            <span class="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="variantes-table-body" class="bg-white divide-y divide-gray-200">
                                    <!-- Content will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div id="variantes-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2M9 3h2a2 2 0 012 2v12a4 4 0 01-2 2h-2m8-16a2 2 0 012 2v12a4 4 0 01-2 2h-2"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay variantes</h3>
                <p class="mt-1 text-sm text-gray-500">Comienza agregando variantes a tus productos.</p>
                <div class="mt-6">
                    <button type="button" onclick="openVarianteModal()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Variante
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal for adding/editing variante -->
        <div id="variante-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="variante-modal-title" class="text-lg font-medium text-gray-900">Agregar Variante</h2>
                    <button type="button" onclick="closeVarianteModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="variante-form" class="space-y-6">
                    <input type="hidden" id="variante-id">
                    
                    <div>
                        <label for="variante-producto" class="block text-sm font-medium text-gray-700">Producto Base *</label>
                        <select id="variante-producto" required 
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Seleccionar producto</option>
                        </select>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="variante-nombre" class="block text-sm font-medium text-gray-700">Nombre de la Variante *</label>
                            <input type="text" id="variante-nombre" required 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input"
                                   placeholder="Ej: Talla XL, Color Rojo, 500ml">
                        </div>
                        
                        <div>
                            <label for="variante-codigo" class="block text-sm font-medium text-gray-700">Código/SKU Específico</label>
                            <input type="text" id="variante-codigo" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                    </div>
                    
                    <div>
                        <label for="variante-descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea id="variante-descripcion" rows="3" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                  placeholder="Descripción específica de esta variante"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label for="variante-precio-costo" class="block text-sm font-medium text-gray-700">Precio de Costo</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" id="variante-precio-costo" step="0.01" min="0" 
                                       class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            </div>
                        </div>
                        
                        <div>
                            <label for="variante-precio-venta" class="block text-sm font-medium text-gray-700">Precio de Venta</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" id="variante-precio-venta" step="0.01" min="0" 
                                       class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            </div>
                        </div>
                        
                        <div>
                            <label for="variante-unidad-medida" class="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                            <select id="variante-unidad-medida" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="unidad">Unidad</option>
                                <option value="kg">Kilogramo</option>
                                <option value="g">Gramo</option>
                                <option value="lb">Libra</option>
                                <option value="lt">Litro</option>
                                <option value="ml">Mililitro</option>
                                <option value="mt">Metro</option>
                                <option value="cm">Centímetro</option>
                                <option value="pz">Pieza</option>
                                <option value="caja">Caja</option>
                                <option value="paquete">Paquete</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="variante-peso" class="block text-sm font-medium text-gray-700">Peso (kg)</label>
                            <input type="number" id="variante-peso" step="0.001" min="0" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                        
                        <div>
                            <label for="variante-volumen" class="block text-sm font-medium text-gray-700">Volumen (L)</label>
                            <input type="number" id="variante-volumen" step="0.001" min="0" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label for="variante-dimensiones-largo" class="block text-sm font-medium text-gray-700">Largo (cm)</label>
                            <input type="number" id="variante-dimensiones-largo" step="0.1" min="0" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                        
                        <div>
                            <label for="variante-dimensiones-ancho" class="block text-sm font-medium text-gray-700">Ancho (cm)</label>
                            <input type="number" id="variante-dimensiones-ancho" step="0.1" min="0" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                        
                        <div>
                            <label for="variante-dimensiones-alto" class="block text-sm font-medium text-gray-700">Alto (cm)</label>
                            <input type="number" id="variante-dimensiones-alto" step="0.1" min="0" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                    </div>
                    
                    <div class="flex items-center">
                        <input id="variante-activa" type="checkbox" checked 
                               class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                        <label for="variante-activa" class="ml-2 block text-sm text-gray-900">
                            Variante activa
                        </label>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeVarianteModal()" 
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md mobile-button">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md mobile-button">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Global variables for filtering
let filteredVariantes = [];

// Initialize variantes section
async function initVariantes() {
    setupVariantesEventListeners();
    await loadVariantesData();
    await loadProductosSelect();
}

// Setup event listeners for variantes
function setupVariantesEventListeners() {
    // Add button
    document.getElementById('add-variantes').addEventListener('click', () => {
        openVarianteModal();
    });

    // Refresh button
    document.getElementById('refresh-variantes').addEventListener('click', () => {
        loadVariantesData();
    });

    // Search input
    const searchInput = document.getElementById('search-variantes');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterVariantes();
        }, 300);
    });

    // Filter select
    document.getElementById('filter-producto').addEventListener('change', filterVariantes);

    // Form submission
    document.getElementById('variante-form').addEventListener('submit', handleVarianteSubmit);
}

// Load variantes data
async function loadVariantesData() {
    try {
        const variantes = filterData(app.data, 'variante');
        filteredVariantes = variantes;
        renderVariantesTable(variantes);
        updateVariantesStats(variantes);
        
    } catch (error) {
        console.error('Error loading variantes:', error);
        showToast('Error cargando variantes: ' + error.message, 'error');
    }
}

// Load productos for select options
async function loadProductosSelect() {
    try {
        const productos = filterData(app.data, 'producto').filter(p => p.activo !== false);
        const productosSelects = ['variante-producto', 'filter-producto'];
        
        productosSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (selectId === 'filter-producto') {
                select.innerHTML = '<option value="">Todos los productos</option>';
            } else {
                select.innerHTML = '<option value="">Seleccionar producto</option>';
            }
            
            productos.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.id;
                option.textContent = producto.nombre;
                select.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('Error loading productos select:', error);
    }
}

// Update variantes statistics
function updateVariantesStats(variantes) {
    const totalVariantes = variantes.length;
    const variantesActivas = variantes.filter(v => v.activa !== false).length;
    
    const productosConVariantes = new Set();
    let totalPrecios = 0;
    let preciosCount = 0;
    
    variantes.forEach(variante => {
        if (variante.productoId) productosConVariantes.add(variante.productoId);
        if (variante.precioVenta && variante.precioVenta > 0) {
            totalPrecios += variante.precioVenta;
            preciosCount++;
        }
    });

    const precioPromedio = preciosCount > 0 ? (totalPrecios / preciosCount).toFixed(2) : '0.00';

    document.getElementById('stat-total-variantes').textContent = totalVariantes;
    document.getElementById('stat-variantes-activas').textContent = variantesActivas;
    document.getElementById('stat-productos-con-variantes').textContent = productosConVariantes.size;
    document.getElementById('stat-precio-promedio').textContent = `$${precioPromedio}`;
}

// Render variantes table
function renderVariantesTable(variantes) {
    const tableBody = document.getElementById('variantes-table-body');
    const emptyState = document.getElementById('variantes-empty');
    
    if (variantes.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const productos = filterData(app.data, 'producto');
    
    tableBody.innerHTML = variantes.map(variante => {
        const producto = productos.find(p => p.id === variante.productoId);
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${producto ? producto.nombre : 'Producto no encontrado'}</div>
                    <div class="text-sm text-gray-500">${variante.nombre}</div>
                    ${variante.descripcion ? `<div class="text-xs text-gray-400">${variante.descripcion}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${variante.codigo || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${variante.precioVenta ? `$${variante.precioVenta.toFixed(2)}` : '-'}
                    ${variante.precioCosto ? `<div class="text-xs text-gray-500">Costo: $${variante.precioCosto.toFixed(2)}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${variante.unidadMedida || 'unidad'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        variante.activa !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${variante.activa !== false ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editVariante('${variante.id}')" 
                            class="text-indigo-600 hover:text-indigo-900 mr-4">
                        Editar
                    </button>
                    <button onclick="deleteVariante('${variante.id}')" 
                            class="text-red-600 hover:text-red-900">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter variantes
function filterVariantes() {
    const searchTerm = document.getElementById('search-variantes').value.toLowerCase();
    const productoFilter = document.getElementById('filter-producto').value;
    
    const variantes = filterData(app.data, 'variante');
    const productos = filterData(app.data, 'producto');
    
    const filtered = variantes.filter(variante => {
        const producto = productos.find(p => p.id === variante.productoId);
        
        const matchesSearch = !searchTerm || 
            variante.nombre.toLowerCase().includes(searchTerm) ||
            (variante.codigo && variante.codigo.toLowerCase().includes(searchTerm)) ||
            (variante.descripcion && variante.descripcion.toLowerCase().includes(searchTerm)) ||
            (producto && producto.nombre.toLowerCase().includes(searchTerm));
            
        const matchesProducto = !productoFilter || variante.productoId === productoFilter;
        
        return matchesSearch && matchesProducto;
    });
    
    filteredVariantes = filtered;
    renderVariantesTable(filtered);
    updateVariantesStats(filtered);
}

// Open variante modal
function openVarianteModal(variante = null) {
    const modal = document.getElementById('variante-modal');
    const title = document.getElementById('variante-modal-title');
    const form = document.getElementById('variante-form');
    
    // Reset form
    form.reset();
    
    if (variante) {
        title.textContent = 'Editar Variante';
        document.getElementById('variante-id').value = variante.id;
        document.getElementById('variante-producto').value = variante.productoId || '';
        document.getElementById('variante-nombre').value = variante.nombre;
        document.getElementById('variante-codigo').value = variante.codigo || '';
        document.getElementById('variante-descripcion').value = variante.descripcion || '';
        document.getElementById('variante-precio-costo').value = variante.precioCosto || '';
        document.getElementById('variante-precio-venta').value = variante.precioVenta || '';
        document.getElementById('variante-unidad-medida').value = variante.unidadMedida || 'unidad';
        document.getElementById('variante-peso').value = variante.peso || '';
        document.getElementById('variante-volumen').value = variante.volumen || '';
        document.getElementById('variante-dimensiones-largo').value = variante.dimensiones?.largo || '';
        document.getElementById('variante-dimensiones-ancho').value = variante.dimensiones?.ancho || '';
        document.getElementById('variante-dimensiones-alto').value = variante.dimensiones?.alto || '';
        document.getElementById('variante-activa').checked = variante.activa !== false;
    } else {
        title.textContent = 'Agregar Variante';
        document.getElementById('variante-id').value = '';
        document.getElementById('variante-unidad-medida').value = 'unidad';
        document.getElementById('variante-activa').checked = true;
    }
    
    modal.style.display = 'flex';
}

// Close variante modal
function closeVarianteModal() {
    document.getElementById('variante-modal').style.display = 'none';
}

// Handle variante form submission
async function handleVarianteSubmit(e) {
    e.preventDefault();
    
    try {
        const dimensiones = {
            largo: parseFloat(document.getElementById('variante-dimensiones-largo').value) || null,
            ancho: parseFloat(document.getElementById('variante-dimensiones-ancho').value) || null,
            alto: parseFloat(document.getElementById('variante-dimensiones-alto').value) || null
        };
        
        // Only include dimensiones if at least one value is provided
        const hasDimensiones = dimensiones.largo || dimensiones.ancho || dimensiones.alto;
        
        const varianteData = {
            productoId: document.getElementById('variante-producto').value,
            nombre: document.getElementById('variante-nombre').value,
            codigo: document.getElementById('variante-codigo').value || null,
            descripcion: document.getElementById('variante-descripcion').value || null,
            precioCosto: parseFloat(document.getElementById('variante-precio-costo').value) || null,
            precioVenta: parseFloat(document.getElementById('variante-precio-venta').value) || null,
            unidadMedida: document.getElementById('variante-unidad-medida').value,
            peso: parseFloat(document.getElementById('variante-peso').value) || null,
            volumen: parseFloat(document.getElementById('variante-volumen').value) || null,
            dimensiones: hasDimensiones ? JSON.stringify(dimensiones) : null,
            activa: document.getElementById('variante-activa').checked
        };
        
        const varianteId = document.getElementById('variante-id').value;
        
        let result;
        if (varianteId) {
            // Update existing variante
            varianteData.id = varianteId;
            varianteData.tipo = 'variante';
            result = await app.sdk.update(varianteData);
        } else {
            // Create new variante
            varianteData.tipo = 'variante';
            result = await app.sdk.create(varianteData);
        }
        
        if (result.isOk) {
            closeVarianteModal();
            showToast(
                varianteId ? 'Variante actualizada correctamente' : 'Variante creada correctamente',
                'success'
            );
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error saving variante:', error);
        showToast('Error guardando variante: ' + error.message, 'error');
    }
}

// Edit variante
function editVariante(varianteId) {
    const variante = app.data.find(item => item.id === varianteId && item.tipo === 'variante');
    if (variante) {
        // Parse dimensiones if it exists
        if (variante.dimensiones && typeof variante.dimensiones === 'string') {
            try {
                variante.dimensiones = JSON.parse(variante.dimensiones);
            } catch (e) {
                variante.dimensiones = {};
            }
        }
        openVarianteModal(variante);
    }
}

// Delete variante
async function deleteVariante(varianteId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta variante?')) {
        return;
    }
    
    try {
        const result = await app.sdk.delete({
            id: varianteId,
            tipo: 'variante'
        });
        
        if (result.isOk) {
            showToast('Variante eliminada correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error deleting variante:', error);
        showToast('Error eliminando variante: ' + error.message, 'error');
    }
}