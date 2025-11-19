/**
 * Módulo de Movimientos para XentraStock v2.0
 */

// HTML template for movimientos section
function getMovimientosHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Movimientos de Inventario</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Historial completo de todos los movimientos de inventario.
                    </p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button id="export-movimientos" type="button" class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Exportar
                    </button>
                </div>
            </div>

            <!-- Filters and search -->
            <div class="mt-6">
                <div class="flex flex-col lg:flex-row gap-4">
                    <div class="flex-1">
                        <label for="search-movimientos" class="sr-only">Buscar movimientos</label>
                        <div class="relative">
                            <input type="text" id="search-movimientos" placeholder="Buscar movimientos..." 
                                   class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mobile-input">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <select id="filter-tipo-movimiento" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todos los tipos</option>
                            <option value="ingreso">Ingresos</option>
                            <option value="salida">Salidas</option>
                            <option value="transferencia">Transferencias</option>
                            <option value="ajuste">Ajustes</option>
                        </select>
                        <select id="filter-ubicacion" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todas las ubicaciones</option>
                        </select>
                        <select id="filter-fecha" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todo el período</option>
                            <option value="hoy">Hoy</option>
                            <option value="semana">Esta semana</option>
                            <option value="mes">Este mes</option>
                            <option value="trimestre">Este trimestre</option>
                        </select>
                        <button id="refresh-movimientos" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mobile-button">
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
                                    <dt class="text-sm font-medium text-gray-500 truncate">Total Movimientos</dt>
                                    <dd id="stat-total-movimientos" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <span class="text-white">📈</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Ingresos</dt>
                                    <dd id="stat-ingresos" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <span class="text-white">📉</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Salidas</dt>
                                    <dd id="stat-salidas" class="text-lg font-medium text-gray-900">-</dd>
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
                                    <span class="text-white">🔄</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Transferencias</dt>
                                    <dd id="stat-transferencias" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Movimientos table -->
            <div class="mt-8 flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ubicación
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Motivo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="movimientos-table-body" class="bg-white divide-y divide-gray-200">
                                    <!-- Content will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div class="mt-6 flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button id="prev-page-mobile" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Anterior
                    </button>
                    <button id="next-page-mobile" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Siguiente
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Mostrando
                            <span id="page-info-start" class="font-medium">1</span>
                            a
                            <span id="page-info-end" class="font-medium">10</span>
                            de
                            <span id="page-info-total" class="font-medium">0</span>
                            resultados
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button id="prev-page" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span class="sr-only">Anterior</span>
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <div id="page-numbers" class="flex">
                                <!-- Page numbers will be generated here -->
                            </div>
                            <button id="next-page" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                <span class="sr-only">Siguiente</span>
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div id="movimientos-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
                <p class="mt-1 text-sm text-gray-500">Los movimientos aparecerán aquí cuando realices operaciones de inventario.</p>
            </div>
        </div>
    `;
}

// Global variables for pagination and filtering
let filteredMovimientos = [];
let currentPage = 1;
const itemsPerPage = 50;

// Initialize movimientos section
async function initMovimientos() {
    setupMovimientosEventListeners();
    await loadMovimientosData();
    await loadSelectOptions();
}

// Setup event listeners for movimientos
function setupMovimientosEventListeners() {
    // Export button
    document.getElementById('export-movimientos').addEventListener('click', exportMovimientos);

    // Refresh button
    document.getElementById('refresh-movimientos').addEventListener('click', () => {
        loadMovimientosData();
    });

    // Search input
    const searchInput = document.getElementById('search-movimientos');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            filterMovimientos();
        }, 300);
    });

    // Filter selects
    document.getElementById('filter-tipo-movimiento').addEventListener('change', () => {
        currentPage = 1;
        filterMovimientos();
    });
    document.getElementById('filter-ubicacion').addEventListener('change', () => {
        currentPage = 1;
        filterMovimientos();
    });
    document.getElementById('filter-fecha').addEventListener('change', () => {
        currentPage = 1;
        filterMovimientos();
    });

    // Pagination buttons
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderMovimientosTable();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredMovimientos.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderMovimientosTable();
        }
    });
    
    document.getElementById('prev-page-mobile').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderMovimientosTable();
        }
    });
    
    document.getElementById('next-page-mobile').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredMovimientos.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderMovimientosTable();
        }
    });
}

// Load movimientos data
async function loadMovimientosData() {
    try {
        const movimientos = filterData(app.data, 'movimiento');
        // Sort by date descending (newest first)
        movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        filteredMovimientos = movimientos;
        currentPage = 1;
        renderMovimientosTable();
        updateMovimientosStats(movimientos);
        
    } catch (error) {
        console.error('Error loading movimientos:', error);
        showToast('Error cargando movimientos: ' + error.message, 'error');
    }
}

// Load select options
async function loadSelectOptions() {
    try {
        // Load locations for filter
        const ubicaciones = filterData(app.data, 'ubicacion');
        const ubicacionSelect = document.getElementById('filter-ubicacion');
        ubicacionSelect.innerHTML = '<option value="">Todas las ubicaciones</option>';
        ubicaciones.forEach(ubicacion => {
            const option = document.createElement('option');
            option.value = ubicacion.id;
            option.textContent = ubicacion.nombre;
            ubicacionSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading select options:', error);
    }
}

// Update movimientos statistics
function updateMovimientosStats(movimientos) {
    const total = movimientos.length;
    const ingresos = movimientos.filter(m => m.tipoMovimiento === 'ingreso' || m.cantidad > 0).length;
    const salidas = movimientos.filter(m => m.tipoMovimiento === 'salida' || (m.cantidad < 0 && m.tipoMovimiento !== 'transferencia')).length;
    const transferencias = movimientos.filter(m => m.tipoMovimiento === 'transferencia').length;

    document.getElementById('stat-total-movimientos').textContent = total;
    document.getElementById('stat-ingresos').textContent = ingresos;
    document.getElementById('stat-salidas').textContent = salidas;
    document.getElementById('stat-transferencias').textContent = transferencias;
}

// Render movimientos table with pagination
function renderMovimientosTable() {
    const tableBody = document.getElementById('movimientos-table-body');
    const emptyState = document.getElementById('movimientos-empty');
    
    if (filteredMovimientos.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        updatePaginationInfo(0, 0, 0);
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Calculate pagination
    const totalItems = filteredMovimientos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const pageMovimientos = filteredMovimientos.slice(startIndex, endIndex);
    
    const productos = filterData(app.data, 'producto');
    const variantes = filterData(app.data, 'variante');
    const ubicaciones = filterData(app.data, 'ubicacion');
    
    tableBody.innerHTML = pageMovimientos.map(movimiento => {
        const producto = productos.find(p => p.id === movimiento.productoId);
        const variante = variantes.find(v => v.id === movimiento.varianteId);
        const ubicacion = ubicaciones.find(u => u.id === movimiento.ubicacionId);
        
        let tipoDisplay = 'Movimiento';
        let tipoColor = 'bg-gray-100 text-gray-800';
        let cantidadDisplay = movimiento.cantidad;
        
        switch(movimiento.tipoMovimiento) {
            case 'ingreso':
                tipoDisplay = 'Ingreso';
                tipoColor = 'bg-green-100 text-green-800';
                cantidadDisplay = `+${Math.abs(movimiento.cantidad)}`;
                break;
            case 'salida':
                tipoDisplay = 'Salida';
                tipoColor = 'bg-red-100 text-red-800';
                cantidadDisplay = `-${Math.abs(movimiento.cantidad)}`;
                break;
            case 'transferencia':
                tipoDisplay = 'Transferencia';
                tipoColor = 'bg-blue-100 text-blue-800';
                break;
            case 'ajuste':
                tipoDisplay = 'Ajuste';
                tipoColor = 'bg-amber-100 text-amber-800';
                cantidadDisplay = movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : `${movimiento.cantidad}`;
                break;
        }
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${movimiento.fecha ? formatDateTime(movimiento.fecha) : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tipoColor}">
                        ${tipoDisplay}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${producto ? producto.nombre : 'Producto no encontrado'}</div>
                    ${variante ? `<div class="text-sm text-gray-500">${variante.nombre}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${ubicacion ? ubicacion.nombre : 'Ubicación no encontrada'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium ${movimiento.cantidad > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${cantidadDisplay}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                    ${movimiento.motivo || '-'}
                </td>
            </tr>
        `;
    }).join('');
    
    updatePaginationInfo(startIndex + 1, endIndex, totalItems);
    renderPaginationControls(totalPages);
}

// Update pagination info
function updatePaginationInfo(start, end, total) {
    document.getElementById('page-info-start').textContent = start;
    document.getElementById('page-info-end').textContent = end;
    document.getElementById('page-info-total').textContent = total;
}

// Render pagination controls
function renderPaginationControls(totalPages) {
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';
    
    // Show max 5 page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            i === currentPage 
                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
        }`;
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            renderMovimientosTable();
        });
        pageNumbers.appendChild(button);
    }
    
    // Enable/disable navigation buttons
    const prevButtons = [document.getElementById('prev-page'), document.getElementById('prev-page-mobile')];
    const nextButtons = [document.getElementById('next-page'), document.getElementById('next-page-mobile')];
    
    prevButtons.forEach(btn => {
        btn.disabled = currentPage === 1;
        btn.className = btn.className.replace(/ opacity-50/, '');
        if (currentPage === 1) {
            btn.className += ' opacity-50';
        }
    });
    
    nextButtons.forEach(btn => {
        btn.disabled = currentPage === totalPages;
        btn.className = btn.className.replace(/ opacity-50/, '');
        if (currentPage === totalPages) {
            btn.className += ' opacity-50';
        }
    });
}

// Filter movimientos
function filterMovimientos() {
    const searchTerm = document.getElementById('search-movimientos').value.toLowerCase();
    const tipoFilter = document.getElementById('filter-tipo-movimiento').value;
    const ubicacionFilter = document.getElementById('filter-ubicacion').value;
    const fechaFilter = document.getElementById('filter-fecha').value;
    
    const movimientos = filterData(app.data, 'movimiento');
    const productos = filterData(app.data, 'producto');
    const variantes = filterData(app.data, 'variante');
    const ubicaciones = filterData(app.data, 'ubicacion');
    
    let filtered = movimientos.filter(movimiento => {
        const producto = productos.find(p => p.id === movimiento.productoId);
        const variante = variantes.find(v => v.id === movimiento.varianteId);
        const ubicacion = ubicaciones.find(u => u.id === movimiento.ubicacionId);
        
        const matchesSearch = !searchTerm || 
            (producto && producto.nombre.toLowerCase().includes(searchTerm)) ||
            (variante && variante.nombre.toLowerCase().includes(searchTerm)) ||
            (ubicacion && ubicacion.nombre.toLowerCase().includes(searchTerm)) ||
            (movimiento.motivo && movimiento.motivo.toLowerCase().includes(searchTerm));
            
        const matchesTipo = !tipoFilter || movimiento.tipoMovimiento === tipoFilter;
        const matchesUbicacion = !ubicacionFilter || movimiento.ubicacionId === ubicacionFilter;
        
        let matchesFecha = true;
        if (fechaFilter) {
            const movimientoFecha = new Date(movimiento.fecha);
            const hoy = new Date();
            
            switch(fechaFilter) {
                case 'hoy':
                    matchesFecha = movimientoFecha.toDateString() === hoy.toDateString();
                    break;
                case 'semana':
                    const inicioSemana = new Date(hoy);
                    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
                    matchesFecha = movimientoFecha >= inicioSemana;
                    break;
                case 'mes':
                    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    matchesFecha = movimientoFecha >= inicioMes;
                    break;
                case 'trimestre':
                    const inicioTrimestre = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1);
                    matchesFecha = movimientoFecha >= inicioTrimestre;
                    break;
            }
        }
        
        return matchesSearch && matchesTipo && matchesUbicacion && matchesFecha;
    });
    
    // Sort by date descending
    filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    filteredMovimientos = filtered;
    renderMovimientosTable();
    updateMovimientosStats(filtered);
}

// Export movimientos to CSV
function exportMovimientos() {
    try {
        const productos = filterData(app.data, 'producto');
        const variantes = filterData(app.data, 'variante');
        const ubicaciones = filterData(app.data, 'ubicacion');
        
        // Prepare CSV data
        const headers = ['Fecha', 'Tipo', 'Producto', 'Variante', 'Ubicación', 'Cantidad', 'Motivo'];
        const rows = filteredMovimientos.map(movimiento => {
            const producto = productos.find(p => p.id === movimiento.productoId);
            const variante = variantes.find(v => v.id === movimiento.varianteId);
            const ubicacion = ubicaciones.find(u => u.id === movimiento.ubicacionId);
            
            return [
                movimiento.fecha ? formatDateTime(movimiento.fecha) : '',
                movimiento.tipoMovimiento || '',
                producto ? producto.nombre : '',
                variante ? variante.nombre : '',
                ubicacion ? ubicacion.nombre : '',
                movimiento.cantidad || 0,
                movimiento.motivo || ''
            ];
        });
        
        // Create CSV content
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `movimientos_inventario_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Movimientos exportados correctamente', 'success');
        
    } catch (error) {
        console.error('Error exporting movimientos:', error);
        showToast('Error exportando movimientos: ' + error.message, 'error');
    }
}